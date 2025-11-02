from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import shutil
import uuid
from pathlib import Path
import zipfile
import io
from PyPDF2 import PdfReader, PdfWriter

app = FastAPI(title="PDF Splitter & Merger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://my-pdf-toolkit.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = Path("temp_files")
TEMP_DIR.mkdir(exist_ok=True)


def cleanup_temp_file(file_path: str):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Error cleaning up {file_path}: {e}")


def parse_page_ranges(ranges_str: str, total_pages: int) -> List[int]:
    pages = []
    ranges = ranges_str.split(',')

    for range_part in ranges:
        range_part = range_part.strip()
        if '-' in range_part:
            start, end = range_part.split('-')
            start = int(start.strip())
            end = int(end.strip())
            if start < 1 or end > total_pages or start > end:
                raise ValueError(f"Invalid range: {range_part}")
            pages.extend(range(start - 1, end))
        else:
            page_num = int(range_part.strip())
            if page_num < 1 or page_num > total_pages:
                raise ValueError(f"Invalid page number: {page_num}")
            pages.append(page_num - 1)

    return sorted(set(pages))


@app.post("/split")
async def split_pdf(
    file: UploadFile = File(...),
    page_ranges: str = Form(...)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    temp_id = str(uuid.uuid4())
    input_path = TEMP_DIR / f"{temp_id}_input.pdf"
    output_path = TEMP_DIR / f"{temp_id}_split.pdf"
    zip_path = TEMP_DIR / f"{temp_id}_split.zip"

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        reader = PdfReader(input_path)
        total_pages = len(reader.pages)

        try:
            pages_to_extract = parse_page_ranges(page_ranges, total_pages)
        except ValueError as e:
            cleanup_temp_file(input_path)
            raise HTTPException(status_code=400, detail=str(e))

        if not pages_to_extract:
            cleanup_temp_file(input_path)
            raise HTTPException(status_code=400, detail="No valid pages specified")

        writer = PdfWriter()
        for page_num in pages_to_extract:
            writer.add_page(reader.pages[page_num])

        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        cleanup_temp_file(input_path)

        def cleanup():
            cleanup_temp_file(output_path)

        return FileResponse(
            path=output_path,
            filename=f"split_{file.filename}",
            media_type="application/pdf",
            background=cleanup
        )

    except Exception as e:
        cleanup_temp_file(input_path)
        cleanup_temp_file(output_path)
        cleanup_temp_file(zip_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


@app.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least 2 PDF files required")

    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF")

    temp_id = str(uuid.uuid4())
    input_paths = []
    output_path = TEMP_DIR / f"{temp_id}_merged.pdf"

    try:
        for idx, file in enumerate(files):
            input_path = TEMP_DIR / f"{temp_id}_input_{idx}.pdf"
            with open(input_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            input_paths.append(input_path)

        writer = PdfWriter()

        for input_path in input_paths:
            reader = PdfReader(input_path)
            for page in reader.pages:
                writer.add_page(page)

        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        for input_path in input_paths:
            cleanup_temp_file(input_path)

        def cleanup():
            cleanup_temp_file(output_path)

        return FileResponse(
            path=output_path,
            filename="merged.pdf",
            media_type="application/pdf",
            background=cleanup
        )

    except Exception as e:
        for input_path in input_paths:
            cleanup_temp_file(input_path)
        cleanup_temp_file(output_path)
        raise HTTPException(status_code=500, detail=f"Error merging PDFs: {str(e)}")


@app.get("/")
async def root():
    return {"message": "PDF Splitter & Merger API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

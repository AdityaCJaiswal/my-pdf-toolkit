# PDF Tools - Split & Merge PDFs Locally

A fullstack web application for splitting and merging PDF files, running completely locally with no cloud storage. Built with React (Vite) and FastAPI.

## Features

- **Split PDF**: Extract specific pages from a PDF using custom page ranges
- **Merge PDFs**: Combine multiple PDF files into a single document
- **Local Processing**: All operations happen on your machine - no data is sent to the cloud
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Fast & Efficient**: FastAPI backend with PyPDF2 for reliable PDF processing

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- FastAPI (Python)
- PyPDF2 for PDF processing
- CORS-enabled for local development

## Project Structure

```
project_root/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── temp_files/          # Temporary file storage (auto-created)
├── src/
│   ├── components/
│   │   ├── SplitPDF.tsx    # Split PDF component
│   │   └── MergePDF.tsx    # Merge PDFs component
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload
```

The backend will start at `http://localhost:8000`

You can verify it's running by visiting `http://localhost:8000` in your browser.

### Frontend Setup

1. Open a new terminal and navigate to the project root directory

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

### Running Both Servers

You need to run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Then open your browser to `http://localhost:5173`

## Usage

### Split PDF

1. Click on the "Split PDF" tab
2. Upload a PDF file by clicking the upload area
3. Enter page ranges in the input field (e.g., `1-3, 5, 7-10`)
4. Click "Split PDF"
5. The split PDF will automatically download

**Page Range Examples:**
- `1-5` - Pages 1 through 5
- `1, 3, 5` - Only pages 1, 3, and 5
- `1-3, 7-10, 15` - Pages 1-3, 7-10, and page 15

### Merge PDFs

1. Click on the "Merge PDFs" tab
2. Upload 2 or more PDF files
3. Files will be merged in the order they appear (you can remove files if needed)
4. Click "Merge PDFs"
5. The merged PDF will automatically download

## API Endpoints

### POST /split
Split a PDF file by extracting specific pages.

**Request:**
- `file`: PDF file (multipart/form-data)
- `page_ranges`: String with comma-separated page ranges (e.g., "1-3, 5-8")

**Response:**
- Returns the split PDF file

### POST /merge
Merge multiple PDF files into one.

**Request:**
- `files`: Array of PDF files (multipart/form-data)

**Response:**
- Returns the merged PDF file

### GET /health
Health check endpoint.

**Response:**
```json
{"status": "healthy"}
```

## Building for Production

### Frontend
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Backend
For production deployment, use a production ASGI server:
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Troubleshooting

### Backend not starting
- Ensure Python dependencies are installed: `pip install -r requirements.txt`
- Check if port 8000 is available
- Verify Python version: `python --version` (should be 3.8+)

### Frontend not connecting to backend
- Ensure backend is running at `http://localhost:8000`
- Check browser console for CORS errors
- Verify the API_URL in the frontend components matches your backend URL

### PDF processing errors
- Ensure uploaded files are valid PDFs
- Check file size isn't too large
- Verify page ranges are valid (e.g., don't exceed total pages)

## Security Notes

- All file processing happens locally on your machine
- Temporary files are automatically cleaned up after processing
- No data is sent to external servers
- CORS is configured for local development only

## Future Enhancements

- Drag & drop file upload support
- Download history tracking
- Batch processing multiple PDFs
- PDF preview before processing
- Password-protected PDF support
- Electron.js wrapper for desktop app

## License

MIT

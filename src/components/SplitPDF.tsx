import { useState } from 'react';
import { Upload, Scissors, Download, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!pageRanges.trim()) {
      setError('Please enter page ranges');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page_ranges', pageRanges);

      const response = await fetch(`${API_URL}/split`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to split PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setPageRanges('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Scissors className="w-16 h-16 mx-auto text-slate-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Split PDF</h2>
        <p className="text-slate-600">
          Extract specific pages from your PDF file
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Upload PDF File
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="split-file-input"
            />
            <label
              htmlFor="split-file-input"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-slate-400 mb-3" />
              {file ? (
                <div className="text-slate-700 font-medium">{file.name}</div>
              ) : (
                <>
                  <span className="text-slate-600 font-medium mb-1">
                    Click to upload PDF
                  </span>
                  <span className="text-slate-500 text-sm">
                    or drag and drop
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="page-ranges" className="block text-sm font-semibold text-slate-700 mb-3">
            Page Ranges
          </label>
          <input
            type="text"
            id="page-ranges"
            value={pageRanges}
            onChange={(e) => setPageRanges(e.target.value)}
            placeholder="e.g., 1-3, 5, 7-10"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow"
          />
          <p className="mt-2 text-sm text-slate-500">
            Enter page numbers or ranges separated by commas (e.g., 1-3, 5-8, 10)
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>PDF split successfully! Download started.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full py-3 px-6 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Split PDF
            </>
          )}
        </button>
      </form>
    </div>
  );
}

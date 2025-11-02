import { useState } from 'react';
import { Upload, Merge, Download, AlertCircle, CheckCircle, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length !== selectedFiles.length) {
      setError('Only PDF files are allowed');
      return;
    }

    setFiles(prev => [...prev, ...pdfFiles]);
    setError('');
    setSuccess(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`${API_URL}/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to merge PDFs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(true);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Merge className="w-16 h-16 mx-auto text-slate-600 mb-4" strokeWidth={1.5} />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Merge PDFs</h2>
        <p className="text-slate-600">
          Combine multiple PDF files into one document
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Upload PDF Files (2 or more)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="merge-file-input"
              multiple
            />
            <label
              htmlFor="merge-file-input"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-slate-400 mb-3" />
              <span className="text-slate-600 font-medium mb-1">
                Click to upload PDFs
              </span>
              <span className="text-slate-500 text-sm">
                or drag and drop (multiple files allowed)
              </span>
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Selected Files ({files.length})
            </label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-slate-500 font-mono text-sm">
                      {index + 1}
                    </div>
                    <div className="text-slate-700 font-medium truncate">
                      {file.name}
                    </div>
                    <div className="text-slate-500 text-sm">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Files will be merged in the order shown above
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>PDFs merged successfully! Download started.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || files.length < 2}
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
              Merge PDFs
            </>
          )}
        </button>
      </form>
    </div>
  );
}

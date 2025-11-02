import { useState } from 'react';
import SplitPDF from './components/SplitPDF';
import MergePDF from './components/MergePDF';
import { FileText } from 'lucide-react';

type Tab = 'split' | 'merge';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('split');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-slate-700" strokeWidth={1.5} />
            <h1 className="text-4xl font-bold text-slate-800">PDF Tools</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Split and merge PDF files locally - no cloud storage required
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('split')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'split'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Split PDF
            </button>
            <button
              onClick={() => setActiveTab('merge')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'merge'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              Merge PDFs
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'split' ? <SplitPDF /> : <MergePDF />}
          </div>
        </div>

        <footer className="text-center mt-8 text-slate-500 text-sm">
          <p>All processing happens locally on your machine</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

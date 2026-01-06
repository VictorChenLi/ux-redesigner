import React from 'react';
import { CheckCircle, Monitor, Code, Download, ExternalLink } from 'lucide-react';

export default function PreviewPanel({
  generatedCode,
  activeTab,
  onTabChange,
  isAnalyzing,
}) {
  const openInNewTab = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden relative">
      <div className="border-b border-slate-200 p-4 flex items-center justify-between bg-slate-50">
        <h2 className="font-semibold flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          3. Generated Redesign
        </h2>
        {generatedCode && (
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 items-center space-x-1">
            <button
              onClick={() => onTabChange('preview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center transition-colors ${
                activeTab === 'preview' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Monitor className="w-3 h-3 mr-1" /> Preview
            </button>
            <button
              onClick={() => onTabChange('code')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center transition-colors ${
                activeTab === 'code' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Code className="w-3 h-3 mr-1" /> Code
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1.5"></div>
            <button
              onClick={() => {
                const blob = new Blob([generatedCode], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'clear-ui-redesign.html';
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md"
              title="Download HTML"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={openInNewTab}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md"
              title="Launch in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-slate-100 relative">
        {!generatedCode && !isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <Monitor className="w-16 h-16 mb-4 opacity-20" />
            <p>Upload a UI to see the redesign here</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-medium animate-pulse">Generating redesign code...</p>
          </div>
        )}

        {generatedCode && activeTab === 'preview' && (
          <iframe title="Generated Preview" srcDoc={generatedCode} className="w-full h-full border-0 bg-white" sandbox="allow-scripts" />
        )}

        {generatedCode && activeTab === 'code' && (
          <pre className="w-full h-full overflow-auto p-4 text-xs font-mono bg-slate-900 text-slate-300">{generatedCode}</pre>
        )}
      </div>
    </div>
  );
}


import React from 'react';
import { Monitor, X } from 'lucide-react';

export default function FullscreenModal({ generatedCode, onClose }) {
  if (!generatedCode) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-xl shadow-2xl flex-1 flex flex-col overflow-hidden relative">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-blue-600" />
            Full Screen Preview
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-500 hidden md:block">Interactive Preview</div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>
        <iframe title="Full Screen Preview" srcDoc={generatedCode} className="w-full h-full border-0 bg-white" sandbox="allow-scripts" />
      </div>
    </div>
  );
}


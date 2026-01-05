import React from 'react';
import { Eye } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.jsx';

export default function AnalysisPanel({ analysisResult, isAnalyzing }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold flex items-center">
          <Eye className="w-5 h-5 mr-2 text-purple-600" />
          2. Framework Critique
        </h2>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">
        {analysisResult ? (
          <div className="prose prose-sm prose-slate max-w-none">
            <MarkdownRenderer content={analysisResult} />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            {isAnalyzing ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <Eye className="w-6 h-6" />
                </div>
                <p className="font-medium text-slate-600">Analyzing C.L.E.A.R. metrics...</p>
                <p className="text-sm mt-1">This usually takes about 10-15 seconds</p>
              </div>
            ) : (
              <>
                <Eye className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">Waiting for analysis</p>
                <p className="text-sm mt-1">Upload an image and click "Run" to see the critique here.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


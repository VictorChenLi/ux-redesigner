import React from 'react';
import { Loader, RefreshCw, Send } from 'lucide-react';

export default function RefinementBar({
  refinePrompt,
  onRefinePromptChange,
  onRefine,
  onIterate,
  isRefining,
  isAnalyzing,
  hasGeneratedCode,
}) {
  return (
    hasGeneratedCode && (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2">
        <button
          onClick={onIterate}
          disabled={isRefining || isAnalyzing}
          className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex-shrink-0"
          title="Deep Iterate: Run C.L.E.A.R. analysis again on this result"
        >
          {isAnalyzing ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-slate-200"></div>

        <div className="flex-1 relative">
          <input
            type="text"
            disabled={isRefining}
            placeholder="Refine with AI: 'Make it dark mode', 'Bigger buttons', 'Use serif font'..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
            value={refinePrompt}
            onChange={(e) => onRefinePromptChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefine()}
          />
          {isRefining && (
            <div className="absolute right-3 top-2.5">
              <Loader className="w-4 h-4 text-purple-600 animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={onRefine}
          disabled={isRefining || !refinePrompt.trim()}
          className={`p-2.5 rounded-lg transition-colors ${
            !refinePrompt.trim() ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    )
  );
}


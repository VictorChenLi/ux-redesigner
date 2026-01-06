import React, { useRef, useEffect } from 'react';
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
  const textareaRef = useRef(null);

  // Auto-resize textarea up to 3 lines
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate the height for one line
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 3; // 3 lines max
    const padding = parseInt(getComputedStyle(textarea).paddingTop) + parseInt(getComputedStyle(textarea).paddingBottom);
    
    // Set height based on content, but cap at 3 lines
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [refinePrompt]);

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift), allow new line with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (refinePrompt.trim() && !isRefining) {
        onRefine();
      }
    }
  };

  return (
    hasGeneratedCode && (
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-2">
        <button
          onClick={onIterate}
          disabled={isRefining || isAnalyzing}
          className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex-shrink-0 mt-0.5"
          title="Deep Iterate: Run C.L.E.A.R. analysis again on this result"
        >
          {isAnalyzing ? <Loader className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-slate-200 self-center"></div>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            disabled={isRefining}
            placeholder="Refine with AI: 'Make it dark mode', 'Bigger buttons', 'Use serif font'..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 resize-none overflow-hidden min-h-[42px]"
            value={refinePrompt}
            onChange={(e) => onRefinePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
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
          className={`p-2.5 rounded-lg transition-colors flex-shrink-0 mt-0.5 ${
            !refinePrompt.trim() ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    )
  );
}


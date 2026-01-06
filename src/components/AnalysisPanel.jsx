import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.jsx';

export default function AnalysisPanel({ analysisResult, isAnalyzing }) {
  const [overallScore, setOverallScore] = useState(null);

  // Extract overall score from analysis result (backward compatibility for old format)
  useEffect(() => {
    if (analysisResult) {
      const scoreMatch = analysisResult.match(/Overall\s+Score:\s*(\d+)%/i);
      if (scoreMatch) {
        setOverallScore(parseInt(scoreMatch[1], 10));
      }
    }
  }, [analysisResult]);

  const score = overallScore;
  
  const renderScorecard = () => {
    if (score === null) return null;
    
    const circumference = 2 * Math.PI * 28; // radius = 28
    const offset = circumference - (score / 100) * circumference;
    
    return (
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
          <circle 
            cx="32" 
            cy="32" 
            r="28" 
            stroke="currentColor" 
            strokeWidth="6" 
            fill="transparent" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-indigo-600 transition-all duration-1000"
            style={{ strokeLinecap: 'round' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-800 leading-none">{score}%</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Score</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-600" />
            2. Framework Critique
          </h2>
        </div>
        {renderScorecard()}
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 relative">
        {analysisResult ? (
          <div className="prose prose-sm prose-slate max-w-none">
            <MarkdownRenderer content={analysisResult} onOverallScoreChange={setOverallScore} />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            {isAnalyzing ? (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <Eye className="w-6 h-6" />
                </div>
                <p className="font-medium text-slate-600">Analyzing C.L.E.A.R. framework...</p>
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


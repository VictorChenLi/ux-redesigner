import React, { useState, useEffect, useRef } from 'react';
import { Eye, Copy, ExternalLink } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer.jsx';

export default function AnalysisPanel({ analysisResult, isAnalyzing }) {
  const [overallScore, setOverallScore] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const contentRef = useRef(null);

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

  const handleCopy = async () => {
    if (!analysisResult) return;
    
    try {
      await navigator.clipboard.writeText(analysisResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = analysisResult;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleLaunchPreview = () => {
    if (!analysisResult) return;

    // Parse markdown to generate styled HTML
    const lines = analysisResult.split('\n');
    const modules = [];
    let currentModule = null;
    let currentModuleLines = [];

    const isModuleHeader = (line) => {
      const trimmed = line.trim();
      return trimmed.match(/^##\s+[CLEAR]\s+-/);
    };

    const parseModuleScore = (line) => {
      const trimmed = line.trim();
      const scoreMatch = trimmed.match(/Score:\s*(\d+)(?:\/20)?/i);
      if (scoreMatch) {
        return Math.max(0, Math.min(20, parseInt(scoreMatch[1], 10)));
      }
      return null;
    };

    const calculateStatus = (score) => {
      if (score === null || score === undefined) return { label: 'Unknown', color: '#64748b', dotColor: '#64748b' };
      if (score >= 18) return { label: 'Pass', color: '#059669', dotColor: '#10b981' };
      if (score >= 10) return { label: 'Needs Improvement', color: '#d97706', dotColor: '#f59e0b' };
      return { label: 'Critical Issue', color: '#dc2626', dotColor: '#ef4444' };
    };

    // Parse modules
    lines.forEach((line) => {
      if (isModuleHeader(line)) {
        if (currentModule) {
          modules.push({ ...currentModule, lines: currentModuleLines });
        }
        const match = line.match(/^##\s+([CLEAR])\s+-\s+(.+)/);
        currentModule = {
          letter: match ? match[1] : '?',
          name: match ? match[2] : 'Unknown',
          score: null,
        };
        currentModuleLines = [];
      } else {
        if (currentModule && currentModule.score === null) {
          const score = parseModuleScore(line);
          if (score !== null) {
            currentModule.score = score;
            return; // Don't include score line in content
          }
        }
        if (currentModule) {
          currentModuleLines.push(line);
        }
      }
    });
    if (currentModule) {
      modules.push({ ...currentModule, lines: currentModuleLines });
    }

    // Build HTML content with proper styling
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>C.L.E.A.R. Framework Analysis</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f1f5f9;
      padding: 20px;
      color: #1e293b;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: white;
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    .header .score {
      font-size: 16px;
      color: #475569;
    }
    .header .score strong {
      color: #1e293b;
      font-size: 18px;
    }
    .header-buttons {
      display: flex;
      gap: 8px;
    }
    .header-btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-btn:hover {
      background: #2563eb;
    }
    .header-btn.copy-btn {
      background: #64748b;
    }
    .header-btn.copy-btn:hover {
      background: #475569;
    }
    .header-btn svg {
      width: 16px;
      height: 16px;
      stroke-width: 2;
    }
    .copy-success {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .content {
      padding: 24px;
    }
    .module {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .module-header {
      padding: 20px;
      background: rgba(241, 245, 249, 0.5);
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .module-badge {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      flex-shrink: 0;
    }
    .module-info {
      flex: 1;
    }
    .module-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .module-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .module-content {
      padding: 20px;
    }
    .bullet-point {
      margin-bottom: 12px;
      padding-left: 8px;
      color: #475569;
    }
    .bullet-point strong {
      color: #1e293b;
      font-weight: 600;
    }
    .redesign-suggestion {
      border-left: 4px solid #6366f1;
      background: linear-gradient(to right, #eef2ff, white);
      padding: 16px;
      border-radius: 0 8px 8px 0;
      margin-top: 16px;
    }
    .redesign-suggestion-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
    }
    .redesign-suggestion-content {
      font-size: 14px;
      color: #1e293b;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1>C.L.E.A.R. Framework Analysis</h1>
        ${score !== null ? `<p class="score">Overall Score: <strong>${score}/100</strong></p>` : ''}
      </div>
      <div class="header-buttons">
        <button class="header-btn copy-btn" onclick="copyMarkdown()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2"/>
          </svg>
          Copy Markdown
        </button>
        <button class="header-btn" onclick="downloadPDF()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          Download PDF
        </button>
      </div>
    </div>
    <div class="content">`;

    const moduleColors = {
      'C': { bg: '#fef3c7', text: '#d97706' },
      'L': { bg: '#fee2e2', text: '#dc2626' },
      'E': { bg: '#fef3c7', text: '#d97706' },
      'A': { bg: '#d1fae5', text: '#059669' },
      'R': { bg: '#d1fae5', text: '#059669' },
    };

    modules.forEach((module) => {
      const status = calculateStatus(module.score);
      const colors = moduleColors[module.letter] || { bg: '#f1f5f9', text: '#64748b' };

      htmlContent += `
      <div class="module">
        <div class="module-header">
          <div class="module-badge" style="background: ${colors.bg}; color: ${colors.text};">
            ${module.letter}
          </div>
          <div class="module-info">
            <div class="module-title">${module.name}</div>
            <div class="module-status" style="color: ${status.color};">
              <div class="status-dot" style="background: ${status.dotColor};"></div>
              <span>${status.label}</span>
              ${module.score !== null ? `<span style="color: #64748b; margin-left: 8px;">• ${module.score}/20</span>` : ''}
            </div>
          </div>
        </div>
        <div class="module-content">`;

      // Parse and render module content
      let inRedesignSuggestion = false;
      let suggestionParts = [];

      module.lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.toLowerCase().includes('redesign suggestion')) {
          inRedesignSuggestion = true;
          const suggestionText = trimmed.replace(/^[•*]\s*[Rr]edesign\s+[Ss]uggestion:\s*/i, '').trim();
          if (suggestionText) suggestionParts.push(suggestionText);
          return;
        }

        if (inRedesignSuggestion) {
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const bulletContent = trimmed.replace(/^[-*•]\s+/, '').trim();
            if (bulletContent.match(/^(Clear|Concise|Concrete|Action|Risk|Remove|Human|Proximity|Similarity|Alignment|Common|Continuity|Simplicity|Clear Zones|Focal|Hierarchy|Contrast|Color|Touch|Friction|Feedback)/i)) {
              if (suggestionParts.length > 0) {
                htmlContent += `
                  <div class="redesign-suggestion">
                    <div class="redesign-suggestion-header">💡 Redesign Suggestion</div>
                    <div class="redesign-suggestion-content">${suggestionParts.join(' ')}</div>
                  </div>`;
                suggestionParts = [];
              }
              inRedesignSuggestion = false;
              // Process this bullet normally
              const labelMatch = bulletContent.match(/^\*\*([^:]+):\*\*\s*(.+)/);
              if (labelMatch) {
                htmlContent += `<div class="bullet-point"><strong>${labelMatch[1]}:</strong> ${labelMatch[2]}</div>`;
              } else {
                htmlContent += `<div class="bullet-point">• ${bulletContent}</div>`;
              }
            } else {
              suggestionParts.push(bulletContent);
            }
          } else {
            suggestionParts.push(trimmed);
          }
          return;
        }

        // Normal bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const bulletContent = trimmed.replace(/^[-*•]\s+/, '').trim();
          const labelMatch = bulletContent.match(/^\*\*([^:]+):\*\*\s*(.+)/);
          if (labelMatch) {
            htmlContent += `<div class="bullet-point"><strong>${labelMatch[1]}:</strong> ${labelMatch[2]}</div>`;
          } else {
            htmlContent += `<div class="bullet-point">• ${bulletContent}</div>`;
          }
        }
      });

      // Add remaining redesign suggestion if any
      if (suggestionParts.length > 0) {
        htmlContent += `
          <div class="redesign-suggestion">
            <div class="redesign-suggestion-header">💡 Redesign Suggestion</div>
            <div class="redesign-suggestion-content">${suggestionParts.join(' ')}</div>
          </div>`;
      }

      htmlContent += `
        </div>
      </div>`;
    });

    htmlContent += `
    </div>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    const markdownContent = ${JSON.stringify(analysisResult).replace(/</g, '\\u003c')};
    
    async function copyMarkdown() {
      try {
        await navigator.clipboard.writeText(markdownContent);
        showCopySuccess();
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = markdownContent;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          showCopySuccess();
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
          alert('Failed to copy. Please select and copy manually.');
        }
        document.body.removeChild(textArea);
      }
    }
    
    function showCopySuccess() {
      const successDiv = document.createElement('div');
      successDiv.className = 'copy-success';
      successDiv.textContent = 'Copied to clipboard!';
      document.body.appendChild(successDiv);
      setTimeout(() => {
        successDiv.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => document.body.removeChild(successDiv), 300);
      }, 2000);
    }
    
    async function downloadPDF() {
      try {
        const element = document.querySelector('.container');
        const opt = {
          margin: [15, 15, 15, 15],
          filename: 'clear-ui-critique-' + new Date().toISOString().split('T')[0] + '.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        alert('Failed to generate PDF. Please try using your browser\\'s print function (Ctrl+P / Cmd+P) and save as PDF.');
      }
    }
  </script>
</body>
</html>`;

    // Open in new tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-600" />
              2. Framework Critique
            </h2>
            {score !== null && (
              <p className="text-sm text-slate-600 mt-1 ml-7">
                Overall Score: <span className="font-semibold text-slate-800">{score}/100</span>
              </p>
            )}
          </div>
          {analysisResult && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Copy markdown"
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleLaunchPreview}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Launch in New Tab"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        {copySuccess && (
          <div className="mt-2 text-xs text-green-600 ml-7">Copied to clipboard!</div>
        )}
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar flex-1 relative">
        {analysisResult ? (
          <div ref={contentRef} className="prose prose-sm prose-slate max-w-none">
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


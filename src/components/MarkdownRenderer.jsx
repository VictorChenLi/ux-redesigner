import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';

function formatInlineStyles(text) {
  if (!text) return '';

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-slate-900 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={i} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export default function MarkdownRenderer({ content, onOverallScoreChange }) {
  if (!content) return null;

  const lines = content.split('\n');

  const modules = [];
  let currentModule = null;
  let currentModuleLines = [];

  // Helper function to check if a line is a module header (## C -, ## L -, etc.)
  const isModuleHeader = (line) => {
    const trimmed = line.trim();
    return trimmed.match(/^##\s+[CLEAR]\s+-/);
  };
  
  // Helper function to parse module score from a line
  const parseModuleScore = (line) => {
    const trimmed = line.trim();
    // Match "Score: XX/20" or "Score: XX"
    const scoreMatch = trimmed.match(/Score:\s*(\d+)(?:\/20)?/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1], 10);
      // Ensure score is between 0-20
      return Math.max(0, Math.min(20, score));
    }
    return null;
  };

  // Helper function to calculate status from score
  const calculateStatusFromScore = (score) => {
    if (score === null || score === undefined) {
      return { dot: 'bg-slate-500', text: 'text-slate-700', label: 'Unknown' };
    }
    
    if (score >= 18) {
      return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Pass' };
    } else if (score >= 10) {
      return { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Needs Improvement' };
    } else {
      return { dot: 'bg-red-500', text: 'text-red-700', label: 'Critical Issue' };
    }
  };

  // Helper function to get module color and badge info
  const getModuleInfo = (moduleName, score = null) => {

    const moduleInfo = {
      'C': { 
        letter: 'C',
        name: 'Copywriting',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-600',
        hover: 'hover:bg-amber-50'
      },
      'L': { 
        letter: 'L',
        name: 'Layout',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-600',
        hover: 'hover:bg-red-50'
      },
      'E': { 
        letter: 'E',
        name: 'Emphasis',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-600',
        hover: 'hover:bg-amber-50'
      },
      'A': { 
        letter: 'A',
        name: 'Accessibility',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-600',
        hover: 'hover:bg-emerald-50'
      },
      'R': { 
        letter: 'R',
        name: 'Reward',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-600',
        hover: 'hover:bg-emerald-50'
      },
    };
    const match = moduleName.match(/^##\s+([CLEAR])\s+-/);
    const baseInfo = match ? moduleInfo[match[1]] : {
      letter: '?',
      name: 'Unknown',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      hover: 'hover:bg-slate-50'
    };
    
    return {
      ...baseInfo,
      status: calculateStatusFromScore(score)
    };
  };

  // Group lines into modules and extract score
  lines.forEach((line, index) => {
    if (isModuleHeader(line)) {
      // Save previous module if exists
      if (currentModule) {
        modules.push({ 
          header: currentModule.header, 
          lines: currentModuleLines, 
          score: currentModule.score 
        });
      }
      // Start new module
      currentModule = { header: line, score: null };
      currentModuleLines = [];
    } else {
      // Check if this line contains score (first line after header)
      if (currentModule && currentModule.score === null) {
        const score = parseModuleScore(line);
        if (score !== null) {
          currentModule.score = score;
          // Don't include score line in content
          return;
        }
      }
      currentModuleLines.push(line);
    }
  });

  // Don't forget the last module
  if (currentModule) {
    modules.push({ 
      header: currentModule.header, 
      lines: currentModuleLines, 
      score: currentModule.score 
    });
  }

  // Calculate overall score from module scores
  let overallScore = null;
  const moduleScores = modules.map(m => m.score).filter(s => s !== null);
  if (moduleScores.length === 5) {
    overallScore = moduleScores.reduce((sum, score) => sum + score, 0);
  }

  // Notify parent component of overall score change
  useEffect(() => {
    if (onOverallScoreChange && overallScore !== null) {
      onOverallScoreChange(overallScore);
    }
  }, [overallScore, onOverallScoreChange]);

  // If no modules found, render normally
  if (modules.length === 0) {
    const elements = [];
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`spacer-${index}`} className="h-2"></div>);
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2
            key={`h2-${index}`}
            className="text-xl font-bold text-slate-900 mt-6 mb-3 pb-1 border-b border-slate-100"
          >
            {formatInlineStyles(trimmed.replace('## ', ''))}
          </h2>
        );
        return;
      }
      const isList = trimmed.startsWith('- ') || trimmed.startsWith('* ');
      if (isList) {
        const itemContent = trimmed.substring(2);
        elements.push(
          <div key={`li-${index}`} className="flex items-start ml-2 mb-2">
            <span className="mr-2 text-slate-400 mt-1.5">•</span>
            <span className="text-slate-700 leading-relaxed">{formatInlineStyles(itemContent)}</span>
          </div>
        );
        return;
      }
      elements.push(
        <p key={`p-${index}`} className="text-slate-600 leading-relaxed mb-2">
          {formatInlineStyles(trimmed)}
        </p>
      );
    });
    return <div className="space-y-1">{elements}</div>;
  }

  // Render modules as distinct regions with collapsible functionality
  return <ModuleRenderer modules={modules} getModuleInfo={getModuleInfo} formatInlineStyles={formatInlineStyles} overallScore={overallScore} />;
}

function ModuleRenderer({ modules, getModuleInfo, formatInlineStyles, overallScore }) {
  // Only first module is expanded by default
  const [expandedModules, setExpandedModules] = useState(new Set([0]));

  const toggleModule = (index) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Check if a line is a redesign suggestion
  const isRedesignSuggestion = (line) => {
    const trimmed = line.trim().toLowerCase();
    return trimmed.includes('redesign suggestion') || trimmed.startsWith('• redesign suggestion:');
  };

  // Parse module content into sections
  const parseModuleContent = (lines) => {
    const content = {
      mainText: [],
      bulletPoints: [],
      redesignSuggestion: null,
    };

    let inRedesignSuggestion = false;
    let suggestionParts = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      // Check if this line starts a redesign suggestion
      if (isRedesignSuggestion(trimmed)) {
        inRedesignSuggestion = true;
        const suggestionText = trimmed.replace(/^[•*]\s*[Rr]edesign\s+[Ss]uggestion:\s*/i, '').trim();
        if (suggestionText) {
          suggestionParts.push(suggestionText);
        }
        return;
      }

      // If we're collecting redesign suggestion, continue until we hit a new module header or end
      if (inRedesignSuggestion) {
        // If it's a bullet point, check if it looks like a new category (starts with common critique keywords)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.substring(2).trim();
          // If it starts with a known category name, we've reached the end of the suggestion
          if (bulletContent.match(/^(Clear|Concise|Concrete|Action|Risk|Remove|Human|Proximity|Similarity|Alignment|Common|Continuity|Simplicity|Clear Zones|Focal|Hierarchy|Contrast|Color|Touch|Friction|Feedback)/i)) {
            // Save suggestion and stop collecting
            if (suggestionParts.length > 0) {
              content.redesignSuggestion = suggestionParts.join(' ').trim();
              suggestionParts = [];
            }
            inRedesignSuggestion = false;
            // Process this bullet normally
            content.bulletPoints.push(bulletContent);
          } else {
            // Continue collecting as part of suggestion
            suggestionParts.push(bulletContent);
          }
        } else {
          // Regular text line, add to suggestion
          suggestionParts.push(trimmed);
        }
        return;
      }

      // Normal processing - not in redesign suggestion
      // Handle bullet points: - , * , or • (bullet character)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const bulletContent = trimmed.replace(/^[-*•]\s+/, '').trim();
        if (bulletContent) {
          content.bulletPoints.push(bulletContent);
        }
      } else if (trimmed.startsWith('•')) {
        // Handle bullet without space after it
        const bulletContent = trimmed.replace(/^•\s*/, '').trim();
        if (bulletContent) {
          content.bulletPoints.push(bulletContent);
        }
      } else {
        content.mainText.push(trimmed);
      }
    });

    // Save any remaining suggestion
    if (suggestionParts.length > 0) {
      content.redesignSuggestion = suggestionParts.join(' ').trim();
    }

    return content;
  };

  return (
    <div className="space-y-3">
      {modules.map((module, moduleIndex) => {
        const moduleInfo = getModuleInfo(module.header, module.score);
        const isExpanded = expandedModules.has(moduleIndex);
        const parsedContent = parseModuleContent(module.lines);

        return (
          <div
            key={`module-${moduleIndex}`}
            className={`accordion-item bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${isExpanded ? 'active' : ''}`}
          >
            <button
              onClick={() => toggleModule(moduleIndex)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${moduleInfo.badgeBg} ${moduleInfo.badgeText} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                  {moduleInfo.letter}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 m-0">{moduleInfo.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${moduleInfo.status.dot}`}></div>
                    <span className={`text-xs font-medium ${moduleInfo.status.text} uppercase tracking-wide`}>
                      {moduleInfo.status.label}
                    </span>
                    {module.score !== null && (
                      <>
                        <span className="text-xs text-slate-400 mx-1">•</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {module.score}/20
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            <div className={`accordion-content ${isExpanded ? 'active' : ''}`}>
              <div className="px-5">
                <div className="pl-1 space-y-4 pb-4">
                  {/* Main text */}
                  {parsedContent.mainText.length > 0 && (
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {parsedContent.mainText.map((text, idx) => (
                        <span key={idx}>{formatInlineStyles(text)} </span>
                      ))}
                    </p>
                  )}

                  {/* Bullet points */}
                  {parsedContent.bulletPoints.length > 0 && (
                    <div className="space-y-3">
                      {parsedContent.bulletPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start w-full">
                          <span className="mr-3 text-slate-500 mt-1 flex-shrink-0">•</span>
                          <div className="flex-1 text-slate-700 leading-relaxed text-sm min-w-0">
                            {formatInlineStyles(point)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Redesign Suggestion Box */}
                  {parsedContent.redesignSuggestion && (
                    <div className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-4 rounded-r-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-900 uppercase tracking-tight">
                          Redesign Suggestion
                        </span>
                      </div>
                      <p className="text-sm text-indigo-900 leading-relaxed">
                        {formatInlineStyles(parsedContent.redesignSuggestion)}
                      </p>
                    </div>
                  )}

                  {/* Fallback: render lines that weren't parsed */}
                  {parsedContent.mainText.length === 0 && parsedContent.bulletPoints.length === 0 && !parsedContent.redesignSuggestion && (
                    <div className="space-y-2">
                      {module.lines.map((line, lineIndex) => {
                        const trimmed = line.trim();
                        if (!trimmed || isRedesignSuggestion(trimmed)) {
                          return null;
                        }

                        const isList = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('•');
                        if (isList) {
                          const itemContent = trimmed.replace(/^[-*•]\s*/, '').trim();
                          return (
                            <div key={`li-${moduleIndex}-${lineIndex}`} className="flex items-start mb-3">
                              <span className="mr-3 text-slate-500 mt-1 flex-shrink-0">•</span>
                              <div className="flex-1 text-slate-700 leading-relaxed text-sm">
                                {formatInlineStyles(itemContent)}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <p key={`p-${moduleIndex}-${lineIndex}`} className="text-slate-600 leading-relaxed text-sm">
                            {formatInlineStyles(trimmed)}
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


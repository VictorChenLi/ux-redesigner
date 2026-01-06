import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

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

export default function MarkdownRenderer({ content }) {
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

  // Helper function to get module color
  const getModuleColor = (moduleName) => {
    const colors = {
      'C': { bg: 'bg-purple-50', border: 'border-purple-200', header: 'text-purple-700', hover: 'hover:bg-purple-100' },
      'L': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'text-blue-700', hover: 'hover:bg-blue-100' },
      'E': { bg: 'bg-amber-50', border: 'border-amber-200', header: 'text-amber-700', hover: 'hover:bg-amber-100' },
      'A': { bg: 'bg-green-50', border: 'border-green-200', header: 'text-green-700', hover: 'hover:bg-green-100' },
      'R': { bg: 'bg-rose-50', border: 'border-rose-200', header: 'text-rose-700', hover: 'hover:bg-rose-100' },
    };
    const match = moduleName.match(/^##\s+([CLEAR])\s+-/);
    return match ? colors[match[1]] : { bg: 'bg-slate-50', border: 'border-slate-200', header: 'text-slate-700', hover: 'hover:bg-slate-100' };
  };

  // Group lines into modules
  lines.forEach((line, index) => {
    if (isModuleHeader(line)) {
      // Save previous module if exists
      if (currentModule) {
        modules.push({ header: currentModule, lines: currentModuleLines });
      }
      // Start new module
      currentModule = line;
      currentModuleLines = [];
    } else {
      currentModuleLines.push(line);
    }
  });

  // Don't forget the last module
  if (currentModule) {
    modules.push({ header: currentModule, lines: currentModuleLines });
  }

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
  return <ModuleRenderer modules={modules} getModuleColor={getModuleColor} formatInlineStyles={formatInlineStyles} />;
}

function ModuleRenderer({ modules, getModuleColor, formatInlineStyles }) {
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

  return (
    <div className="space-y-3">
      {modules.map((module, moduleIndex) => {
        const colors = getModuleColor(module.header);
        const moduleTitle = module.header.replace(/^##\s+/, '');
        const isExpanded = expandedModules.has(moduleIndex);

        return (
          <div
            key={`module-${moduleIndex}`}
            className={`${colors.bg} ${colors.border} border rounded-lg shadow-sm overflow-hidden`}
          >
            <button
              onClick={() => toggleModule(moduleIndex)}
              className={`w-full flex items-center justify-between p-4 ${colors.hover} transition-colors cursor-pointer`}
            >
              <h2 className={`text-lg font-bold ${colors.header} flex items-center m-0`}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-2" />
                )}
                {formatInlineStyles(moduleTitle)}
              </h2>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {module.lines.map((line, lineIndex) => {
                  const trimmed = line.trim();
                  if (!trimmed) {
                    return <div key={`spacer-${moduleIndex}-${lineIndex}`} className="h-1"></div>;
                  }

                  const isList = trimmed.startsWith('- ') || trimmed.startsWith('* ');
                  if (isList) {
                    const itemContent = trimmed.substring(2);
                    return (
                      <div key={`li-${moduleIndex}-${lineIndex}`} className="flex items-start ml-1 mb-1.5">
                        <span className="mr-2.5 text-slate-500 mt-1.5 text-xs">•</span>
                        <span className="text-slate-700 leading-relaxed text-sm flex-1">
                          {formatInlineStyles(itemContent)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <p key={`p-${moduleIndex}-${lineIndex}`} className="text-slate-600 leading-relaxed text-sm mb-1.5">
                      {formatInlineStyles(trimmed)}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


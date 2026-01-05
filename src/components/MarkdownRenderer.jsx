import React from 'react';

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
  const elements = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`spacer-${index}`} className="h-2"></div>);
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${index}`}
          className="text-lg font-bold text-slate-800 mt-4 mb-2"
        >
          {formatInlineStyles(trimmed.replace('### ', ''))}
        </h3>
      );
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
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-2xl font-extrabold text-slate-900 mt-6 mb-4">
          {formatInlineStyles(trimmed.replace('# ', ''))}
        </h1>
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


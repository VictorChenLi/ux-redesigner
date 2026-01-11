import React from 'react';
import { Settings, Check, X } from 'lucide-react';

// Helper to get display name for model
const getModelDisplayName = (modelId, customModelId) => {
  if (modelId === 'custom') {
    return customModelId || 'Custom Model';
  }
  
  const modelNames = {
    'gemini-3-flash-preview': 'Gemini 3 Flash',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
    'gemini-3-pro-preview': 'Gemini 3 Pro',
    'gpt-5.2': 'GPT-5.2',
    'gpt-5.1': 'GPT-5.1',
  };
  
  return modelNames[modelId] || modelId;
};

export default function HeaderBar({
  onToggleSettings,
  modelId,
  customModelId,
  apiKey,
}) {
  const modelDisplayName = getModelDisplayName(modelId, customModelId);
  const hasApiKey = !!apiKey && apiKey.trim() !== '';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            C
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:inline">
            C.L.E.A.R. <span className="text-slate-500 font-normal">UI Redesigner</span>
          </span>
          <a
            href="https://growth.design/courses/clear-ui"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors text-slate-600 text-sm"
            title="The Psychology of UI Design (C.L.E.A.R. Framework) – growth.design"
          >
            <span className="text-slate-700 font-normal">Inspired by</span>
            <img
              src="https://growth.design/favicon-32x32.png"
              alt="growth.design"
              className="w-5 h-5 rounded"
              loading="lazy"
            />
            <span className="hidden md:inline">C.L.E.A.R. course</span>
          </a>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Model & API Key Status Pill - Clickable */}
          <button
            onClick={onToggleSettings}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors group"
            title="Click to configure model & API key"
          >
            <span className="text-sm font-medium text-slate-700 truncate max-w-[120px] md:max-w-[200px]">
              {modelDisplayName}
            </span>
            <div className="flex items-center">
              {hasApiKey ? (
                <Check className="w-4 h-4 text-green-600" title="API Key configured" />
              ) : (
                <X className="w-4 h-4 text-red-500" title="API Key missing" />
              )}
            </div>
            <Settings className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}


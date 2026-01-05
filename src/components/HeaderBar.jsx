import React from 'react';
import { Settings } from 'lucide-react';

export default function HeaderBar({
  apiKey,
  onApiKeyChange,
  showSettings,
  onToggleSettings,
  modelId,
  onModelIdChange,
  customModelId,
  onCustomModelChange,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
          <div className="relative group">
            <button
              onClick={onToggleSettings}
              className={`p-2 rounded-full transition-colors ${
                showSettings ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
              }`}
              title="Model Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="password"
              placeholder="Enter Gemini API Key"
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-md px-2.5 py-1.5 transition-colors"
            >
              Get Gemini key
            </a>
          </div>
        </div>
      </div>

      {showSettings && (
        <div className="bg-slate-100 border-b border-slate-200 p-4 animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 text-sm">
            <span className="font-semibold text-slate-700">Model Configuration:</span>
            <div className="flex items-center space-x-2">
              <label className="text-slate-600">Select Model:</label>
              <select
                value={modelId}
                onChange={(e) => onModelIdChange(e.target.value)}
                className="p-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Default)</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                <option value="custom">Custom Model ID...</option>
              </select>
            </div>

            {modelId === 'custom' && (
              <input
                type="text"
                placeholder="e.g. gemini-2.0-flash-exp"
                value={customModelId}
                onChange={(e) => onCustomModelChange(e.target.value)}
                className="p-1 border border-slate-300 rounded w-48 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}


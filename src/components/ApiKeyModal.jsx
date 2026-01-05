import React from 'react';
import { X } from 'lucide-react';

export default function ApiKeyModal({ isOpen, apiKey, onApiKeyChange, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-md p-6 relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 text-slate-500"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Enter Gemini API Key</h3>
        <p className="text-sm text-slate-600 mb-4">
          You need an API key to run C.L.E.A.R. analysis. Keys stay on your device.
        </p>
        <div className="space-y-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter Gemini API Key"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Get Gemini key
            </a>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`px-3 py-2 text-sm font-semibold rounded-md text-white ${
                  apiKey ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'
                }`}
                disabled={!apiKey}
              >
                Save & Run
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


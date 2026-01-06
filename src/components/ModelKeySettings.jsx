import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const API_KEYS_STORAGE_KEY = 'clear-redesigner-api-keys'; // Store as { modelId: apiKey }

// Helper to determine provider
const getProvider = (modelId) => {
  if (modelId.startsWith('gpt-') || modelId.startsWith('o1-') || modelId.startsWith('o3-')) {
    return 'openai';
  }
  return 'gemini';
};

export default function ModelKeySettings({
  isOpen,
  onClose,
  modelId,
  onModelIdChange,
  customModelId,
  onCustomModelIdChange,
  apiKey,
  onApiKeyChange,
}) {
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');

  // Get the actual model ID (handles custom models)
  const getActualModelId = () => {
    return modelId === 'custom' ? customModelId : modelId;
  };

  // Load API key for current model when model changes or component opens
  useEffect(() => {
    if (isOpen) {
      try {
        const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
        const actualId = getActualModelId();
        const keyForModel = actualId ? (storedKeys[actualId] || '') : '';
        setLocalApiKey(keyForModel);
        onApiKeyChange(keyForModel);
      } catch (error) {
        console.error('Failed to load API keys from localStorage:', error);
      }
    }
  }, [modelId, customModelId, isOpen, onApiKeyChange]);

  // Save API key when it changes
  const handleApiKeyChange = (newKey) => {
    setLocalApiKey(newKey);
    onApiKeyChange(newKey);
    
    // Save to localStorage as a pair with model
    try {
      const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
      const actualId = getActualModelId();
      if (actualId) {
        storedKeys[actualId] = newKey;
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(storedKeys));
      }
    } catch (error) {
      console.error('Failed to save API key to localStorage:', error);
    }
  };

  // Handle model change - load corresponding API key
  const handleModelChange = (newModelId) => {
    onModelIdChange(newModelId);
    
    // Load API key for the new model (will be updated by useEffect when customModelId is set)
    if (newModelId !== 'custom') {
      try {
        const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
        const keyForModel = storedKeys[newModelId] || '';
        setLocalApiKey(keyForModel);
        onApiKeyChange(keyForModel);
      } catch (error) {
        console.error('Failed to load API key for model:', error);
      }
    }
  };

  const actualModelId = modelId === 'custom' ? customModelId : modelId;
  const provider = getProvider(actualModelId || 'gemini-3-flash-preview');
  const isGemini = provider === 'gemini';

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Model & API Key Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Model
              </label>
              <select
                value={modelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat cursor-pointer"
              >
                <optgroup label="Google Gemini (Free with limits)">
                  <option value="gemini-3-flash-preview">Gemini 3 Flash Preview (Default) - Free</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash - Free</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite - Free</option>
                </optgroup>
                <optgroup label="Google Gemini (Paid)">
                  <option value="gemini-3-pro-preview">Gemini 3 Pro Preview - Paid</option>
                </optgroup>
                <optgroup label="OpenAI GPT-5 Series (Paid)">
                  <option value="gpt-5.2">GPT-5.2 - Paid</option>
                  <option value="gpt-5.1">GPT-5.1 - Paid</option>
                  <option value="gpt-5.1-codex-max">GPT-5.1 Codex Max - Paid</option>
                  <option value="gpt-5.1-codex-mini">GPT-5.1 Codex Mini - Paid</option>
                  <option value="gpt-5-nano">GPT-5 Nano - Paid</option>
                </optgroup>
                <option value="custom">Custom Model ID...</option>
              </select>

              {modelId === 'custom' && (
                <input
                  type="text"
                  placeholder="e.g. gemini-2.0-flash-exp or gpt-4"
                  value={customModelId}
                  onChange={(e) => onCustomModelIdChange(e.target.value)}
                  className="w-full mt-3 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              )}
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                API Key {isGemini ? '(Gemini)' : '(OpenAI)'}
              </label>
              <input
                type="password"
                placeholder={`Enter ${isGemini ? 'Gemini' : 'OpenAI'} API Key`}
                value={localApiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              <div className="mt-2">
                <a
                  href={isGemini ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    isGemini
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                      : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400'
                  }`}
                >
                  Get {isGemini ? 'Gemini' : 'OpenAI'} API Key
                </a>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                API keys are saved per model. Each model will remember its own API key.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-slate-200 space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


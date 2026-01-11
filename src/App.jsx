import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar.jsx';
import ModelKeySettings from './components/ModelKeySettings.jsx';
import UploadCard from './components/UploadCard.jsx';
import AnalysisPanel from './components/AnalysisPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import RefinementBar from './components/RefinementBar.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import useClearAi from './hooks/useClearAi.js';

const API_KEYS_STORAGE_KEY = 'clear-redesigner-api-keys'; // { modelId: apiKey }
const MODEL_ID_STORAGE_KEY = 'clear-redesigner-model-id';
const CUSTOM_MODEL_ID_STORAGE_KEY = 'clear-redesigner-custom-model-id';

// Helper to get the actual model ID (handles custom models)
const getActualModelId = (modelId, customModelId) => {
  return modelId === 'custom' ? customModelId : modelId;
};

export default function App() {
  // Load model selection from localStorage on mount
  const [modelId, setModelId] = useState(() => {
    try {
      return localStorage.getItem(MODEL_ID_STORAGE_KEY) || 'gemini-3-flash-preview';
    } catch (error) {
      console.error('Failed to load model ID from localStorage:', error);
      return 'gemini-3-flash-preview';
    }
  });
  
  const [customModelId, setCustomModelId] = useState(() => {
    try {
      return localStorage.getItem(CUSTOM_MODEL_ID_STORAGE_KEY) || '';
    } catch (error) {
      console.error('Failed to load custom model ID from localStorage:', error);
      return '';
    }
  });

  // Load API key for the selected model
  const [apiKey, setApiKey] = useState(() => {
    try {
      const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
      const initialModelId = localStorage.getItem(MODEL_ID_STORAGE_KEY) || 'gemini-3-flash-preview';
      const initialCustomModelId = localStorage.getItem(CUSTOM_MODEL_ID_STORAGE_KEY) || '';
      const actualModelId = initialModelId === 'custom' ? initialCustomModelId : initialModelId;
      return actualModelId ? (storedKeys[actualModelId] || '') : '';
    } catch (error) {
      console.error('Failed to load API key from localStorage:', error);
      return '';
    }
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [userContext, setUserContext] = useState(''); 
  const [activeTab, setActiveTab] = useState('preview');
  const [showSettings, setShowSettings] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const {
    isAnalyzing,
    isRound1Analyzing,
    isRound2Generating,
    isRefining,
    analysisResult,
    generatedCode,
    error,
    setError,
    setAnalysisResult,
    setGeneratedCode,
    analyze,
    iterate,
    refine,
  } = useClearAi();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setGeneratedCode(null);
      setError(null);
    }
  };

  const runAnalyze = () =>
    analyze({ apiKey, modelId, customModelId, imageFile, userContext });

  // Load API key when model changes
  useEffect(() => {
    try {
      const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
      const actualModelId = getActualModelId(modelId, customModelId);
      const keyForModel = actualModelId ? (storedKeys[actualModelId] || '') : '';
      setApiKey(keyForModel);
    } catch (error) {
      console.error('Failed to load API key for model:', error);
    }
  }, [modelId, customModelId]);

  // Save model selection to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(MODEL_ID_STORAGE_KEY, modelId);
    } catch (error) {
      console.error('Failed to save model ID to localStorage:', error);
    }
  }, [modelId]);

  // Save custom model ID to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_MODEL_ID_STORAGE_KEY, customModelId);
    } catch (error) {
      console.error('Failed to save custom model ID to localStorage:', error);
    }
  }, [customModelId]);

  const handleAnalyze = () => {
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    runAnalyze();
  };

  const handleIteration = () =>
    iterate({ apiKey, modelId, customModelId, imageFile, generatedCode, userContext });

  const handleRefine = async () => {
    await refine({ apiKey, modelId, customModelId, generatedCode, prompt: refinePrompt });
         setRefinePrompt('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <HeaderBar
        onToggleSettings={() => setShowSettings((prev) => !prev)}
        modelId={modelId}
        customModelId={customModelId}
        apiKey={apiKey}
      />

      <ModelKeySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        modelId={modelId}
        onModelIdChange={setModelId}
        customModelId={customModelId}
        onCustomModelIdChange={setCustomModelId}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />

      <main className="flex-grow max-w-[1800px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6 flex flex-col h-[calc(100vh-8rem)]">
          <UploadCard
            imagePreview={imagePreview}
            onUpload={handleImageUpload}
            userContext={userContext}
            onUserContextChange={setUserContext}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            hasImage={!!imageFile}
            error={error}
          />

          <AnalysisPanel
            analysisResult={analysisResult}
            isAnalyzing={isRound1Analyzing}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-8rem)] space-y-4">
          <PreviewPanel
            generatedCode={generatedCode}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAnalyzing={isRound1Analyzing || isRound2Generating}
          />

          <RefinementBar
            refinePrompt={refinePrompt}
            onRefinePromptChange={setRefinePrompt}
            onRefine={handleRefine}
            onIterate={handleIteration}
            isRefining={isRefining}
            isAnalyzing={isAnalyzing}
            hasGeneratedCode={!!generatedCode}
          />
        </div>
      </main>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onConfirm={() => {
          if (!apiKey) return;
          setShowApiKeyModal(false);
          runAnalyze();
        }}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}

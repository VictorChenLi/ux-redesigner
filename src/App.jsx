import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar.jsx';
import UploadCard from './components/UploadCard.jsx';
import AnalysisPanel from './components/AnalysisPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import RefinementBar from './components/RefinementBar.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';
import useClearAi from './hooks/useClearAi.js';

const API_KEY_STORAGE_KEY = 'clear-redesigner-api-key';

export default function App() {
  // Load API key from localStorage on mount
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    } catch (error) {
      console.error('Failed to load API key from localStorage:', error);
      return '';
    }
  });
  const [modelId, setModelId] = useState('gemini-3-flash-preview'); 
  const [customModelId, setCustomModelId] = useState('');
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

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      try {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      } catch (error) {
        console.error('Failed to save API key to localStorage:', error);
      }
    }
  }, [apiKey]);

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
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((prev) => !prev)}
        modelId={modelId}
        onModelIdChange={setModelId}
        customModelId={customModelId}
        onCustomModelChange={setCustomModelId}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6 flex flex-col h-[calc(100vh-8rem)]">
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

        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-8rem)] space-y-4">
          <PreviewPanel
            generatedCode={generatedCode}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAnalyzing={isRound2Generating}
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

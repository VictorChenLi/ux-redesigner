# Multiple AI Model Selection and Popout Implementation

This document describes how this project implements multiple AI model selection with a popout/modal interface for configuring models and API keys.

## Overview

The implementation provides:
- **Multiple AI Provider Support**: Supports Google Gemini and OpenAI models
- **Model Selection UI**: Dropdown with grouped model options (free/paid, provider-based)
- **Custom Model Support**: Ability to enter custom model IDs
- **Per-Model API Key Storage**: Each model remembers its own API key in localStorage
- **Popout Modal**: Settings modal that can be triggered from the header
- **Unified API Handler**: Single interface for making API calls regardless of provider

## Architecture

### Components

1. **`ModelKeySettings.jsx`** - The main popout modal component
2. **`HeaderBar.jsx`** - Header with button to trigger the modal
3. **`modelHandlers.js`** - Utility functions for model detection and API calls
4. **`App.jsx`** - Main app component managing state and localStorage

### State Management

The implementation uses React state with localStorage persistence:

- **Model Selection**: `modelId` (e.g., "gemini-3-flash-preview", "gpt-5.2", "custom")
- **Custom Model ID**: `customModelId` (when modelId === "custom")
- **API Keys**: Stored as `{ modelId: apiKey }` object in localStorage
- **Modal Visibility**: `showSettings` boolean state

## Implementation Details

### 1. Storage Keys

```javascript
const API_KEYS_STORAGE_KEY = 'clear-redesigner-api-keys'; // { modelId: apiKey }
const MODEL_ID_STORAGE_KEY = 'clear-redesigner-model-id';
const CUSTOM_MODEL_ID_STORAGE_KEY = 'clear-redesigner-custom-model-id';
```

### 2. Model Selection Component (`ModelKeySettings.jsx`)

#### Key Features:

- **Modal Overlay**: Fixed position overlay with backdrop blur
- **Model Dropdown**: Grouped options by provider and pricing tier
- **Custom Model Input**: Conditional input field when "custom" is selected
- **API Key Input**: Password field that changes label based on provider
- **Per-Model Key Loading**: Automatically loads the API key for the selected model
- **Auto-Save**: Saves API key to localStorage when changed

#### Component Props:

```javascript
{
  isOpen: boolean,              // Controls modal visibility
  onClose: () => void,          // Close handler
  modelId: string,              // Current selected model ID
  onModelIdChange: (id) => void, // Model change handler
  customModelId: string,        // Custom model ID value
  onCustomModelIdChange: (id) => void, // Custom model ID change handler
  apiKey: string,               // Current API key
  onApiKeyChange: (key) => void // API key change handler
}
```

#### Model Change Logic:

```javascript
const handleModelChange = (newModelId) => {
  onModelIdChange(newModelId);
  
  // Load API key for the new model
  if (newModelId !== 'custom') {
    const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
    const keyForModel = storedKeys[newModelId] || '';
    setLocalApiKey(keyForModel);
    onApiKeyChange(keyForModel);
  }
};
```

#### API Key Persistence:

```javascript
const handleApiKeyChange = (newKey) => {
  setLocalApiKey(newKey);
  onApiKeyChange(newKey);
  
  // Save to localStorage as a pair with model
  const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
  const actualId = getActualModelId(); // Handles custom models
  if (actualId) {
    storedKeys[actualId] = newKey;
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(storedKeys));
  }
};
```

### 3. Model Detection Utilities (`modelHandlers.js`)

#### Provider Detection:

```javascript
export const isOpenAIModel = (modelId) => {
  return modelId.startsWith('gpt-') || 
         modelId.startsWith('o1-') || 
         modelId.startsWith('o3-');
};

export const isGPT5Model = (modelId) => {
  return modelId.startsWith('gpt-5');
};
```

#### Endpoint Resolution:

```javascript
export const getModelEndpoint = (modelId, apiKey) => {
  if (isOpenAIModel(modelId)) {
    return 'https://api.openai.com/v1/chat/completions';
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
};
```

### 4. Unified API Call Handler

The `makeModelAPICall` function provides a single interface for all model providers:

```javascript
export const makeModelAPICall = async ({
  modelId,
  apiKey,
  prompt,
  imageFile = null,
  customModelId = null,
}) => {
  const targetModel = modelId === 'custom' ? customModelId : modelId;
  const isOpenAI = isOpenAIModel(targetModel);
  const endpoint = getModelEndpoint(targetModel, apiKey);
  
  // Create provider-specific payloads
  let payload, headers;
  
  if (isOpenAI) {
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    payload = createOpenAIPayload(targetModel, prompt, imageUrl, isGPT5);
  } else {
    headers = { 'Content-Type': 'application/json' };
    payload = createGeminiPayload(prompt, imagePart);
  }
  
  // Make API call
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  
  // Parse response based on provider
  if (isOpenAI) {
    return parseOpenAIResponse(data, targetModel);
  } else {
    return parseGeminiResponse(data);
  }
};
```

### 5. App-Level State Management (`App.jsx`)

#### Initialization from localStorage:

```javascript
const [modelId, setModelId] = useState(() => {
  try {
    return localStorage.getItem(MODEL_ID_STORAGE_KEY) || 'gemini-3-flash-preview';
  } catch (error) {
    return 'gemini-3-flash-preview';
  }
});

const [apiKey, setApiKey] = useState(() => {
  try {
    const storedKeys = JSON.parse(localStorage.getItem(API_KEYS_STORAGE_KEY) || '{}');
    const initialModelId = localStorage.getItem(MODEL_ID_STORAGE_KEY) || 'gemini-3-flash-preview';
    const actualModelId = getActualModelId(initialModelId, customModelId);
    return actualModelId ? (storedKeys[actualModelId] || '') : '';
  } catch (error) {
    return '';
  }
});
```

#### Auto-Load API Key on Model Change:

```javascript
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
```

#### Persist Model Selection:

```javascript
useEffect(() => {
  try {
    localStorage.setItem(MODEL_ID_STORAGE_KEY, modelId);
  } catch (error) {
    console.error('Failed to save model ID to localStorage:', error);
  }
}, [modelId]);
```

### 6. Header Bar Integration (`HeaderBar.jsx`)

The header displays the current model and provides a clickable button to open settings:

```javascript
<button
  onClick={onToggleSettings}
  className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full..."
>
  <span>{modelDisplayName}</span>
  {hasApiKey ? (
    <Check className="w-4 h-4 text-green-600" />
  ) : (
    <X className="w-4 h-4 text-red-500" />
  )}
  <Settings className="w-4 h-4 text-slate-500" />
</button>
```

## Usage Example

### Basic Setup in App Component:

```javascript
const [showSettings, setShowSettings] = useState(false);
const [modelId, setModelId] = useState('gemini-3-flash-preview');
const [customModelId, setCustomModelId] = useState('');
const [apiKey, setApiKey] = useState('');

return (
  <>
    <HeaderBar
      onToggleSettings={() => setShowSettings(true)}
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
  </>
);
```

### Making API Calls:

```javascript
import { makeModelAPICall } from './utils/modelHandlers.js';

const result = await makeModelAPICall({
  modelId: 'gemini-3-flash-preview',
  apiKey: 'your-api-key',
  prompt: 'Your prompt here',
  imageFile: fileObject, // Optional
  customModelId: null,   // Only needed if modelId === 'custom'
});
```

## Model Configuration

### Supported Models

The dropdown includes:

**Google Gemini (Free)**:
- `gemini-3-flash-preview`
- `gemini-2.5-flash`
- `gemini-2.5-flash-lite`

**Google Gemini (Paid)**:
- `gemini-3-pro-preview`

**OpenAI GPT-5 Series (Paid)**:
- `gpt-5.2`
- `gpt-5.1`

**Custom**: Allows entering any model ID

### Adding New Models

To add new models, update the dropdown in `ModelKeySettings.jsx`:

```javascript
<select value={modelId} onChange={(e) => handleModelChange(e.target.value)}>
  <optgroup label="Provider Name">
    <option value="model-id">Model Display Name</option>
  </optgroup>
  <option value="custom">Custom Model ID...</option>
</select>
```

The model handlers will automatically detect the provider based on the model ID prefix.

## Key Design Decisions

1. **Per-Model API Keys**: Each model stores its own API key, allowing users to switch between models without re-entering keys.

2. **Custom Model Support**: The "custom" option allows flexibility for new or experimental models without code changes.

3. **Provider Detection**: Automatic provider detection based on model ID prefixes simplifies API call routing.

4. **Unified API Interface**: Single `makeModelAPICall` function abstracts provider differences.

5. **localStorage Persistence**: All settings persist across page reloads.

6. **Modal Pattern**: Settings modal provides focused UI without navigation.

## Styling Notes

The modal uses Tailwind CSS classes:
- Fixed overlay with backdrop blur (`fixed inset-0 bg-black/50 z-40`)
- Centered modal container (`flex items-center justify-center`)
- Responsive design (`max-w-2xl w-full max-h-[90vh]`)
- Custom select styling with SVG arrow icon

## Error Handling

- localStorage operations wrapped in try-catch blocks
- API call errors include model name in error message
- Graceful fallbacks if localStorage is unavailable

## Future Enhancements

Potential improvements:
- Model favorites/recently used
- API key validation before saving
- Model capability indicators (vision, text-only, etc.)
- Usage statistics per model
- Bulk model configuration import/export

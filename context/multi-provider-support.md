# Multi-Provider AI Model Support

## Overview

The application supports multiple AI providers (Google Gemini and OpenAI) with unified API handling and model-specific optimizations.

## Supported Providers

### Google Gemini
- **Models**: 
  - Gemini 3 Flash Preview (default)
  - Gemini 2.5 Flash
  - Gemini 2.5 Flash Lite
  - Gemini 3 Pro Preview
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/{modelId}:generateContent`
- **Authentication**: API key in query parameter
- **Image Format**: Base64 inline data (via `fileToGenerativePart()`)
- **Payload Structure**: `contents` array with `parts` containing text and `inlineData`

### OpenAI
- **Models**:
  - GPT-5.2
  - GPT-5.1
- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token in Authorization header
- **Image Format**: Base64 data URL (via `fileToOpenAIImageUrl()`)
- **Payload Structure**: `messages` array with `content` containing text and `image_url`
- **Token Limits**: 
  - GPT-5 models: `max_completion_tokens: 32000`
  - Other models: `max_tokens: 8192`

## Implementation

### Model Handlers (`src/utils/modelHandlers.js`)

Centralized utility module containing:

1. **Model Detection**:
   - `isOpenAIModel()`: Detects OpenAI models
   - `isGPT5Model()`: Detects GPT-5 series models
   - `getModelEndpoint()`: Returns correct API endpoint

2. **Image Conversion**:
   - `fileToGenerativePart()`: Converts to Gemini format
   - `fileToOpenAIImageUrl()`: Converts to OpenAI format

3. **API Payload Creation**:
   - `createOpenAIPayload()`: Creates OpenAI request payload
   - `createGeminiPayload()`: Creates Gemini request payload

4. **Response Parsing**:
   - `parseOpenAIResponse()`: Extracts content from OpenAI response
   - `parseGeminiResponse()`: Extracts content from Gemini response

5. **Unified API Call**:
   - `makeModelAPICall()`: Single function handling all API calls
   - Automatically selects correct provider, format, and parsing

### Model Settings (`src/components/ModelKeySettings.jsx`)

- **Consolidated UI**: Model selection and API key input in single overlay
- **Per-Model Keys**: API keys stored as `{ modelId: apiKey }` in localStorage
- **Dynamic Placeholders**: Updates based on selected model (Gemini vs OpenAI)
- **Provider Links**: Direct links to get API keys from respective providers

### API Key Management

- **Storage**: `localStorage` key `clear-redesigner-api-keys` stores object mapping model IDs to API keys
- **Loading**: Automatically loads correct API key when model changes
- **Persistence**: Keys persist across sessions per model

## Benefits

1. **Flexibility**: Users can choose between free (Gemini) and paid (OpenAI) models
2. **Unified Interface**: Same UI for all models regardless of provider
3. **Maintainability**: Provider-specific logic isolated in utility module
4. **Extensibility**: Easy to add new providers or models
5. **User Experience**: Clear labeling of free vs paid models

## File Locations

- **Model Handlers**: `src/utils/modelHandlers.js`
- **Settings Component**: `src/components/ModelKeySettings.jsx`
- **Hook Integration**: `src/hooks/useClearAi.js` (uses `makeModelAPICall()`)
- **Header Display**: `src/components/HeaderBar.jsx` (shows model info)


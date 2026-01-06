// Model detection helpers
export const isOpenAIModel = (modelId) => {
  return modelId.startsWith('gpt-') || modelId.startsWith('o1-') || modelId.startsWith('o3-');
};

export const isGPT5Model = (modelId) => {
  return modelId.startsWith('gpt-5');
};

// API endpoint helpers
export const getModelEndpoint = (modelId, apiKey) => {
  if (isOpenAIModel(modelId)) {
    return 'https://api.openai.com/v1/chat/completions';
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
};

// Image format conversion helpers
export async function fileToGenerativePart(file) {
  if (!file) {
    throw new Error('Please add an image first (drag/drop or choose a file).');
  }

  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(new Error('Unable to read image data.'));
      }
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        return reject(new Error('Unable to parse image data.'));
      }
      const base64 = result.slice(commaIndex + 1);
      if (!base64) {
        return reject(new Error('Image data is empty.'));
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Unable to read image. Please try another file.'));
    reader.onabort = () => reject(new Error('Image read was aborted. Please retry.'));
    try {
      reader.readAsDataURL(file);
    } catch (err) {
      reject(new Error('Unable to read image. Please try another file.'));
    }
  });

  const mimeType = typeof file.type === 'string' && file.type ? file.type : 'application/octet-stream';

  return {
    inlineData: { data, mimeType },
  };
}

export async function fileToOpenAIImageUrl(file) {
  if (!file) {
    throw new Error('Please add an image first (drag/drop or choose a file).');
  }

  const data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(new Error('Unable to read image data.'));
      }
      resolve(result); // Return full data URL for OpenAI
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  return data;
}

// OpenAI API handlers
export const createOpenAIPayload = (modelId, prompt, imageUrl = null, isGPT5 = false) => {
  const basePayload = {
    model: modelId,
    ...(isGPT5 ? { max_completion_tokens: 32000 } : { max_tokens: 8192 }),
    temperature: 0.4,
  };

  if (imageUrl) {
    // Round 1: Analysis with image
    return {
      ...basePayload,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    };
  } else {
    // Round 2 or Refine: Text only
    return {
      ...basePayload,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
  }
};

export const parseOpenAIResponse = (data, targetModel) => {
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  } else if (data.choices?.[0]?.delta?.content) {
    // Streaming response format
    return data.choices[0].delta.content;
  } else if (data.content) {
    // Direct content field
    return data.content;
  } else {
    const choice = data.choices?.[0];
    const finishReason = choice?.finish_reason;
    if (finishReason === 'length') {
      throw new Error(`Response was truncated due to token limit. The generated code may be incomplete. Try reducing the analysis length or increase max_completion_tokens.`);
    }
    throw new Error(`No response generated. Finish reason: ${finishReason || 'unknown'}`);
  }
};

// Gemini API handlers
export const createGeminiPayload = (prompt, imagePart = null) => {
  if (imagePart) {
    // Round 1: Analysis with image
    return {
      contents: [{ parts: [{ text: prompt }, imagePart] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    };
  } else {
    // Round 2 or Refine: Text only
    return {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    };
  }
};

export const parseGeminiResponse = (data) => {
  if (!data.candidates?.[0]?.content) {
    throw new Error('No response generated.');
  }
  return data.candidates[0].content.parts[0].text;
};

// Unified API call handler
export const makeModelAPICall = async ({
  modelId,
  apiKey,
  prompt,
  imageFile = null,
  customModelId = null,
}) => {
  const targetModel = modelId === 'custom' ? customModelId : modelId;
  const isOpenAI = isOpenAIModel(targetModel);
  const isGPT5 = isGPT5Model(targetModel);
  const endpoint = getModelEndpoint(targetModel, apiKey);

  let payload;
  let headers;

  if (isOpenAI) {
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await fileToOpenAIImageUrl(imageFile);
    }

    payload = createOpenAIPayload(targetModel, prompt, imageUrl, isGPT5);
  } else {
    headers = { 'Content-Type': 'application/json' };

    let imagePart = null;
    if (imageFile) {
      imagePart = await fileToGenerativePart(imageFile);
    }

    payload = createGeminiPayload(prompt, imagePart);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: { message: `HTTP ${response.status}: ${response.statusText}` },
    }));
    const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
    throw new Error(`Model "${targetModel}": ${errorMessage}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Model "${targetModel}": ${data.error.message}`);
  }

  // Parse response based on provider
  if (isOpenAI) {
    return parseOpenAIResponse(data, targetModel);
  } else {
    return parseGeminiResponse(data);
  }
};


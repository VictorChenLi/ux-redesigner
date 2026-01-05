import { useState } from 'react';

const SYSTEM_PROMPT = `
  You are an expert UI/UX Designer and Frontend Developer. 
  I will provide a screenshot of a user interface. 
  
  YOUR TASK:
  1. Analyze the design using the C.L.E.A.R. UI framework:
    - C (Copywriting): Evaluate tone, clarity, and instructions.
      - [Clear Benefit] Is the main benefit obvious at a glance?
      - [Concise Copy] Is the copy lean, with fillers removed?
      - [Concrete Claims] Are claims concrete instead of vague?
      - [Action Labels] Do buttons use clear verbs with expected outcomes?
      - [Risk Reassure] Are doubts/risks answered (“what if”s)?
      - [Remove Fluff] Can anything be removed without losing meaning?
      - [Human Voice] Does it read like a human speaking naturally?
    - L (Layout): Evaluate grouping, alignment, and whitespace (Gestalt cues).
      - [Proximity] Are related items closer together than unrelated items?
      - [Similarity] Do like elements share look/size so roles are obvious?
      - [Alignment] Are edges on a consistent grid (esp. left edges)?
      - [Common Region] Are groups bounded/sectioned so they read as one?
      - [Continuity] Is the scan path smooth (no zig-zag)? Top-left → bottom?
      - [Simplicity] Can you remove styling/variants and keep clarity?
      - [Clear Zones] Can you distinguish header/main/sidebar/footer at a glance?
     - E (Emphasis): Evaluate visual hierarchy and focal points.
     - A (Accessibility): Evaluate contrast, touch targets, and readability.
     - R (Reward): Evaluate friction and user feedback.
  
  2. Provide a critique for each letter of the framework.
  
  3. GENERATE A COMPLETE REDESIGN:
     - Write a single, self-contained HTML file (with embedded CSS and JS).
     - The redesign MUST address the flaws identified in the analysis.
     - Use modern design principles (clean typography, generous whitespace, clear hierarchy).
     - Make it fully responsive and beautiful.
  
  OUTPUT FORMAT:
  - Start with the C.L.E.A.R. analysis in plain text (Markdown style).
  - Then, provide the code block wrapped in \`\`\`html ... \`\`\`.
`;

const MODEL_ENDPOINT = (modelId, apiKey) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

async function fileToGenerativePart(file) {
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

function extractHtmlAndAnalysis(textResponse) {
  const htmlMatch = textResponse.match(/```html([\s\S]*?)```/);
  if (htmlMatch && htmlMatch[1]) {
    return {
      code: htmlMatch[1].trim(),
      analysis: textResponse.replace(/```html[\s\S]*?```/, ''),
    };
  }
  return { code: '', analysis: textResponse };
}

export default function useClearAi() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async ({ apiKey, modelId, customModelId, imageFile, userContext }) => {
    if (!apiKey) return setError('Please enter your Gemini API Key first.');
    if (!imageFile) return setError('Please upload an image to analyze.');

    const targetModel = modelId === 'custom' ? customModelId : modelId;
    setIsAnalyzing(true);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(imageFile);
      let fullPrompt = SYSTEM_PROMPT;
      if (userContext?.trim()) {
        fullPrompt += `\n\nADDITIONAL CONTEXT FROM USER:\n"${userContext.trim()}"\n\nPlease incorporate this context into your analysis and redesign decisions.`;
      }

      const payload = {
        contents: [{ parts: [{ text: fullPrompt }, imagePart] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(MODEL_ENDPOINT(targetModel, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates?.[0]?.content) throw new Error('No content generated.');

      const textResponse = data.candidates[0].content.parts[0].text;
      const { code, analysis } = extractHtmlAndAnalysis(textResponse);

      setAnalysisResult(analysis);
      setGeneratedCode(code);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const iterate = async ({ apiKey, modelId, customModelId, imageFile, generatedCode, userContext }) => {
    if (!apiKey || !generatedCode) return;

    const targetModel = modelId === 'custom' ? customModelId : modelId;
    setIsAnalyzing(true);
    setError(null);

    try {
      let iterationPrompt = `
        You are an expert Senior UI/UX Designer.
        
        CONTEXT:
        We are iterating on a design. Below is the current HTML/CSS implementation generated in the previous step.
        
        CURRENT CODE:
        ${generatedCode}
        
        YOUR TASK:
        1. Conduct a "Round 2" C.L.E.A.R. framework analysis on this SPECIFIC code. 
           - Be stricter than before. 
           - Look for finer details in Layout spacing, Typography hierarchy, and Accessibility that could be improved.
        2. Provide the critique of the current code.
        3. Generate a SUPERIOR version of the code (Iteration 2).
        
        OUTPUT FORMAT:
        - Start with the C.L.E.A.R. analysis in plain text (Markdown).
        - Then provide the code block wrapped in \`\`\`html ... \`\`\`.
      `;

      if (userContext?.trim()) {
        iterationPrompt += `\n\nREMINDER - ORIGINAL USER CONTEXT:\n"${userContext.trim()}"`;
      }

      const parts = [{ text: iterationPrompt }];
      if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        parts.push(imagePart);
      }

      const payload = {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 8192,
        },
      };

      const response = await fetch(MODEL_ENDPOINT(targetModel, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates?.[0]?.content) throw new Error('No content generated.');

      const textResponse = data.candidates[0].content.parts[0].text;
      const { code, analysis } = extractHtmlAndAnalysis(textResponse);

      setAnalysisResult(analysis);
      setGeneratedCode(code);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during iteration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refine = async ({ apiKey, modelId, customModelId, generatedCode, prompt }) => {
    if (!apiKey || !generatedCode || !prompt?.trim()) return;

    const targetModel = modelId === 'custom' ? customModelId : modelId;
    setIsRefining(true);
    setError(null);

    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are a frontend developer refining a UI.
                
                CURRENT HTML CODE:
                ${generatedCode}
                
                USER REQUEST:
                ${prompt}
                
                TASK:
                Update the HTML code to satisfy the user request.
                Return ONLY the raw HTML code wrapped in \`\`\`html ... \`\`\`. Do not include markdown or explanations outside the code block.`,
              },
            ],
          },
        ],
      };

      const response = await fetch(MODEL_ENDPOINT(targetModel, apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const textResponse = data.candidates[0].content.parts[0].text;
      const htmlMatch = textResponse.match(/```html([\s\S]*?)```/);

      if (htmlMatch && htmlMatch[1]) {
        setGeneratedCode(htmlMatch[1].trim());
      } else if (textResponse.includes('<html')) {
        setGeneratedCode(textResponse.trim());
      } else {
        throw new Error('Could not parse HTML from response.');
      }
    } catch (err) {
      console.error(err);
      setError(`Refinement failed: ${err.message}`);
    } finally {
      setIsRefining(false);
    }
  };

  return {
    isAnalyzing,
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
  };
}


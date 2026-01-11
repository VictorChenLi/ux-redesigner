import { useState } from 'react';
import { makeModelAPICall } from '../utils/modelHandlers.js';

const ANALYSIS_PROMPT = `
  You are an expert UI/UX Designer. 
  I will provide a screenshot of a user interface. 
  
  YOUR TASK:
  1. Analyze the design using the C.L.E.A.R. UI framework:
    - C (Copywriting): Evaluate tone, clarity, and instructions.
      - [Clear Benefit] Is the main benefit obvious at a glance?
      - [Concise Copy] Is the copy lean, with fillers removed?
      - [Concrete Claims] Are claims concrete instead of vague?
      - [Action Labels] Do buttons use clear verbs with expected outcomes?
      - [Risk Reassure] Are doubts/risks answered ("what if"s)?
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
    - E (Emphasis): Evaluate visual hierarchy and focal points using the 6 emphasis dials (Size, Color, Space, Placement, Visualization, Motion).
      - [Focal Point] What's the first thing your eye hits? Does that focal point match the screen's main goal? The thing that pops first should be the key action or message, not a logo or random button.
      - [Size] Are primary actions noticeably larger than secondary ones? Make the primary message/action noticeably larger than its neighbors. Turn down surrounding elements so the "hero" doesn't have to do all the work.
      - [Color] Do primary actions clearly stand out from secondary ones using accent color? Use accent color to make key actions grab attention. Use color to highlight important information (status, warnings, success). Use muted color to demote secondary details so they don't compete.
      - [Space] Is whitespace helping key elements stand out? Add breathing room around the primary element to make it stand out. Buy space by shrinking or removing secondary stuff (logos, helper text, extras). Keep related elements close while isolating the group.
      - [Placement] Is the primary message/action in "prime real estate" (top/first scan)? Use top/first scan for the primary message or status. Match the context: urgency changes what people look for first. Place the action close to the decision moment (near the info that justifies it).
      - [Visualization] Are visuals used to show meaning at-a-glance? Turn abstract text into a visual pattern (progress bar, chart, illustration, icon). Prefer "at-a-glance" meaning over paragraphs people must read. Use the familiar pattern that matches the message.
      - [Motion] Does motion reinforce the screen's goal without being distracting? Use motion to reinforce the screen's goal (guide attention, confirm change, show progress). Avoid "eye candy": motion without purpose is wasted attention. Keep it subtle and focused on the main insight.
      - [Blur Test] Does the blur test highlight the right elements? Squint or blur the screen; only the truly important elements should still stand out in the fog.
      - [Visual Competition] Are only a few things "shouting"? If everything is bold, colorful, or large, nothing feels important; dial down styling on supporting pieces. Is any decoration stealing attention from what matters? Icons, illustrations, or backgrounds should support the main goal, not compete with it.
    - A (Accessibility): Evaluate accessibility using the 3 accessibility principles (Visible without searching, Operable without precision, Actionable without guessing) and check for common mistakes.
      - [Visible without searching] Is the main action or key message visible without opening menus, scrolling, or closing popups/overlays? Can you see what to do immediately without searching or guessing?
      - [Operable without precision] Are primary actions large enough and spaced so you can tap/click them without hitting another element by mistake? Are touch targets large enough (minimum 44x44px) and adequately spaced to avoid accidental taps, especially for users with reduced dexterity (thumb, motion, fatigue)?
      - [Actionable without guessing] Do buttons, links, and controls clearly look tappable (shape, style, microcopy) so people don't have to guess what's interactive? Do actions look like actions with proper visual affordances (hover states, focus indicators)?
      - [Sufficient contrast] Does important text (and icons) have enough contrast with the background to remain readable in low light or without perfect vision? Check that text meets WCAG contrast requirements (AA: 4.5:1 for normal text, 3:1 for large text).
      - [Not only color] If you remove color, can people still understand status, categories, or chart values thanks to labels, icons, or patterns? Does the interface rely solely on color to convey meaning? For color-blind users, ensure information is communicated through multiple channels (color + text, color + icon, color + pattern).
      - [Hint: There's more...] When content overflows, is there a clear visual hint? Are key actions hidden or require discovery? Do users know there's more content available (scroll indicators, pagination, "show more" buttons)?
      - [Low risk of mistakes] Are destructive or high-stakes actions separated from frequent ones, clearly labeled, and confirmed when needed? Could a tired, distracted, one-handed person still see what to do, hit the right target, and feel confident using this screen without accidentally triggering unwanted actions?
      - [Imagine the worst conditions...] Could a tired, distracted, one-handed person still see what to do, hit the right target, and feel confident using this screen? Consider reduced cognitive load, physical limitations, and environmental factors (low light, motion, fatigue). This comprehensive check covers patterns, knowledge assumptions, and overall usability under challenging conditions.
     - R (Reward): Evaluate friction and user feedback.
  
  2. For each letter of the framework, provide:
     - A module score: Assign a score from 0-20 for this module based on the quality and issues found
       * 0-9: Critical issues, major problems
       * 10-17: Needs improvement, moderate issues
       * 18-20: Pass, meets standards with minor or no issues
     - A detailed critique of the current design (e.g., • Friction: ..., • Feedback: ..., etc.)
     - At the end of each module, ALWAYS include: • Redesign Suggestion: [specific, actionable redesign recommendation for this module]
  
  OUTPUT FORMAT:
  - Provide the C.L.E.A.R. analysis in Markdown format using ## headers (not ####)
  - For EACH module (C, L, E, A, R), follow this structure:
    1. Module header: ## C - Copywriting (or L - Layout, E - Emphasis, A - Accessibility, R - Reward)
    2. Score line (first line after header): "Score: XX/20" (where XX is a number from 0-20)
    3. Critique bullet points with BOLD labels and detailed analysis:
       - Format: • **Label:** [comprehensive analysis explaining the issue, observation, or finding]
       - Each bullet must use bold markdown (**text**) for the label, followed by a colon and detailed analysis
       - IMPORTANT: Only include critique points for evaluation aspects where there are issues, problems, or noteworthy observations. Do NOT include critique points for aspects that are working well or have no issues. Focus on what needs improvement or what stands out (positively or negatively).
       - Module-specific critique points' labels (use only when there are issues or observations to report):
         * C - Copywriting: **Clear Benefit:**, **Concise Copy:**, **Concrete Claims:**, **Action Labels:**, **Risk Reassure:**, **Remove Fluff:**, **Human Voice:**
         * L - Layout: **Proximity:**, **Similarity:**, **Alignment:**, **Common Region:**, **Continuity:**, **Simplicity:**, **Clear Zones:**
         * E - Emphasis: **Focal Point:**, **Size:**, **Color:**, **Space:**, **Placement:**, **Visualization:**, **Motion:**, **Blur Test:**, **Visual Competition:**
         * A - Accessibility: **Visible without searching:**, **Operable without precision:**, **Actionable without guessing:**, **Sufficient contrast:**, **Not only color:**, **Hint: There's more...:**, **Low risk of mistakes:**, **Imagine the worst conditions...:**
         * R - Reward: **Friction:**, **Feedback:**, **User Delight:**, etc.
    4. Final bullet point: • **Redesign Suggestion:** [concrete, actionable recommendation for this specific module]
  - CRITICAL: Every module must include Score (0-20), critique points with bold labels (only for aspects with issues or observations), and a Redesign Suggestion. Do not skip any module. Only include critique points where there are actual issues or noteworthy findings to report.
  - Do NOT include HTML code or create a separate "Redesign" section. All redesign suggestions belong under their respective C.L.E.A.R. modules.
  - Do NOT provide an overall score. The overall score will be calculated as the sum of all five module scores (0-100).
`;

const CODE_GENERATION_PROMPT = (analysisResult, userContext) => `
  You are an expert Frontend Developer.
  
  CONTEXT:
  Below is a C.L.E.A.R. framework analysis and improvement suggestions for a user interface.
  
  ANALYSIS AND SUGGESTIONS:
  ${analysisResult}
  
  ${userContext ? `\nADDITIONAL USER CONTEXT:\n"${userContext}"\n` : ''}
  
  YOUR TASK:
  Generate a complete redesign based on the analysis above.
  
  REQUIREMENTS:
     - Write a single, self-contained HTML file (with embedded CSS and JS).
  - The redesign MUST address ALL the flaws and suggestions identified in the analysis.
     - Use modern design principles (clean typography, generous whitespace, clear hierarchy).
     - Make it fully responsive and beautiful.
  - Ensure the design follows the C.L.E.A.R. framework principles.
  
  OUTPUT FORMAT:
  - Return ONLY the HTML code block wrapped in \`\`\`html ... \`\`\`.
  - Do not include any markdown or explanations outside the code block.
`;


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
  const [isRound1Analyzing, setIsRound1Analyzing] = useState(false);
  const [isRound2Generating, setIsRound2Generating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [round1Analysis, setRound1Analysis] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState(null);

  const analyzeRound1 = async ({ apiKey, modelId, customModelId, imageFile, userContext }) => {
    console.log('[DEBUG] Round 1: Starting analysis...');
    if (!apiKey) throw new Error('Please enter your API Key first.');
    if (!imageFile) throw new Error('Please upload an image to analyze.');

    console.log('[DEBUG] Round 1: Setting isRound1Analyzing = true');
    setIsRound1Analyzing(true);
    setError(null);

    try {
      let fullPrompt = ANALYSIS_PROMPT;
      if (userContext?.trim()) {
        fullPrompt += `\n\nADDITIONAL CONTEXT FROM USER:\n"${userContext.trim()}"\n\nPlease incorporate this context into your analysis.`;
      }

      const analysisText = await makeModelAPICall({
        modelId,
        apiKey,
        prompt: fullPrompt,
        imageFile,
        customModelId,
      });

      console.log('[DEBUG] Round 1: Received analysis response, length:', analysisText.length);
      console.log('[DEBUG] Round 1: Calling setRound1Analysis...');
      setRound1Analysis(analysisText);
      console.log('[DEBUG] Round 1: Calling setAnalysisResult...');
      // Display analysis immediately in Framework Critique panel (before Round 2 starts)
      setAnalysisResult(analysisText);
      console.log('[DEBUG] Round 1: State updates called, returning analysis');
      return analysisText;
    } catch (err) {
      console.error('[DEBUG] Round 1: Error occurred', err);
      throw err;
    } finally {
      console.log('[DEBUG] Round 1: Setting isRound1Analyzing = false');
      setIsRound1Analyzing(false);
    }
  };

  const generateCodeRound2 = async ({ apiKey, modelId, customModelId, analysisResult, userContext }) => {
    console.log('[DEBUG] Round 2: Starting code generation...');
    if (!apiKey) throw new Error('Please enter your API Key first.');
    if (!analysisResult) throw new Error('Analysis result is required for code generation.');

    console.log('[DEBUG] Round 2: Setting isRound2Generating = true');
    setIsRound2Generating(true);
    setError(null);

    try {
      const fullPrompt = CODE_GENERATION_PROMPT(analysisResult, userContext);

      const textResponse = await makeModelAPICall({
        modelId,
        apiKey,
        prompt: fullPrompt,
        customModelId,
      });

      console.log('[DEBUG] Round 2: Received code response, length:', textResponse.length);
      const htmlMatch = textResponse.match(/```html([\s\S]*?)```/);
      
      if (htmlMatch && htmlMatch[1]) {
        const code = htmlMatch[1].trim();
        console.log('[DEBUG] Round 2: Calling setGeneratedCode, code length:', code.length);
        setGeneratedCode(code);
        console.log('[DEBUG] Round 2: Code set, returning');
        return code;
      } else if (textResponse.includes('<html')) {
        // Fallback: if HTML is present but not wrapped in code block
        const code = textResponse.trim();
        console.log('[DEBUG] Round 2: Calling setGeneratedCode (fallback), code length:', code.length);
        setGeneratedCode(code);
        return code;
      } else {
        throw new Error('Could not parse HTML from response.');
      }
    } catch (err) {
      console.error('[DEBUG] Round 2: Error occurred', err);
      throw err;
    } finally {
      console.log('[DEBUG] Round 2: Setting isRound2Generating = false');
      setIsRound2Generating(false);
    }
  };

  const analyze = async ({ apiKey, modelId, customModelId, imageFile, userContext }) => {
    console.log('[DEBUG] analyze(): Starting...');
    if (!apiKey) return setError('Please enter your API Key first.');
    if (!imageFile) return setError('Please upload an image to analyze.');

    console.log('[DEBUG] analyze(): Setting isAnalyzing = true');
    setIsAnalyzing(true);
    setError(null);

    let analysis = null;

    try {
      // Round 1: Generate analysis
      try {
        console.log('[DEBUG] analyze(): Calling analyzeRound1...');
        analysis = await analyzeRound1({ apiKey, modelId, customModelId, imageFile, userContext });
        console.log('[DEBUG] analyze(): Round 1 completed, analysis length:', analysis?.length);
        
        // Allow React to flush state updates and re-render before Round 2 starts
        // Using requestAnimationFrame ensures the UI update is visible before Round 2 begins
        console.log('[DEBUG] analyze(): Waiting for requestAnimationFrame...');
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            console.log('[DEBUG] analyze(): requestAnimationFrame callback executed');
            resolve();
          });
        });
        console.log('[DEBUG] analyze(): requestAnimationFrame completed, proceeding to Round 2');
      } catch (err) {
        console.error('[DEBUG] analyze(): Round 1 (Analysis) failed:', err);
        setError(`Analysis failed: ${err.message || 'An error occurred during C.L.E.A.R. framework analysis.'}`);
        return; // Stop if Round 1 fails - we need analysis for Round 2
      }
      
      // Round 2: Generate code from analysis
      try {
        console.log('[DEBUG] analyze(): Calling generateCodeRound2...');
        await generateCodeRound2({ apiKey, modelId, customModelId, analysisResult: analysis, userContext });
        console.log('[DEBUG] analyze(): Round 2 completed');
      } catch (err) {
        console.error('[DEBUG] analyze(): Round 2 (Code Generation) failed:', err);
        // Round 1 succeeded, so keep the analysis visible
        // Only show error for Round 2 failure
        setError(`Code generation failed: ${err.message || 'An error occurred while generating the redesign code.'} The analysis above is still available.`);
        // Note: analysis is already set in analyzeRound1, so it remains visible
      }
    } catch (err) {
      // Fallback for any unexpected errors
      console.error('[DEBUG] analyze(): Unexpected error:', err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      console.log('[DEBUG] analyze(): Setting isAnalyzing = false');
      setIsAnalyzing(false);
    }
  };

  const iterate = async ({ apiKey, modelId, customModelId, imageFile, generatedCode, userContext }) => {
    if (!apiKey || !generatedCode) return;

    setIsAnalyzing(true);
    setError(null);

    if (!imageFile) {
      setError('Original image required for iteration.');
      setIsAnalyzing(false);
      return;
    }

    let analysis = null;

    try {
      // Round 1: Re-analyze the original image
      try {
        analysis = await analyzeRound1({ 
          apiKey, 
          modelId, 
          customModelId, 
          imageFile, 
          userContext 
        });
      } catch (err) {
        console.error('Round 1 (Analysis) failed during iteration:', err);
        setError(`Analysis failed: ${err.message || 'An error occurred during C.L.E.A.R. framework analysis.'}`);
        return; // Stop if Round 1 fails
      }

      // Round 2: Generate new code from analysis
      try {
        await generateCodeRound2({ 
          apiKey, 
          modelId, 
          customModelId, 
          analysisResult: analysis, 
          userContext 
        });
      } catch (err) {
        console.error('Round 2 (Code Generation) failed during iteration:', err);
        // Round 1 succeeded, so keep the analysis visible
        setError(`Code generation failed: ${err.message || 'An error occurred while generating the redesign code.'} The analysis above is still available.`);
      }
    } catch (err) {
      // Fallback for any unexpected errors
      console.error('Unexpected error in iterate:', err);
      setError(err.message || 'An unexpected error occurred during iteration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retryCodeGeneration = async ({ apiKey, modelId, customModelId, userContext }) => {
    // Retry Round 2 code generation using existing analysis
    if (!apiKey) return setError('Please enter your API Key first.');
    if (!round1Analysis && !analysisResult) {
      return setError('No analysis available. Please run analysis first.');
    }

    const analysisToUse = round1Analysis || analysisResult;
    setIsAnalyzing(true);
    setError(null);

    try {
      await generateCodeRound2({ 
        apiKey, 
        modelId, 
        customModelId, 
        analysisResult: analysisToUse, 
        userContext 
      });
    } catch (err) {
      console.error('Code generation retry failed:', err);
      setError(`Code generation failed: ${err.message || 'An error occurred while generating the redesign code.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const refine = async ({ apiKey, modelId, customModelId, generatedCode, prompt }) => {
    if (!apiKey || !generatedCode || !prompt?.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const refinePrompt = `You are a frontend developer refining a UI.
                
                CURRENT HTML CODE:
                ${generatedCode}
                
                USER REQUEST:
                ${prompt}
                
                TASK:
                Update the HTML code to satisfy the user request.
                Return ONLY the raw HTML code wrapped in \`\`\`html ... \`\`\`. Do not include markdown or explanations outside the code block.`;

      const textResponse = await makeModelAPICall({
        modelId,
        apiKey,
        prompt: refinePrompt,
        customModelId,
      });

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
    isRound1Analyzing,
    isRound2Generating,
    isRefining,
    analysisResult,
    round1Analysis,
    generatedCode,
    error,
    setError,
    setAnalysisResult,
    setGeneratedCode,
    analyzeRound1,
    generateCodeRound2,
    retryCodeGeneration,
    analyze,
    iterate,
    refine,
  };
}


# Two-Round AI Prompt Implementation Plan

## Progress Checklist

- [x] **Task 1**: Create separate prompt constants for Round 1 (Analysis) and Round 2 (Code Generation)
- [x] **Task 2**: Update `useClearAi` hook to add new state for tracking round status
- [x] **Task 3**: Implement `analyzeRound1` function for C.L.E.A.R. analysis generation
- [x] **Task 4**: Implement `generateCodeRound2` function for code generation from analysis
- [x] **Task 5**: Update `analyze` function to orchestrate both rounds sequentially
- [x] **Task 6**: Update UI to show loading states for both rounds
- [x] **Task 7**: Update `iterate` function to work with new two-round flow
- [ ] **Task 8**: Test the complete flow end-to-end
- [x] **Task 9**: Update error handling for both rounds
- [x] **Task 10**: Document the new flow in component architecture

---

## Overview

This plan implements a two-round AI prompt system:
1. **Round 1**: Generate C.L.E.A.R. framework analysis + improvement suggestions (displayed in Framework Critique panel)
2. **Round 2**: Use the Round 1 analysis + suggestions to generate the redesigned HTML code block

This separation allows users to review the analysis before code generation and provides better control over the redesign process.

---

## Task 1: Create Separate Prompt Constants

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Split `SYSTEM_PROMPT` into two constants:
  - `ANALYSIS_PROMPT`: For Round 1 - focuses on C.L.E.A.R. framework analysis + improvement suggestions
  - `CODE_GENERATION_PROMPT`: For Round 2 - uses analysis result to generate HTML code

**Details**:
```javascript
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
    - E (Emphasis): Evaluate visual hierarchy and focal points.
    - A (Accessibility): Evaluate contrast, touch targets, and readability.
    - R (Reward): Evaluate friction and user feedback.
  
  2. For each letter of the framework, provide:
     - A detailed critique of the current design
     - Specific improvement suggestions with actionable recommendations
  
  OUTPUT FORMAT:
  - Provide the C.L.E.A.R. analysis in Markdown format.
  - Structure it clearly with headers for each framework letter (C, L, E, A, R).
  - Include improvement suggestions under each section.
  - Do NOT include any HTML code in this response.
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
```

**Checkpoint**: Verify prompts are well-structured and maintain the existing C.L.E.A.R. framework checkpoints.

---

## Task 2: Update Hook State Management

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Add new state variables to track round status:
  - `isRound1Analyzing`: Boolean for Round 1 loading state
  - `isRound2Generating`: Boolean for Round 2 loading state
  - `round1Analysis`: Store the Round 1 analysis result separately

**Details**:
```javascript
export default function useClearAi() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRound1Analyzing, setIsRound1Analyzing] = useState(false);
  const [isRound2Generating, setIsRound2Generating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [round1Analysis, setRound1Analysis] = useState(null); // New state
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState(null);
  // ... rest of the hook
}
```

**Checkpoint**: State variables are added and initialized correctly.

---

## Task 3: Implement `analyzeRound1` Function

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Create a new function `analyzeRound1` that:
  - Takes the same parameters as current `analyze` (apiKey, modelId, customModelId, imageFile, userContext)
  - Uses `ANALYSIS_PROMPT` instead of `SYSTEM_PROMPT`
  - Only generates analysis, no code extraction
  - Sets `round1Analysis` state
  - Returns the analysis text

**Details**:
```javascript
const analyzeRound1 = async ({ apiKey, modelId, customModelId, imageFile, userContext }) => {
  if (!apiKey) throw new Error('Please enter your Gemini API Key first.');
  if (!imageFile) throw new Error('Please upload an image to analyze.');

  const targetModel = modelId === 'custom' ? customModelId : modelId;
  setIsRound1Analyzing(true);
  setError(null);

  try {
    const imagePart = await fileToGenerativePart(imageFile);
    let fullPrompt = ANALYSIS_PROMPT;
    if (userContext?.trim()) {
      fullPrompt += `\n\nADDITIONAL CONTEXT FROM USER:\n"${userContext.trim()}"\n\nPlease incorporate this context into your analysis.`;
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
    if (!data.candidates?.[0]?.content) throw new Error('No analysis generated.');

    const analysisText = data.candidates[0].content.parts[0].text;
    setRound1Analysis(analysisText);
    setAnalysisResult(analysisText); // Display in Framework Critique panel
    return analysisText;
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    setIsRound1Analyzing(false);
  }
};
```

**Checkpoint**: Function successfully generates analysis without code extraction.

---

## Task 4: Implement `generateCodeRound2` Function

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Create a new function `generateCodeRound2` that:
  - Takes analysisResult (from Round 1), apiKey, modelId, customModelId, userContext
  - Uses `CODE_GENERATION_PROMPT` with the analysis result
  - Only extracts HTML code (no analysis extraction)
  - Sets `generatedCode` state
  - Returns the code

**Details**:
```javascript
const generateCodeRound2 = async ({ apiKey, modelId, customModelId, analysisResult, userContext }) => {
  if (!apiKey) throw new Error('Please enter your Gemini API Key first.');
  if (!analysisResult) throw new Error('Analysis result is required for code generation.');

  const targetModel = modelId === 'custom' ? customModelId : modelId;
  setIsRound2Generating(true);
  setError(null);

  try {
    const fullPrompt = CODE_GENERATION_PROMPT(analysisResult, userContext);

    const payload = {
      contents: [{ parts: [{ text: fullPrompt }] }],
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
    if (!data.candidates?.[0]?.content) throw new Error('No code generated.');

    const textResponse = data.candidates[0].content.parts[0].text;
    const htmlMatch = textResponse.match(/```html([\s\S]*?)```/);
    
    if (htmlMatch && htmlMatch[1]) {
      const code = htmlMatch[1].trim();
      setGeneratedCode(code);
      return code;
    } else if (textResponse.includes('<html')) {
      // Fallback: if HTML is present but not wrapped in code block
      const code = textResponse.trim();
      setGeneratedCode(code);
      return code;
    } else {
      throw new Error('Could not parse HTML from response.');
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    setIsRound2Generating(false);
  }
};
```

**Checkpoint**: Function successfully generates code from analysis result.

---

## Task 5: Update `analyze` Function to Orchestrate Both Rounds

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Refactor `analyze` to:
  - Call `analyzeRound1` first
  - Wait for Round 1 to complete
  - Display analysis in Framework Critique panel
  - Automatically call `generateCodeRound2` with the Round 1 result
  - Handle errors for both rounds separately
  - Update `isAnalyzing` to reflect overall process

**Details**:
```javascript
const analyze = async ({ apiKey, modelId, customModelId, imageFile, userContext }) => {
  if (!apiKey) return setError('Please enter your Gemini API Key first.');
  if (!imageFile) return setError('Please upload an image to analyze.');

  setIsAnalyzing(true);
  setError(null);

  try {
    // Round 1: Generate analysis
    const analysis = await analyzeRound1({ apiKey, modelId, customModelId, imageFile, userContext });
    
    // Round 2: Generate code from analysis
    await generateCodeRound2({ apiKey, modelId, customModelId, analysisResult: analysis, userContext });
  } catch (err) {
    console.error(err);
    setError(err.message || 'An error occurred during analysis.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

**Checkpoint**: Both rounds execute sequentially, analysis displays before code generation.

---

## Task 6: Update UI Loading States

**Location**: `src/components/AnalysisPanel.jsx`, `src/components/PreviewPanel.jsx`, `src/App.jsx`

**Changes**:
- Update `AnalysisPanel` to show loading state during Round 1
- Update `PreviewPanel` to show loading state during Round 2
- Pass new loading states from hook to components

**Details**:
- In `App.jsx`, expose `isRound1Analyzing` and `isRound2Generating` from hook
- Update `AnalysisPanel` to use `isRound1Analyzing` for loading indicator
- Update `PreviewPanel` to use `isRound2Generating` for loading indicator
- Consider showing a message like "Analyzing C.L.E.A.R. framework..." for Round 1
- Show "Generating redesign code..." for Round 2

**Checkpoint**: UI correctly reflects the two-stage loading process.

---

## Task 7: Update `iterate` Function

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Update `iterate` to work with the new two-round flow:
  - It should use the existing `generatedCode` and `round1Analysis` (or `analysisResult`)
  - Generate a new Round 1 analysis on the current code
  - Then generate new code from that analysis

**Details**:
```javascript
const iterate = async ({ apiKey, modelId, customModelId, imageFile, generatedCode, userContext }) => {
  if (!apiKey || !generatedCode) return;

  setIsAnalyzing(true);
  setError(null);

  try {
    // For iteration, we analyze the current code
    // Option 1: Re-analyze the original image with stricter criteria
    // Option 2: Analyze the generated code itself (would need different prompt)
    // For now, keeping similar to original but using two-round approach
    
    if (imageFile) {
      // Re-run full two-round process with stricter temperature
      const analysis = await analyzeRound1({ 
        apiKey, 
        modelId, 
        customModelId, 
        imageFile, 
        userContext 
      });
      await generateCodeRound2({ 
        apiKey, 
        modelId, 
        customModelId, 
        analysisResult: analysis, 
        userContext 
      });
    } else {
      // If no image, we can't re-analyze - maybe skip iteration or show error
      setError('Original image required for iteration.');
    }
  } catch (err) {
    console.error(err);
    setError(err.message || 'An error occurred during iteration.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

**Checkpoint**: Iteration works with the new two-round flow.

---

## Task 8: End-to-End Testing

**Location**: Manual testing

**Test Cases**:
1. **Happy Path**: Upload image → Run analysis → See Round 1 analysis → See Round 2 code
2. **With User Context**: Add context → Run → Verify context appears in both rounds
3. **Error Handling**: Test with invalid API key, network errors, malformed responses
4. **Iteration**: Run iteration → Verify it uses two-round process
5. **Refinement**: Test refine function still works with generated code
6. **UI States**: Verify loading indicators show correctly for each round

**Checkpoint**: All test cases pass successfully.

---

## Task 9: Update Error Handling

**Location**: `src/hooks/useClearAi.js`

**Changes**:
- Ensure errors from Round 1 don't prevent Round 2 from attempting (if Round 1 partially succeeds)
- Provide clear error messages distinguishing Round 1 vs Round 2 failures
- Handle cases where Round 1 succeeds but Round 2 fails (analysis should still be visible)

**Details**:
- Add try-catch around each round separately
- If Round 1 fails, show error and stop
- If Round 2 fails, show error but keep Round 1 analysis visible
- Consider adding a "Retry Code Generation" button if Round 2 fails

**Checkpoint**: Error handling is robust and user-friendly.

---

## Task 10: Update Documentation

**Location**: `context/component-architecture.md`, `context/logic.md`

**Changes**:
- Document the new two-round flow
- Update the AI prompt flow diagram
- Note the separation of concerns (analysis vs code generation)

**Details**:
- Add section explaining Round 1 and Round 2
- Update hook documentation
- Note any breaking changes or migration notes

**Checkpoint**: Documentation is up-to-date and clear.

---

## Implementation Notes

### Key Design Decisions

1. **Sequential Execution**: Round 2 automatically follows Round 1 to maintain current UX flow
2. **State Separation**: `round1Analysis` stored separately to allow potential future "regenerate code" feature
3. **Backward Compatibility**: `analyze` function signature remains the same for App.jsx compatibility
4. **Error Recovery**: Round 1 analysis remains visible even if Round 2 fails

### Future Enhancements (Out of Scope)

- Add "Regenerate Code" button to re-run Round 2 with same analysis
- Add option to skip Round 2 and only generate analysis
- Add ability to edit analysis before code generation
- Cache Round 1 analysis to avoid re-running on code regeneration

---

## Progress Tracking Instructions

1. **Check off tasks** in the checklist above as you complete them
2. **Test each task** before moving to the next
3. **Commit after each major task** (Tasks 1-2, 3-4, 5-6, 7-8, 9-10)
4. **Update this document** if you discover additional subtasks or need to adjust the plan
5. **Note any blockers** or issues encountered in the implementation

---

## Dependencies

- Existing `useClearAi` hook structure
- Gemini API access and model configuration
- File reading utilities (`fileToGenerativePart`)
- HTML extraction utilities (`extractHtmlAndAnalysis`)

---

## Estimated Timeline

- **Tasks 1-2**: 30 minutes (Prompt constants + state)
- **Tasks 3-4**: 1 hour (Round 1 + Round 2 functions)
- **Task 5**: 30 minutes (Orchestration)
- **Task 6**: 30 minutes (UI updates)
- **Task 7**: 30 minutes (Iteration update)
- **Task 8**: 1 hour (Testing)
- **Task 9**: 30 minutes (Error handling)
- **Task 10**: 15 minutes (Documentation)

**Total**: ~4.5 hours

---

*Last Updated: 2025-01-XX*
*Status: Planning Phase*


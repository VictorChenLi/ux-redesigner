# Component Architecture (Dec 2025)

Goal: keep the C.L.E.A.R. UI app modular so UI/logic can grow.

## Modules
- `src/hooks/useClearAi.js`: centralizes Gemini calls using a two-round AI prompt system (analyze, iterate, refine), manages loading/error states for both rounds, and handles parsing of HTML/analysis output. Implements separation of concerns: Round 1 generates C.L.E.A.R. framework analysis, Round 2 generates HTML code from the analysis.
- `src/components/HeaderBar.jsx`: top header + model selection panel + API key input.
- `src/components/UploadCard.jsx`: file upload, context input, and analysis trigger with error display.
- `src/components/AnalysisPanel.jsx`: renders analysis prose from Round 1, shows loading state during Round 1 analysis.
- `src/components/PreviewPanel.jsx`: preview/code tabs, loading overlay during Round 2 code generation, and full-screen trigger.
- `src/components/RefinementBar.jsx`: iteration + refinement prompt controls.
- `src/components/FullscreenModal.jsx`: full-screen iframe for generated HTML.
- `src/components/MarkdownRenderer.jsx`: lightweight Markdown-to-React renderer for analysis text.

## AI Prompt Flow: Two-Round System

The application uses a two-round AI prompt system to separate analysis from code generation:

### Round 1: C.L.E.A.R. Framework Analysis
- **Function**: `analyzeRound1()`
- **Prompt**: `ANALYSIS_PROMPT` - focuses solely on C.L.E.A.R. framework analysis
- **Input**: Image file + optional user context
- **Output**: Markdown-formatted C.L.E.A.R. analysis with improvement suggestions
- **State**: `isRound1Analyzing`, `round1Analysis`, `analysisResult`
- **Display**: Shown in `AnalysisPanel` (Framework Critique)

### Round 2: Code Generation
- **Function**: `generateCodeRound2()`
- **Prompt**: `CODE_GENERATION_PROMPT` - uses Round 1 analysis to generate HTML
- **Input**: Round 1 analysis result + optional user context
- **Output**: Self-contained HTML file with embedded CSS/JS
- **State**: `isRound2Generating`, `generatedCode`
- **Display**: Shown in `PreviewPanel` (Generated Redesign)

### Flow Diagram

```
User Uploads Image
       ↓
[Round 1: Analysis]
  analyzeRound1()
  - Uses ANALYSIS_PROMPT
  - Analyzes image with C.L.E.A.R. framework
  - Generates markdown analysis
       ↓
Analysis displayed in Framework Critique panel
       ↓
[Round 2: Code Generation]
  generateCodeRound2()
  - Uses CODE_GENERATION_PROMPT
  - Takes Round 1 analysis as input
  - Generates HTML code
       ↓
Code displayed in Generated Redesign panel
```

### Orchestration Functions

- **`analyze()`**: Main entry point that orchestrates both rounds sequentially
  - Calls `analyzeRound1()` first
  - Then calls `generateCodeRound2()` with Round 1 result
  - Handles errors separately for each round
  - Preserves Round 1 analysis if Round 2 fails

- **`iterate()`**: Re-runs the two-round process for design iteration
  - Requires original image file
  - Uses same two-round flow as `analyze()`

- **`retryCodeGeneration()`**: Retries Round 2 without re-running Round 1
  - Useful when Round 2 fails but analysis is available
  - Uses existing `round1Analysis` or `analysisResult`

## Patterns
- App component owns top-level state (api key, model IDs, file, context, layout toggles) and delegates AI workflows to `useClearAi`.
- `useClearAi` keeps async effects and cleanup in one place so components stay presentational.
- UI components are small, prop-driven, and reusable to allow future feature splits (e.g., additional panels or model options) without growing `App.jsx`.
- **Two-round separation**: Analysis and code generation are separated into distinct rounds, allowing users to review analysis before code generation and providing better error recovery.

## Hook API: useClearAi

### State Variables
- `isAnalyzing`: Overall analysis process (both rounds)
- `isRound1Analyzing`: Round 1 (analysis) loading state
- `isRound2Generating`: Round 2 (code generation) loading state
- `isRefining`: Refinement process loading state
- `analysisResult`: C.L.E.A.R. framework analysis (from Round 1)
- `round1Analysis`: Stored Round 1 analysis (for retry functionality)
- `generatedCode`: Generated HTML code (from Round 2)
- `error`: Error message (distinguishes Round 1 vs Round 2 failures)

### Functions
- `analyze({ apiKey, modelId, customModelId, imageFile, userContext })`: Orchestrates both rounds
- `analyzeRound1({ apiKey, modelId, customModelId, imageFile, userContext })`: Round 1 only
- `generateCodeRound2({ apiKey, modelId, customModelId, analysisResult, userContext })`: Round 2 only
- `retryCodeGeneration({ apiKey, modelId, customModelId, userContext })`: Retry Round 2
- `iterate({ apiKey, modelId, customModelId, imageFile, generatedCode, userContext })`: Re-run two-round process
- `refine({ apiKey, modelId, customModelId, generatedCode, prompt })`: Refine existing code

### Error Handling
- Round 1 failures: Stops process, shows "Analysis failed: [error]"
- Round 2 failures: Shows "Code generation failed: [error]. The analysis above is still available."
- Analysis remains visible when Round 2 fails
- `retryCodeGeneration()` allows retrying Round 2 without re-running Round 1

## Breaking Changes / Migration Notes

### January 2025: Two-Round AI Implementation
- **Changed**: `analyze()` now uses two-round flow instead of single prompt
- **Changed**: Loading states split into `isRound1Analyzing` and `isRound2Generating`
- **Added**: New state variables `round1Analysis`, `isRound1Analyzing`, `isRound2Generating`
- **Added**: New functions `analyzeRound1()`, `generateCodeRound2()`, `retryCodeGeneration()`
- **Removed**: `SYSTEM_PROMPT` constant (replaced by `ANALYSIS_PROMPT` and `CODE_GENERATION_PROMPT`)
- **Backward Compatible**: Existing `analyze()` function signature unchanged, but internal implementation changed
- **UI Updates**: `AnalysisPanel` uses `isRound1Analyzing`, `PreviewPanel` uses `isRound2Generating`


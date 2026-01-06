Logic references for this project. Add new logic notes below with links to detailed docs in this folder.
- 2025-12-19: UI modularization + Gemini workflow hook (`context/component-architecture.md`)
- 2025-12-19: Removed TTS/Listen button per UX request.
- 2026-01-05: Two-round AI prompt implementation plan - split analysis and code generation into separate rounds (`context/two-round-ai-implementation-plan.md`)
- 2026-01-05: Completed Tasks 1-2: Separated prompts (ANALYSIS_PROMPT, CODE_GENERATION_PROMPT) and added round tracking state (isRound1Analyzing, isRound2Generating, round1Analysis) to useClearAi hook
- 2026-01-05: Completed Tasks 3-4: Implemented analyzeRound1 function (generates C.L.E.A.R. analysis from image) and generateCodeRound2 function (generates HTML code from analysis result) in useClearAi hook
- 2026-01-05: Completed Tasks 5-6: Updated analyze function to orchestrate both rounds sequentially (calls analyzeRound1 then generateCodeRound2), and updated UI components (App.jsx, AnalysisPanel, PreviewPanel) to show separate loading states for Round 1 (analysis) and Round 2 (code generation)
- 2026-01-05: Completed Task 7: Updated iterate function to work with new two-round flow - now re-runs analyzeRound1 and generateCodeRound2 sequentially when iterating on a design, requires original image file
- 2026-01-05: Completed Task 9: Enhanced error handling for two-round flow - separate try-catch blocks for Round 1 and Round 2, clear error messages distinguishing analysis vs code generation failures, preserves Round 1 analysis when Round 2 fails, added retryCodeGeneration function for retrying code generation without re-running analysis
- 2026-01-05: Completed Task 10: Updated component architecture documentation - documented two-round AI flow (Round 1: analysis, Round 2: code generation), added flow diagram, updated hook API documentation, noted breaking changes and migration notes from single-prompt to two-round system (`context/component-architecture.md`)


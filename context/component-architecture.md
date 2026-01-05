# Component Architecture (Dec 2025)

Goal: keep the C.L.E.A.R. UI app modular so UI/logic can grow.

## Modules
- `src/hooks/useClearAi.js`: centralizes Gemini calls (analyze, iterate, refine, TTS), manages loading/error states, and normalizes parsing of HTML/analysis output.
- `src/components/HeaderBar.jsx`: top header + model selection panel + API key input.
- `src/components/UploadCard.jsx`: file upload, context input, and analysis trigger with error display.
- `src/components/AnalysisPanel.jsx`: renders analysis prose (TTS removed).
- `src/components/PreviewPanel.jsx`: preview/code tabs, loading overlay, and full-screen trigger.
- `src/components/RefinementBar.jsx`: iteration + refinement prompt controls.
- `src/components/FullscreenModal.jsx`: full-screen iframe for generated HTML.
- `src/components/MarkdownRenderer.jsx`: lightweight Markdown-to-React renderer for analysis text.

## Patterns
- App component owns top-level state (api key, model IDs, file, context, layout toggles) and delegates AI workflows to `useClearAi`.
- `useClearAi` keeps async effects and TTS cleanup in one place so components stay presentational.
- UI components are small, prop-driven, and reusable to allow future feature splits (e.g., additional panels or model options) without growing `App.jsx`.


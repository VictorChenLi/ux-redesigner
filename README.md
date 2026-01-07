# CLEAR UI Redesigner

Generate C.L.E.A.R. (Copy, Layout, Emphasis, Accessibility, Reward) critiques and redesigned HTML for any uploaded UI screenshot using AI models. Built with React + Vite + TailwindCSS.

## Features
- **Multi-Provider AI Support**: Choose from Google Gemini (free with limits) or OpenAI GPT-5 models (paid)
- **Two-Round AI System**: Separates analysis (Round 1) from code generation (Round 2) for better control and error recovery
- **Per-Module Scoring**: Each C.L.E.A.R. module receives a score (0-20) with automatic status calculation (Pass/Needs Improvement/Critical Issue)
- **Overall Score**: Calculated as sum of all 5 modules (0-100), displayed prominently
- **Upload & Analyze**: Upload a UI screenshot and optionally add user context
- **Model Selection**: Choose from Gemini models or OpenAI GPT-5.1/GPT-5.2, with per-model API key storage
- **C.L.E.A.R. Analysis**: Comprehensive framework critique with collapsible module cards
- **Generated Redesign**: Preview vs. code tabs, plus full-screen preview mode
- **Export Options**: 
  - Copy markdown to clipboard
  - Launch styled preview page in new tab
  - Download analysis as PDF from preview page
- **Iteration**: Re-run C.L.E.A.R. analysis on generated code for improvements
- **Refinement**: Adjust the generated UI with targeted prompts (e.g., "dark mode", "bigger buttons")

## Tech Stack
- React 18 + Vite
- TailwindCSS (with `@tailwindcss/typography`)
- Lucide React icons
- html2pdf.js (for PDF generation)

## Getting Started
1. Install dependencies  
   ```bash
   npm install
   ```
2. Start the dev server  
   ```bash
   npm run dev
   ```
3. Build for production  
   ```bash
   npm run build
   ```
4. Preview the production build  
   ```bash
   npm run preview
   ```

## Usage
- **Setup**: Click the settings icon in the header to configure your AI model and API key
  - Choose from Gemini (free) or OpenAI GPT-5 models (paid)
  - API keys are saved per model and persist across sessions
- **Analysis**: 
  - Upload a UI screenshot
  - Optionally provide context (audience, tone, brand notes, etc.)
  - Click "Run C.L.E.A.R. Analysis" to start the two-round process
  - Round 1 displays analysis immediately in Framework Critique panel
  - Round 2 generates HTML code shown in Generated Redesign panel
- **Review Analysis**:
  - View overall score (0-100) and per-module scores (0-20)
  - Expand/collapse module cards to review detailed critiques
  - Copy markdown or launch preview page for export
- **Preview & Export**:
  - Use Preview/Code tabs to inspect the redesign
  - In preview page: copy markdown or download as PDF
  - Open full screen for a larger view
- **Iteration & Refinement**:
  - Click the refresh icon to re-run C.L.E.A.R. analysis on generated code
  - Use the refine prompt for targeted tweaks (dark mode, bigger buttons, etc.)

## Project Structure
- `src/App.jsx` — top-level state & layout wiring; delegates to modular components.
- `src/hooks/useClearAi.js` — two-round AI system (Round 1: analysis, Round 2: code generation), shared loading/error state.
- `src/utils/modelHandlers.js` — centralized model-specific API logic (Gemini & OpenAI), payload creation, response parsing.
- Components
  - `src/components/HeaderBar.jsx` — header with model info pill and settings trigger.
  - `src/components/ModelKeySettings.jsx` — consolidated model selection and API key input overlay.
  - `src/components/UploadCard.jsx` — upload UI + context input + analyze trigger.
  - `src/components/AnalysisPanel.jsx` — C.L.E.A.R. framework critique display with copy/launch buttons, overall score, collapsible module cards.
  - `src/components/MarkdownRenderer.jsx` — markdown-to-React renderer with module parsing, score extraction, status calculation.
  - `src/components/PreviewPanel.jsx` — preview/code tabs, loading overlay (shows during both rounds), download/launch buttons.
  - `src/components/RefinementBar.jsx` — refine prompt (auto-growing textarea) + iteration control.
  - `src/components/FullscreenModal.jsx` — full-screen preview iframe.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind directives + custom scrollbar styling + accordion animations.
- `tailwind.config.js`, `postcss.config.js`, `vite.config.js` — build and styling config.
- `context/` — documentation folder with architecture, scoring system, and feature documentation.

## Notes
- Ensure `@tailwindcss/typography` is installed (`npm install -D @tailwindcss/typography`) since it is enabled in `tailwind.config.js`.
- Generated HTML runs in an iframe with `allow-scripts`; be mindful of any third-party code returned by the model.
- API keys are stored in browser localStorage and never sent to any server except the AI provider APIs.
- Model selection and API keys are saved per-model for easy switching between providers.
- The two-round system ensures analysis is displayed immediately, even if code generation fails.
- PDF generation uses html2pdf.js loaded from CDN in the preview page.


## TODO
- styling the analysis responds, to make each moduel as it's own region to improve the readability of the text
- The framework critique section will be used to display every round of conversation. For example, the first one we're going to display whatever the result is as a saying, but if a user refines it by sending additional refinement messages, or we run the Clear analysis again. I want the framework critique panel to be able to show all the history conversation as expandable card style.
- Want to show the original image and the redesigned UI within the Generated Redesign section with a tab on the top to toggle, So beside the generated redesign, there should be a toggle to show the original image. When the first round of analysis is undergoing display the original image

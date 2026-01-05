# CLEAR UI Redesigner

Generate C.L.E.A.R. (Copy, Layout, Emphasis, Accessibility, Reward) critiques and redesigned HTML for any uploaded UI screenshot using Gemini models. Built with React + Vite + TailwindCSS.

## Features
- Upload a UI screenshot and optionally add user context.
- Choose Gemini model (default Gemini 3 Flash Preview) or specify a custom model ID.
- Runs C.L.E.A.R. analysis and extracts the generated HTML redesign.
- Preview vs. code tabs, plus full-screen preview mode.
- Iteration pass to re-run C.L.E.A.R. on the generated code for improvements.
- Refinement prompt to adjust the generated UI (e.g., “dark mode”, “bigger buttons”).
- Text-to-speech playback of the critique.

## Tech Stack
- React 18 + Vite
- TailwindCSS (with `@tailwindcss/typography`)
- Lucide React icons

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
- Launch the app and paste your Gemini API key into the header field (keys stay client-side).
- Upload a UI screenshot. Optionally provide context (audience, tone, brand notes, etc.).
- Click “Run C.L.E.A.R. Analysis” to get the critique and generated HTML.
- Use the Preview/Code tabs to inspect the redesign; open full screen for a larger view.
- Click the refresh icon to run a deeper iteration on the generated code.
- Use the refine prompt to request targeted tweaks (dark mode, bigger buttons, typography changes, etc.).
- “Listen” reads the critique aloud; click again to stop playback.

## Project Structure
- `src/App.jsx` — top-level state & layout wiring; delegates to modular components.
- `src/hooks/useClearAi.js` — all Gemini calls (analyze/iterate/refine/TTS), shared loading/error state.
- Components
  - `src/components/HeaderBar.jsx` — header, API key, and model selector.
  - `src/components/UploadCard.jsx` — upload UI + context input + analyze trigger.
  - `src/components/AnalysisPanel.jsx` — critique display with TTS toggle.
  - `src/components/MarkdownRenderer.jsx` — lightweight markdown-to-React renderer.
  - `src/components/PreviewPanel.jsx` — preview/code tabs and loading overlay.
  - `src/components/RefinementBar.jsx` — refine prompt + iteration control.
  - `src/components/FullscreenModal.jsx` — full-screen preview iframe.
- `src/main.jsx` — React entry point.
- `src/index.css` — Tailwind directives + custom scrollbar styling.
- `tailwind.config.js`, `postcss.config.js`, `vite.config.js` — build and styling config.

## Notes
- Ensure `@tailwindcss/typography` is installed (`npm install -D @tailwindcss/typography`) since it is enabled in `tailwind.config.js`.
- Generated HTML runs in an iframe with `allow-scripts`; be mindful of any third-party code returned by the model.


## TODO
- To make the refinement text inbox grow as the user input up to three lines.
- The framework critique section will be making us a section for every round of conversation. For example, the first one we're going to display whatever the result is as a saying, but if a user refines it by sending additional refinement messages, all we run the Clear analysis. I want the framework critique panel to be able to show all the history conversation.
- Want to show the original image and the redesigned UI side-by-side with a tab on the top to toggle, So beside the generated redesign, there should be a toggle to show the original image.

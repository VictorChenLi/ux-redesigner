# Analysis Export and Preview Features

## Overview

The Framework Critique section includes export and preview functionality that allows users to copy, view, and download the C.L.E.A.R. analysis in various formats.

## Features

### 1. Copy Markdown
- **Location**: Framework Critique header (main app)
- **Functionality**: Copies the full markdown analysis text to clipboard
- **Feedback**: Shows "Copied to clipboard!" message for 2 seconds
- **Fallback**: Uses `document.execCommand('copy')` for older browsers

### 2. Launch Preview Page
- **Location**: Framework Critique header (main app)
- **Functionality**: Generates a styled HTML page from the markdown analysis and opens it in a new tab
- **Icon**: ExternalLink icon (matches Generated Redesign section)
- **Behavior**: 
  - Parses markdown to extract modules, scores, and content
  - Generates fully styled HTML with proper formatting
  - All modules are expanded by default
  - Opens in new browser tab

### 3. Preview Page Features
The generated preview page includes:

#### Header Section
- **Title**: "C.L.E.A.R. Framework Analysis"
- **Overall Score**: Displays "Overall Score: XX/100" when available
- **Action Buttons**:
  - **Copy Markdown**: Copies the full markdown to clipboard
  - **Download PDF**: Generates and downloads a PDF of the analysis

#### Content Section
- **Module Cards**: Each C.L.E.A.R. module displayed as a styled card
- **Module Header**: Badge (C, L, E, A, R), title, status indicator, and score
- **Module Content**: Bullet points with bold labels, redesign suggestions
- **Styling**: Matches the main app's visual design

### 4. PDF Generation
- **Library**: html2pdf.js (loaded from CDN)
- **Format**: A4 portrait
- **Quality**: High resolution (scale: 2, quality: 0.98)
- **Fallback**: If PDF generation fails, suggests using browser's print function
- **Filename**: `clear-ui-critique-YYYY-MM-DD.pdf`

## Implementation

### File Locations
- **Main Component**: `src/components/AnalysisPanel.jsx`
  - `handleCopy()`: Clipboard copy functionality
  - `handleLaunchPreview()`: HTML generation and new tab opening
- **HTML Generation**: Inline in `handleLaunchPreview()` function
- **PDF Script**: Embedded in generated HTML page

### HTML Generation Process
1. Parse markdown to extract modules, scores, and content
2. Build styled HTML string with:
   - CSS styles matching the app design
   - Module cards with proper formatting
   - Status indicators and scores
   - Redesign suggestion boxes
3. Include JavaScript for:
   - Copy markdown functionality
   - PDF generation using html2pdf.js
   - Success notifications
4. Create blob URL and open in new tab

### Styling Details
- **Container**: Max-width 1200px, centered, white background
- **Modules**: Rounded cards with borders, proper spacing
- **Badges**: Color-coded by module (C: amber, L: red, E: amber, A: green, R: green)
- **Status Dots**: Color-coded (Pass: green, Needs Improvement: amber, Critical: red)
- **Redesign Suggestions**: Purple gradient box with lightbulb icon
- **Buttons**: Blue primary buttons with hover states

## User Flow

1. User runs C.L.E.A.R. analysis
2. Analysis appears in Framework Critique panel
3. User can:
   - Click **Copy** button → Markdown copied to clipboard
   - Click **Launch** button → Preview page opens in new tab
4. In preview page:
   - User can copy markdown again
   - User can download as PDF
   - User can view full analysis with all modules expanded

## Benefits

1. **Portability**: Users can export analysis for sharing or documentation
2. **Print-Friendly**: PDF format suitable for reports and presentations
3. **Accessibility**: Preview page provides clean, readable format
4. **Consistency**: Styling matches main app for familiar experience
5. **Flexibility**: Multiple export options (copy, preview, PDF)


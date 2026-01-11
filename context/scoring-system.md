# Per-Module Scoring System

## Overview

The C.L.E.A.R. UI analysis framework uses a per-module scoring system where each module (C, L, E, A, R) receives a score from 0-20, and the overall score is calculated as the sum of all five modules (0-100).

## Scoring Logic

### Module Scores (0-20)

Each module is scored independently based on the quality and issues found:

- **0-9**: Critical issues, major problems
- **10-17**: Needs improvement, moderate issues  
- **18-20**: Pass, meets standards with minor or no issues

### Status Calculation

Status is automatically calculated from the module score (not provided by AI):

- **18-20**: "Pass" (green indicator - `bg-emerald-500`)
- **10-17**: "Needs Improvement" (amber indicator - `bg-amber-500`)
- **0-9**: "Critical Issue" (red indicator - `bg-red-500`)

### Overall Score Calculation

The overall UI health score is calculated as:
```
Overall Score = Sum of all 5 module scores (0-100)
```

This is displayed as a percentage in the scorecard at the top of the Framework Critique panel.

## Implementation

### AI Prompt (`src/hooks/useClearAi.js`)

The `ANALYSIS_PROMPT` requests:
- Module scores (0-20) for each C.L.E.A.R. module
- Score format: `Score: XX/20` (first line after module header)
- **No status assessment** - status is calculated from score
- **No overall score** - calculated automatically

### Parsing (`src/components/MarkdownRenderer.jsx`)

1. **Score Extraction**: `parseModuleScore()` function extracts scores from lines matching `Score: XX/20` or `Score: XX`
2. **Status Calculation**: `calculateStatusFromScore()` function maps scores to status labels and colors
3. **Overall Score**: Sum of all 5 module scores, calculated when all scores are available

### Display (`src/components/AnalysisPanel.jsx`)

- Overall score displayed in circular progress indicator (0-100%)
- Module scores displayed next to status in each module header (e.g., "15/20")
- Status indicators use color-coded dots based on calculated status

## File Locations

- **Prompt Definition**: `src/hooks/useClearAi.js` - `ANALYSIS_PROMPT` constant
- **Score Parsing**: `src/components/MarkdownRenderer.jsx` - `parseModuleScore()`, `calculateStatusFromScore()`
- **Score Display**: `src/components/AnalysisPanel.jsx` - Scorecard rendering
- **Module Display**: `src/components/MarkdownRenderer.jsx` - Module header with score and status

## Migration Notes

### Previous System
- AI provided overall score (0-100%) directly
- AI provided status labels ("Critical Issue", "Needs Improvement", "Pass")
- Status was parsed from text response

### Current System
- AI provides per-module scores (0-20) only
- Status is calculated from scores automatically
- Overall score is sum of module scores
- More granular and consistent scoring

## Benefits

1. **Consistency**: Status is always calculated the same way, eliminating AI interpretation variance
2. **Granularity**: Per-module scores provide detailed insight into each aspect of the UI
3. **Transparency**: Clear scoring thresholds make it easy to understand why a status was assigned
4. **Flexibility**: Easy to adjust thresholds or add new status levels by modifying `calculateStatusFromScore()`


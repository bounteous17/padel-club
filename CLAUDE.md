# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

This is a React 18 + Vite frontend MVP for managing padel club players. Currently frontend-only with no backend integration.

**Source structure:**
- `src/main.jsx` - App entry point, renders root React component
- `src/App.jsx` - Single component containing the entire dashboard UI with player filter controls
- `src/App.css` - Dashboard component styles
- `src/index.css` - Global styles and CSS variables

**Key state:** The App component manages a `filters` state object with: `firstName`, `secondName`, `ratingMin/Max` (0-10), `ageMin/Max`, and `preferenceHours` (array of time slots).

**Current status:** Filter UI is functional but displays a placeholder instead of results - requires backend API integration to show player data.

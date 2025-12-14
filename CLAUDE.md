# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Database
docker-compose up -d              # Start PostgreSQL

# Backend (from /backend)
npm install
npx prisma migrate dev            # Run database migrations
npm run seed                      # Seed sample player data
npm run dev                       # Start backend server (http://localhost:3000)

# Frontend (from /frontend)
npm install
npm run dev                       # Start frontend dev server (http://localhost:5173)
npm run build                     # Build for production
```

## Architecture

Full-stack application for managing padel club players with filtering capabilities.

**Repository structure:**
- `frontend/` - React 18 + Vite frontend
- `backend/` - Node.js + Express + TypeScript API
- `docker-compose.yml` - PostgreSQL database container

**Backend (`/backend`):**
- `src/index.ts` - Express server entry point (port 3000)
- `src/routes/players.ts` - GET /api/players endpoint with query filters
- `prisma/schema.prisma` - Player model definition
- `prisma/seed.ts` - Sample data seeding script

**Frontend (`/frontend`):**
- `src/App.jsx` - Main dashboard with filters and player table
- `src/App.css` - Component styles (cyberpunk theme)
- `src/index.css` - Global styles and CSS variables

**Player model:**
- `id`, `firstName`, `secondName`, `rating` (0-10), `age`, `preferenceHours` (string array), `createdAt`

**API endpoint:** `GET /api/players?firstName=&secondName=&ratingMin=&ratingMax=&ageMin=&ageMax=&preferenceHours=`
- All query parameters are optional
- Name filters use case-insensitive partial matching
- `preferenceHours` accepts comma-separated time slots

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
- `terraform/` - AWS infrastructure (S3, EC2, RDS)
- `docker-compose.yml` - PostgreSQL for local development

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

## AWS Infrastructure (Terraform)

```bash
# Prerequisites: Create S3 bucket for Terraform state
aws s3 mb s3://padel-club-terraform-state --region eu-central-1

# Deploy infrastructure (from /terraform)
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply

# Deploy frontend to S3
cd ../frontend && npm run build
aws s3 sync dist/ s3://$(terraform -chdir=../terraform output -raw frontend_bucket_name) --delete
```

**AWS Resources (Free Tier):**
- S3 bucket - Frontend static website hosting
- EC2 t2.micro - Backend API server (Amazon Linux 2023)
- RDS db.t3.micro - PostgreSQL 16 database
- VPC with public/private subnets

**Required variables (terraform.tfvars):**
- `key_name` - Existing EC2 key pair name
- `db_password` - PostgreSQL password
- `allowed_ssh_cidr` - Your IP for SSH access

## Authentication

The application uses Google OAuth for authentication with an email whitelist.

**Allowed users:**
- `joseguerola9@gmail.com`
- `alexserra258@gmail.com`

**Auth flow:**
1. User clicks "Sign in with Google" on login page
2. Frontend receives Google credential token
3. Backend verifies token with Google and checks email whitelist
4. If whitelisted, backend issues JWT; otherwise returns 403 Forbidden
5. Frontend stores JWT and includes it in all API requests

**Backend environment variables (`backend/.env`):**
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ALLOWED_EMAILS=joseguerola9@gmail.com,alexserra258@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Frontend environment variables (`frontend/.env`):**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=http://localhost:3000
```

**Auth endpoints:**
- `POST /api/auth/google` - Verify Google token, return JWT if whitelisted
- `GET /api/auth/me` - Validate current JWT, return user info

**Protected routes:**
- All `/api/players` endpoints require valid JWT from whitelisted user
- Frontend dashboard (`/`) requires authentication
- Non-authenticated users are redirected to `/login`
- Non-whitelisted users are shown `/forbidden` page

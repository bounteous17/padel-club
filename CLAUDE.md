# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Database
docker-compose up -d # Start PostgreSQL (local development)

# Backend (from /backend)
npm install
npx prisma migrate dev # Run database migrations
npm run seed # Seed sample player data
npm run dev # Start backend server locally (http://localhost:3000)
npm run build:lambda # Build for Lambda deployment
npm run package:lambda # Create Lambda deployment package (lambda.zip)

# Frontend (from /frontend)
npm install
npm run dev # Start frontend dev server (http://localhost:5173)
npm run build # Build for production
```

## Architecture

Full-stack serverless application for managing padel club players with filtering capabilities.

**Repository structure:**
- `frontend/` - React 18 + Vite frontend (deployed to S3 + CloudFront)
- `backend/` - Node.js + Express + TypeScript API (deployed to AWS Lambda)
- `terraform/` - AWS infrastructure (Lambda, API Gateway, RDS, S3)
- `docker-compose.yml` - PostgreSQL for local development

**Backend (`/backend`):**
- `src/app.ts` - Express app configuration (extracted for Lambda)
- `src/index.ts` - Local development server entry point (port 3000)
- `src/lambda/handler.ts` - Lambda handler using serverless-http
- `src/lib/prisma.ts` - Singleton Prisma client for Lambda connection pooling
- `src/routes/players.ts` - GET/POST/PUT/DELETE /api/players endpoints
- `src/routes/auth.ts` - POST /api/auth/google, GET /api/auth/me
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

**Serverless Architecture:**
- Lambda function for backend API (Node.js 20, no VPC)
- API Gateway HTTP API with custom domain
- RDS PostgreSQL (db.t3.micro, publicly accessible)
- S3 + CloudFront for frontend static hosting
- Route53 for DNS management

**Cost:** ~$15-17/month (RDS $15 + S3/CloudFront $1-2, Lambda/API Gateway free tier)

```bash
# Prerequisites: Create S3 bucket for Terraform state
aws s3 mb s3://padel-club-terraform-state --region eu-central-1

# Deploy infrastructure (from /terraform)
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
terraform init
terraform plan
terraform apply

# Deploy backend Lambda
cd ../backend
npm run build:lambda
aws lambda update-function-code \
  --function-name padel-club-api \
  --zip-file fileb://lambda.zip

# Deploy frontend to S3
cd ../frontend && npm run build
aws s3 sync dist/ s3://$(terraform -chdir=../terraform output -raw frontend_bucket_name) --delete
```

**Required variables (terraform.tfvars):**
- `db_password` - PostgreSQL password
- `github_repository` - For GitHub Actions OIDC (e.g., "owner/repo")
- `domain_name` - Root domain (e.g., "example.com")
- `google_client_id` - Google OAuth client ID
- `jwt_secret` - Secret for JWT signing
- `allowed_emails` - Comma-separated email whitelist

**Removed variables (no longer needed):**
- `key_name` - EC2 SSH key (no EC2 anymore)
- `allowed_ssh_cidr` - SSH access (no EC2 anymore)

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

**Backend environment variables (Lambda):**
```env
DATABASE_URL=postgresql://user:pass@rds-endpoint/dbname?schema=public&sslmode=require
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ALLOWED_EMAILS=joseguerola9@gmail.com,alexserra258@gmail.com
FRONTEND_URL=https://example.com
NODE_ENV=production
```

**Frontend environment variables (`frontend/.env`):**
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=https://api.example.com
```

**Auth endpoints:**
- `POST /api/auth/google` - Verify Google token, return JWT if whitelisted
- `GET /api/auth/me` - Validate current JWT, return user info

**Protected routes:**
- All `/api/players` endpoints require valid JWT from whitelisted user
- Frontend dashboard (`/`) requires authentication
- Non-authenticated users are redirected to `/login`
- Non-whitelisted users are shown `/forbidden` page

## GitHub Actions CI/CD

Automated deployments on push to `master` branch:

**Frontend (`deploy-frontend.yml`):**
- Triggers on changes to `frontend/**`
- Builds React app with Vite
- Deploys to S3
- Invalidates CloudFront cache

**Backend (`deploy-backend.yml`):**
- Triggers on changes to `backend/**`
- Builds TypeScript to `dist/`
- Installs production dependencies in `dist/`
- Generates Prisma client
- Creates Lambda zip package
- Deploys to Lambda via AWS CLI

**Required GitHub Secrets/Variables:**
- `AWS_ROLE_ARN` - IAM role for GitHub Actions OIDC
- `LAMBDA_FUNCTION_NAME` - Lambda function name (from Terraform output)
- `API_DOMAIN` - API custom domain (e.g., api.example.com)
- `S3_BUCKET_NAME` - Frontend S3 bucket
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID
- `VITE_API_URL` - API URL for frontend
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Local Development

**Backend:**
```bash
cd backend
npm install
docker-compose up -d # Start local PostgreSQL
npx prisma migrate dev # Run migrations
npm run seed # Seed data
npm run dev # Start on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev # Start on http://localhost:5173
```

**Database:**
- Local: `postgresql://padel:padel@localhost:5432/padel_club`
- Production: RDS endpoint from Terraform outputs

## Migration from EC2 to Lambda

The application was migrated from EC2 to serverless Lambda architecture. See `LAMBDA_DEPLOYMENT.md` for detailed migration guide.

**Key changes:**
- Express app extracted to `app.ts` for Lambda compatibility
- Lambda handler in `src/lambda/handler.ts` using `serverless-http`
- Prisma singleton pattern for connection pooling
- Lambda connects to RDS via public endpoint (no VPC, no NAT Gateway)
- API Gateway HTTP API replaces EC2 + NGINX
- GitHub Actions workflow updated for Lambda deployment

**Rollback:**
- EC2 configuration preserved in `terraform/ec2.tf.deprecated`
- Uncomment and rename to rollback if needed

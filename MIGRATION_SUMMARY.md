# EC2 to Lambda Migration Summary

## ✅ Migration Complete

Your padel club application has been successfully refactored from EC2 to AWS Lambda serverless architecture!

## What Changed

### Backend Architecture
- **Before:** Express app running 24/7 on EC2 t2.micro instance
- **After:** Express app wrapped in Lambda function, triggered on-demand by API Gateway

### Code Changes
1. ✅ Created `backend/src/app.ts` - Extracted Express app for Lambda compatibility
2. ✅ Created `backend/src/lambda/handler.ts` - Lambda entry point using serverless-http
3. ✅ Created `backend/src/lib/prisma.ts` - Singleton Prisma client for connection pooling
4. ✅ Updated `backend/src/routes/players.ts` - Use Prisma singleton
5. ✅ Updated `backend/package.json` - Added serverless-http dependency and build scripts

### Infrastructure Changes (Terraform)
1. ✅ Created `terraform/lambda.tf` - Lambda function (no VPC, 512MB, 30s timeout)
2. ✅ Created `terraform/api_gateway.tf` - API Gateway HTTP API with CORS
3. ✅ Updated `terraform/acm.tf` - Added regional certificate for API Gateway
4. ✅ Updated `terraform/route53.tf` - DNS points to API Gateway instead of EC2
5. ✅ Updated `terraform/security-groups.tf` - Removed EC2 SG, updated RDS for public access
6. ✅ Updated `terraform/iam.tf` - Lambda execution role + GitHub Actions permissions
7. ✅ Updated `terraform/outputs.tf` - Lambda and API Gateway outputs
8. ✅ Deprecated `terraform/ec2.tf` - Renamed to .deprecated for rollback

### CI/CD Changes
1. ✅ Updated `.github/workflows/deploy-backend.yml` - Lambda deployment via AWS CLI
2. ✅ Frontend workflow unchanged - still deploys to S3 + CloudFront

## Cost Savings

| Component | Before (EC2) | After (Lambda) | Savings |
|-----------|--------------|----------------|---------|
| Compute | EC2 t2.micro: $8/mo | Lambda: $0 (free tier) | **$8/mo** |
| Networking | Elastic IP: $0 | API Gateway: $0 (free tier) | $0 |
| Database | RDS: $15/mo | RDS: $15/mo | $0 |
| Storage | S3: $1-2/mo | S3: $1-2/mo | $0 |
| **Total** | **~$24/mo** | **~$16/mo** | **~$8/mo (33% reduction)** |

**Note:** Lambda and API Gateway are effectively free for your traffic volume (~3K requests/month).

## Next Steps

### 1. Install New Dependency
```bash
cd backend
npm install
```

### 2. Deploy Infrastructure
```bash
cd terraform
terraform init
terraform plan  # Review changes
terraform apply # Deploy Lambda, API Gateway, remove EC2
```

### 3. Update GitHub Actions Variables
Go to your GitHub repository → Settings → Secrets and variables → Actions

**Add/Update Variables:**
- `LAMBDA_FUNCTION_NAME` = (from Terraform output)
- `API_DOMAIN` = (from Terraform output, e.g., api.yoursite.com)

**Remove (no longer needed):**
- `EC2_HOST`
- `EC2_SSH_KEY`

### 4. Initial Lambda Deployment
```bash
cd backend
npm run build:lambda
aws lambda update-function-code \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --zip-file fileb://lambda.zip \
  --region eu-central-1
```

### 5. Test the API
```bash
curl https://api.yoursite.com/health
# Should return: {"status":"ok"}
```

### 6. Push to GitHub
```bash
git add .
git commit -m "refactor: Migrate from EC2 to Lambda serverless architecture"
git push origin master
```

GitHub Actions will automatically deploy future changes!

## Architecture Diagram

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  S3 + CloudFront │  (Frontend)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  API Gateway     │  (HTTPS + CORS)
│  HTTP API        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Lambda Function │  (Backend API)
│  Node.js 20      │  (No VPC)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  RDS PostgreSQL  │  (Database)
│  db.t3.micro     │  (Public endpoint)
└──────────────────┘
```

## Key Benefits

✅ **Cost Reduction:** ~33% savings ($8/month)
✅ **Scalability:** Automatic scaling with Lambda
✅ **Simplicity:** No server management, no SSH, no systemd
✅ **Pay-per-use:** Only charged for actual requests
✅ **High Availability:** Lambda runs across multiple AZs
✅ **CI/CD Ready:** GitHub Actions deploys automatically

## Rollback Plan

If you need to rollback:

1. Rename `terraform/ec2.tf.deprecated` to `terraform/ec2.tf`
2. Uncomment all EC2 resources
3. Comment out Lambda and API Gateway resources
4. Run `terraform apply`
5. Update GitHub Actions to deploy to EC2

## Documentation

- **Detailed Migration Guide:** See `LAMBDA_DEPLOYMENT.md`
- **Architecture Reference:** See `CLAUDE.md`
- **Troubleshooting:** Check CloudWatch logs at `/aws/lambda/<function-name>`

## Support

If you encounter issues:
- Check Lambda CloudWatch logs
- Verify RDS security group allows public access
- Ensure DATABASE_URL includes `sslmode=require`
- Test with API Gateway URL before custom domain

---

🎉 **Congratulations!** Your application is now fully serverless and ready for deployment!

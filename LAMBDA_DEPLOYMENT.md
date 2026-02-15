# Lambda Migration Deployment Guide

## Pre-Deployment Checklist

### 1. Install serverless-http dependency
```bash
cd backend
npm install serverless-http
```

### 2. Verify Terraform variables
Ensure your `terraform/terraform.tfvars` has all required variables (no EC2-specific vars needed anymore):
- `db_password`
- `github_repository`
- `domain_name`
- `google_client_id`
- `jwt_secret`
- `allowed_emails`

## Deployment Steps

### Step 1: Deploy Terraform Infrastructure

```bash
cd terraform

# Initialize Terraform (if not already done)
terraform init

# Review the plan (EC2 will be destroyed, Lambda + API Gateway will be created)
terraform plan

# Apply changes
terraform apply
```

**Important outputs to note:**
- `lambda_function_name` - You'll need this for GitHub Actions
- `api_gateway_url` - Temporary URL for testing
- `backend_url` - Your final custom domain URL (e.g., https://api.example.com)

### Step 2: Update GitHub Secrets/Variables

Update your GitHub repository settings (Settings → Secrets and variables → Actions):

**Add/Update Variables:**
- `LAMBDA_FUNCTION_NAME` = Output from terraform (e.g., `padel-club-api`)
- `API_DOMAIN` = Output from terraform (e.g., `api.example.com`)

**Keep existing variables:**
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`
- `DOMAIN_NAME`
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

**Keep existing secrets:**
- `AWS_ROLE_ARN`

**Remove (no longer needed):**
- `EC2_HOST`
- `EC2_SSH_KEY`

### Step 3: Initial Lambda Deployment

Since Terraform creates the Lambda with a placeholder, deploy the actual code:

```bash
cd backend

# Build the Lambda package
npm run build

# Copy node_modules to dist
cp -r node_modules dist/

# Generate Prisma client in dist
cd dist && npx prisma generate && cd ..

# Create zip file
cd dist && zip -r ../lambda.zip . -x "*.map" && cd ..

# Deploy to Lambda
aws lambda update-function-code \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --zip-file fileb://lambda.zip \
  --region eu-central-1

# Wait for update to complete
aws lambda wait function-updated \
  --function-name <LAMBDA_FUNCTION_NAME> \
  --region eu-central-1
```

Replace `<LAMBDA_FUNCTION_NAME>` with the output from Terraform.

### Step 4: Run Database Migrations

Since Lambda can't run migrations directly, run them locally:

```bash
cd backend

# Set DATABASE_URL to production RDS
export DATABASE_URL="postgresql://username:password@rds-endpoint/dbname?schema=public&sslmode=require"

# Run migrations
npx prisma migrate deploy
```

Get the RDS endpoint from Terraform outputs: `terraform output rds_endpoint`

### Step 5: Test the API

Test with the API Gateway URL first:

```bash
# Health check
curl https://api.example.com/health

# Should return: {"status":"ok"}
```

Test authentication (requires valid Google OAuth token - test via frontend).

### Step 6: Verify GitHub Actions

Push a change to the backend to trigger the GitHub Actions workflow:

```bash
# Make a small change (e.g., add a comment)
cd backend/src
echo "// Lambda deployment test" >> app.ts

git add .
git commit -m "test: Verify Lambda deployment pipeline"
git push origin master
```

Check GitHub Actions tab to ensure deployment succeeds.

### Step 7: Update Frontend API URL (if needed)

If you're using a custom domain and VITE_API_URL needs updating:

1. Update GitHub Actions variable: `VITE_API_URL` = `https://api.example.com`
2. Trigger frontend deployment or update manually:

```bash
cd frontend

# Update .env for local development
echo "VITE_API_URL=https://api.example.com" > .env

# Build and deploy to S3
npm run build
aws s3 sync dist/ s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

## Verification Steps

### 1. Check Lambda Function
```bash
aws lambda get-function --function-name <LAMBDA_FUNCTION_NAME>
```

### 2. Check API Gateway
```bash
aws apigatewayv2 get-apis
```

### 3. Test All Endpoints

```bash
# Health check
curl https://api.example.com/health

# List players (requires auth token)
curl https://api.example.com/api/players \
  -H "Authorization: Bearer <token>"
```

### 4. Check CloudWatch Logs

```bash
aws logs tail /aws/lambda/<LAMBDA_FUNCTION_NAME> --follow
```

## Cost Monitoring

After deployment, monitor costs:

```bash
# Check Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=<LAMBDA_FUNCTION_NAME> \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-31T23:59:59Z \
  --period 86400 \
  --statistics Sum
```

Expected monthly cost: ~$15-17/month (RDS $15 + S3/CloudFront $1-2)

## Rollback Plan

If issues arise, rollback to EC2:

1. Rename `terraform/ec2.tf.deprecated` back to `ec2.tf`
2. Uncomment all resources
3. Comment out Lambda and API Gateway resources
4. Run `terraform apply`
5. Update Route53 to point to EC2
6. Redeploy backend to EC2

## Troubleshooting

### Lambda Function Errors

**Error: "Cannot find module"**
- Ensure `node_modules` is included in the Lambda zip
- Verify Prisma client was generated in dist folder

**Error: "Connection timeout"**
- Check RDS security group allows inbound from 0.0.0.0/0
- Verify DATABASE_URL includes `sslmode=require`
- Check Lambda timeout (should be 30 seconds)

**Error: "Too many connections"**
- Prisma singleton not working
- Verify `getPrismaClient()` is used in all routes
- Consider adding connection pooling with PgBouncer

### API Gateway Errors

**Error: 403 Forbidden**
- Check CORS configuration in `api_gateway.tf`
- Verify frontend URL is allowed in CORS origins

**Error: 502 Bad Gateway**
- Lambda function error - check CloudWatch logs
- Lambda timeout - increase timeout or optimize code

**Error: Custom domain not working**
- ACM certificate not validated - check Route53 records
- DNS propagation delay - wait 5-10 minutes

### GitHub Actions Deployment Fails

**Error: "Access Denied" when updating Lambda**
- Check IAM role has `lambda:UpdateFunctionCode` permission
- Verify GitHub Actions role ARN in secrets

**Error: "Function not found"**
- Check `LAMBDA_FUNCTION_NAME` variable matches Terraform output

## Post-Migration Cleanup

Once verified, clean up EC2-related resources:

1. Terminate EC2 instance manually (if Terraform didn't remove it)
2. Release Elastic IP
3. Remove EC2 security group
4. Remove EC2 SSH key from AWS
5. Remove `EC2_HOST` and `EC2_SSH_KEY` from GitHub secrets
6. Archive or delete `terraform/ec2.tf.deprecated`

## Next Steps

Consider these optimizations:

1. **Aurora Serverless v2** - If traffic decreases further (but currently more expensive)
2. **Lambda Provisioned Concurrency** - For consistently fast cold starts (if needed)
3. **API Gateway Caching** - Cache GET /api/players responses (cost: ~$0.02/hour)
4. **CloudFront for API** - Add CloudFront in front of API Gateway for better performance
5. **RDS Proxy** - For better connection pooling (cost: ~$15/month - not worth it for low traffic)

## Monitoring & Alerts

Set up CloudWatch alarms:

```bash
# Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=<LAMBDA_FUNCTION_NAME>

# API Gateway 5xx errors
aws cloudwatch put-metric-alarm \
  --alarm-name api-gateway-errors \
  --alarm-description "Alert on API Gateway 5xx errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold
```

## Support

If you encounter issues:
1. Check CloudWatch logs for Lambda and API Gateway
2. Verify RDS connectivity with `psql` from local machine
3. Review GitHub Actions logs for deployment issues
4. Check AWS Cost Explorer for unexpected charges

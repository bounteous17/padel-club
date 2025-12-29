# Terraform Infrastructure

AWS infrastructure for Padel Club using free tier resources.

## Architecture

- **S3** - Frontend static website hosting (free public URL)
- **EC2 t2.micro** - Backend API server (Amazon Linux 2023)
- **RDS db.t3.micro** - PostgreSQL 16 database (publicly accessible)
- **VPC** - Public subnets, security groups
- **IAM** - GitHub Actions OIDC for CI/CD deployments

## Commands Summary

### Prerequisites

```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://padel-club-terraform-state --region eu-central-1

# Create terraform.tfvars from example
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values:
#   - key_name: your EC2 key pair name
#   - db_password: secure database password
#   - allowed_ssh_cidr: your IP (e.g., "203.0.113.25/32")
#   - allowed_db_cidr: CIDR for database access (e.g., "0.0.0.0/0")
#   - github_repository: your GitHub repo (e.g., "username/padel-club")
```

### Deploy Infrastructure

```bash
terraform init
terraform plan
terraform apply
```

### GitHub Actions Setup

After running `terraform apply`, configure these GitHub repository secrets:

| Secret | Value | Command to get |
|--------|-------|----------------|
| `AWS_ROLE_ARN` | IAM Role ARN | `terraform output github_actions_role_arn` |
| `S3_BUCKET_NAME` | Frontend S3 bucket | `terraform output frontend_bucket_name` |
| `EC2_INSTANCE_ID` | EC2 instance ID | `terraform output ec2_instance_id` |
| `VITE_API_URL` | Backend URL | `terraform output backend_url` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |

Deployments are triggered automatically:
- **Frontend**: Push to `master` with changes in `frontend/`
- **Backend**: Push to `master` with changes in `backend/`

### Manual Deploy Frontend

```bash
cd ../frontend
npm run build
aws s3 sync dist/ s3://$(terraform -chdir=../terraform output -raw frontend_bucket_name) --delete
```

### Manual Deploy Backend

```bash
# SSH into EC2
ssh -i ~/.ssh/YOUR_KEY.pem ec2-user@$(terraform output -raw backend_public_ip)

# On the EC2 instance:
cd /opt/padel-club
# Copy backend code here, then:
npm install
npx prisma migrate deploy
npm run build
sudo systemctl restart padel-club
```

### Useful Commands

```bash
# View all outputs
terraform output

# Get frontend URL
terraform output frontend_url

# Get backend URL/IP
terraform output backend_url
terraform output backend_public_ip

# Get database endpoint
terraform output rds_endpoint

# Get SSH command
terraform output ssh_command

# Destroy infrastructure
terraform destroy
```

## Outputs

| Output | Description |
|--------|-------------|
| `frontend_url` | S3 website URL (public, free) |
| `frontend_bucket_name` | S3 bucket name for deployments |
| `backend_url` | Backend API URL (EC2) |
| `backend_public_ip` | EC2 Elastic IP |
| `rds_endpoint` | PostgreSQL connection endpoint |
| `ssh_command` | Ready-to-use SSH command |
| `github_actions_role_arn` | IAM role for GitHub Actions |
| `ec2_instance_id` | EC2 instance ID for deployments |

## Cost

- **Free tier (12 months)**: ~$0/month
- **After free tier**: ~$20-25/month
  - EC2 t2.micro: ~$8/month
  - RDS db.t3.micro: ~$12/month
  - S3: ~$0.02/month (minimal storage)
  - Data transfer: ~$0-5/month (depending on usage)
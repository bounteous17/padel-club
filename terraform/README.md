# Terraform Infrastructure

AWS infrastructure for Padel Club using free tier resources.

## Architecture

- **S3** - Frontend static website hosting
- **EC2 t2.micro** - Backend API server (Amazon Linux 2023)
- **RDS db.t3.micro** - PostgreSQL 16 database
- **VPC** - Public/private subnets, security groups

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
```

### Deploy Infrastructure

```bash
terraform init
terraform plan
terraform apply
```

### Deploy Frontend

```bash
cd ../frontend
npm run build
aws s3 sync dist/ s3://$(terraform -chdir=../terraform output -raw frontend_bucket_name) --delete
```

### Deploy Backend

```bash
# SSH into EC2
ssh -i ~/.ssh/YOUR_KEY.pem ec2-user@$(terraform output -raw backend_public_ip)

# On the EC2 instance:
cd /opt/padel-club
# Copy backend code here, then:
npm install
npx prisma migrate deploy
npm run build
sudo systemctl start padel-club
```

### Useful Commands

```bash
# View all outputs
terraform output

# Get frontend URL
terraform output frontend_url

# Get backend IP
terraform output backend_public_ip

# Get SSH command
terraform output ssh_command

# Destroy infrastructure
terraform destroy
```

## Outputs

| Output | Description |
|--------|-------------|
| `frontend_url` | S3 website URL |
| `backend_url` | Backend API URL (EC2) |
| `backend_public_ip` | EC2 Elastic IP |
| `rds_endpoint` | PostgreSQL connection endpoint |
| `ssh_command` | Ready-to-use SSH command |
| `frontend_bucket_name` | S3 bucket name for deployments |

## Cost

- **Free tier (12 months)**: ~$0/month
- **After free tier**: ~$25-28/month
# Frontend
output "frontend_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_url" {
  description = "Frontend website URL (HTTPS)"
  value       = "https://${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

# Backend
output "backend_public_ip" {
  description = "Backend EC2 public IP (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_url" {
  description = "Backend API URL (HTTPS)"
  value       = "https://${var.api_subdomain}.${var.domain_name}"
}

output "api_domain" {
  description = "API domain name"
  value       = "${var.api_subdomain}.${var.domain_name}"
}

# Database
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_connection_string" {
  description = "Database connection string (without password)"
  value       = "postgresql://${var.db_username}:****@${aws_db_instance.main.endpoint}/${var.db_name}"
  sensitive   = false
}

# VPC
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

# SSH Command
output "ssh_command" {
  description = "SSH command to connect to backend EC2"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ec2-user@${aws_eip.backend.public_ip}"
}

# GitHub Actions
output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}

output "ec2_instance_id" {
  description = "EC2 Instance ID for backend deployments"
  value       = aws_instance.backend.id
}

# Frontend
output "frontend_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_url" {
  description = "Frontend website URL"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}

# Backend
output "backend_public_ip" {
  description = "Backend EC2 public IP (Elastic IP)"
  value       = aws_eip.backend.public_ip
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.backend.public_ip}:3000"
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

# DEPRECATED: EC2 Security Group - migrated to Lambda
# Lambda functions don't need a security group (not in VPC)
# 
# # Security Group for EC2 (Backend API)
# resource "aws_security_group" "ec2" {
#   name        = "${var.project_name}-ec2-sg"
#   description = "Security group for backend EC2 instance"
#   vpc_id      = aws_vpc.main.id
# 
#   # HTTP
#   ingress {
#     from_port   = 80
#     to_port     = 80
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "HTTP"
#   }
# 
#   # HTTPS
#   ingress {
#     from_port   = 443
#     to_port     = 443
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "HTTPS"
#   }
# 
#   # SSH (restricted)
#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = [var.allowed_ssh_cidr]
#     description = "SSH"
#   }
# 
#   # Backend API port (Node.js)
#   ingress {
#     from_port   = 3000
#     to_port     = 3000
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "Node.js API"
#   }
# 
#   # All outbound traffic
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#     description = "All outbound"
#   }
# 
#   tags = {
#     Name = "${var.project_name}-ec2-sg"
#   }
# }

# Security Group for RDS (PostgreSQL)
# Lambda connects via public endpoint (no VPC), so we allow access from allowed_db_cidr
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  # PostgreSQL from allowed CIDR (for Lambda and public access)
  # Lambda functions access RDS via public endpoint since they're not in VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.allowed_db_cidr]
    description = "PostgreSQL public access (Lambda + development)"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound"
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance for Backend API
resource "aws_instance" "backend" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.ec2_instance_type
  key_name               = var.key_name
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = base64encode(templatefile("${path.module}/user-data.sh", {
    db_host           = aws_db_instance.main.address
    db_port           = aws_db_instance.main.port
    db_name           = var.db_name
    db_username       = var.db_username
    db_password       = var.db_password
    api_domain        = "${var.api_subdomain}.${var.domain_name}"
    frontend_domain   = var.domain_name
    certificate_email = var.certificate_email
    google_client_id  = var.google_client_id
    jwt_secret        = var.jwt_secret
    jwt_expires_in    = var.jwt_expires_in
    allowed_emails    = var.allowed_emails
  }))

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = {
    Name = "${var.project_name}-backend"
  }
}

# Elastic IP for static public address
resource "aws_eip" "backend" {
  instance = aws_instance.backend.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-backend-eip"
  }
}

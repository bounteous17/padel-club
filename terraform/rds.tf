# RDS PostgreSQL Instance (Free Tier)
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  # Engine
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = var.db_instance_class
  allocated_storage    = var.db_allocated_storage
  storage_type         = "gp2"
  storage_encrypted    = false # Free tier doesn't support encryption

  # Database
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  # Backup & Maintenance
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Free tier optimizations
  multi_az               = false
  skip_final_snapshot    = true
  deletion_protection    = false
  copy_tags_to_snapshot  = true

  # Performance Insights (disabled for free tier)
  performance_insights_enabled = false

  tags = {
    Name = "${var.project_name}-db"
  }
}

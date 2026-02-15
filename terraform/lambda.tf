# Lambda Function for API Backend
# No VPC - connects to RDS via public endpoint

# Lambda function
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "lambda/handler.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 512
  architectures = ["arm64"]

  # Placeholder for initial deployment - GitHub Actions will update this
  filename         = "${path.module}/lambda-placeholder.zip"
  source_code_hash = filebase64sha256("${path.module}/lambda-placeholder.zip")

  environment {
    variables = {
      DATABASE_URL     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.main.endpoint}/${var.db_name}?schema=public&sslmode=require"
      GOOGLE_CLIENT_ID = var.google_client_id
      JWT_SECRET       = var.jwt_secret
      JWT_EXPIRES_IN   = var.jwt_expires_in
      ALLOWED_EMAILS   = var.allowed_emails
      FRONTEND_URL     = "https://${var.domain_name}"
      NODE_ENV         = "production"
    }
  }

  tags = {
    Name = "${var.project_name}-api"
  }

  lifecycle {
    ignore_changes = [
      filename,
      source_code_hash,
      last_modified
    ]
  }
}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-lambda-logs"
  }
}

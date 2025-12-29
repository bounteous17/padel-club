#!/bin/bash
set -e

# Update system
dnf update -y

# Install Node.js 20, AWS CLI, and SSM agent
dnf install -y nodejs npm git unzip

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Ensure SSM agent is installed and running (pre-installed on Amazon Linux 2023)
dnf install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Create app user
useradd -m -s /bin/bash appuser

# Create app directory
mkdir -p /opt/padel-club
chown appuser:appuser /opt/padel-club

# Create environment file
cat > /opt/padel-club/.env << 'ENVFILE'
DATABASE_URL="postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}?schema=public"
PORT=3000
NODE_ENV=production
ENVFILE
chown appuser:appuser /opt/padel-club/.env
chmod 600 /opt/padel-club/.env

# Create systemd service for the backend
cat > /etc/systemd/system/padel-club.service << 'EOF'
[Unit]
Description=Padel Club Backend API
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/padel-club
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
RestartSec=10
EnvironmentFile=/opt/padel-club/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable service (will start after deployment)
systemctl daemon-reload
systemctl enable padel-club

# Log completion
echo "EC2 setup complete at $(date). Deploy backend code to /opt/padel-club" >> /var/log/user-data.log

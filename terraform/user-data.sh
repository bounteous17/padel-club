#!/bin/bash
set -e

# Update system
dnf update -y

# Install Node.js 20
dnf install -y nodejs npm git

# Create app user
useradd -m -s /bin/bash appuser

# Create app directory
mkdir -p /opt/padel-club
chown appuser:appuser /opt/padel-club

# Create environment file
cat > /opt/padel-club/.env << 'ENVFILE'
DATABASE_URL="postgresql://${db_username}:${db_password}@${db_host}:${db_port}/${db_name}?schema=public"
PORT=3000
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
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Enable service (will start after deployment)
systemctl daemon-reload
systemctl enable padel-club

# Log completion
echo "EC2 setup complete. Deploy backend code to /opt/padel-club" >> /var/log/user-data.log

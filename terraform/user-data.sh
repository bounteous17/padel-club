#!/bin/bash
set -e

# Update system
dnf update -y

# Install Node.js 20, AWS CLI, Nginx, and other dependencies
dnf install -y nodejs npm git unzip nginx

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf aws awscliv2.zip

# Ensure SSM agent is installed and running (pre-installed on Amazon Linux 2023)
dnf install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# Install certbot for Let's Encrypt
dnf install -y augeas-libs
python3 -m venv /opt/certbot/
/opt/certbot/bin/pip install --upgrade pip
/opt/certbot/bin/pip install certbot certbot-nginx
ln -sf /opt/certbot/bin/certbot /usr/bin/certbot

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
FRONTEND_URL=https://${frontend_domain}
GOOGLE_CLIENT_ID=${google_client_id}
JWT_SECRET=${jwt_secret}
JWT_EXPIRES_IN=${jwt_expires_in}
ALLOWED_EMAILS=${allowed_emails}
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

# Enable backend service (will start after deployment)
systemctl daemon-reload
systemctl enable padel-club

# Configure Nginx as reverse proxy
cat > /etc/nginx/conf.d/padel-club.conf << 'EOF'
server {
    listen 80;
    server_name ${api_domain};

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Remove default nginx config
rm -f /etc/nginx/conf.d/default.conf

# Start Nginx
systemctl enable nginx
systemctl start nginx

# Obtain Let's Encrypt certificate (will fail if DNS not ready, that's OK)
# The certificate will be obtained manually or on first deploy
cat > /opt/setup-ssl.sh << 'SSLSCRIPT'
#!/bin/bash
certbot --nginx -d ${api_domain} --non-interactive --agree-tos -m ${certificate_email} --redirect
SSLSCRIPT
chmod +x /opt/setup-ssl.sh

# Set up auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Log completion
echo "EC2 setup complete at $(date). Deploy backend code to /opt/padel-club" >> /var/log/user-data.log
echo "Run '/opt/setup-ssl.sh' after DNS is configured to enable HTTPS" >> /var/log/user-data.log

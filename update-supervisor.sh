#!/bin/bash

# Update supervisor configuration for Node.js backend + Next.js frontend
echo "Updating supervisor configuration..."

# Stop existing services
sudo supervisorctl stop backend
sudo supervisorctl stop frontend

# Create new supervisor configuration for Node.js backend
sudo tee /etc/supervisor/conf.d/backend_nodejs.conf > /dev/null <<EOF
[program:backend_nodejs]
command=npm start
directory=/app/backend
autostart=true
autorestart=true
environment=NODE_ENV="production"
stderr_logfile=/var/log/supervisor/backend_nodejs.err.log
stdout_logfile=/var/log/supervisor/backend_nodejs.out.log
stopsignal=TERM
stopwaitsecs=30
stopasgroup=true
killasgroup=true
user=root
EOF

# Create new supervisor configuration for Next.js frontend
sudo tee /etc/supervisor/conf.d/frontend_nextjs.conf > /dev/null <<EOF
[program:frontend_nextjs]
command=yarn start
directory=/app
autostart=true
autorestart=true
environment=NODE_ENV="production",HOST="0.0.0.0",PORT="3000"
stderr_logfile=/var/log/supervisor/frontend_nextjs.err.log
stdout_logfile=/var/log/supervisor/frontend_nextjs.out.log
stopsignal=TERM
stopwaitsecs=50
stopasgroup=true
killasgroup=true
user=root
EOF

# Disable the old configurations by renaming them
sudo mv /etc/supervisor/conf.d/supervisord.conf /etc/supervisor/conf.d/supervisord.conf.disabled

# Reload supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start new services
sudo supervisorctl start backend_nodejs
sudo supervisorctl start frontend_nextjs

echo "Supervisor configuration updated successfully!"
echo "Backend (Node.js) running on port 10000"
echo "Frontend (Next.js) running on port 3000"

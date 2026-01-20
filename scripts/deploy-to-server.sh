#!/bin/bash

# ============================================
# Lift Planner Pro - Server Deployment Script
# Domain: liftplannerpro.co.uk
# Port: 3001 (to avoid conflict with NodePress on 3000)
# ============================================

set -e

echo "=========================================="
echo "  Lift Planner Pro Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="liftplannerpro"
APP_PORT=3001
DOMAIN="liftplannerpro.co.uk"
APP_DIR="/var/www/liftplannerpro"
REPO_URL="https://github.com/syntex82/LiftPlannerPro.git"

echo -e "${YELLOW}Step 1: Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo -e "${YELLOW}Step 2: Cloning repository...${NC}"
if [ -d "$APP_DIR/.git" ]; then
    echo "Repository exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}Step 4: Creating production environment file...${NC}"
cat > .env.production << 'EOF'
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/liftplannerpro"

# NextAuth - Generate a new secret with: openssl rand -base64 32
NEXTAUTH_URL="https://liftplannerpro.co.uk"
NEXTAUTH_SECRET="GENERATE_NEW_SECRET_HERE"

# App Configuration
NODE_ENV=production
PORT=3001

# Stripe (optional - for payments)
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_PUBLISHABLE_KEY="pk_live_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."

# Google Analytics (optional)
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
EOF

echo -e "${RED}⚠️  IMPORTANT: Edit .env.production with your actual credentials!${NC}"
echo -e "${YELLOW}   nano $APP_DIR/.env.production${NC}"

echo -e "${YELLOW}Step 5: Creating PostgreSQL database...${NC}"
echo "Run these commands to create the database:"
echo -e "${GREEN}"
echo "  sudo -u postgres psql"
echo "  CREATE DATABASE liftplannerpro;"
echo "  CREATE USER liftplanner WITH ENCRYPTED PASSWORD 'your_password';"
echo "  GRANT ALL PRIVILEGES ON DATABASE liftplannerpro TO liftplanner;"
echo "  \\q"
echo -e "${NC}"

echo -e "${YELLOW}Step 6: Building the application...${NC}"
npm run build

echo -e "${YELLOW}Step 7: Running database migrations...${NC}"
npx prisma db push

echo -e "${YELLOW}Step 8: Creating Nginx configuration...${NC}"
sudo tee /etc/nginx/sites-available/liftplannerpro > /dev/null << 'EOF'
server {
    listen 80;
    server_name liftplannerpro.co.uk www.liftplannerpro.co.uk;

    # Redirect HTTP to HTTPS (after SSL is set up)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SSE/WebSocket support for chat
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        
        # Increase body size for file uploads
        client_max_body_size 50M;
    }
}
EOF

echo -e "${YELLOW}Step 9: Enabling Nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/liftplannerpro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo -e "${YELLOW}Step 10: Setting up PM2 process manager...${NC}"
# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'liftplannerpro',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/liftplannerpro',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

echo -e "${GREEN}=========================================="
echo "  Deployment Preparation Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
echo ""
echo "1. Edit the environment file:"
echo -e "   ${GREEN}nano $APP_DIR/.env.production${NC}"
echo ""
echo "2. Update DATABASE_URL with your PostgreSQL password"
echo "3. Generate NEXTAUTH_SECRET:"
echo -e "   ${GREEN}openssl rand -base64 32${NC}"
echo ""
echo "4. Start the application with PM2:"
echo -e "   ${GREEN}cd $APP_DIR && pm2 start ecosystem.config.js${NC}"
echo ""
echo "5. Save PM2 configuration:"
echo -e "   ${GREEN}pm2 save && pm2 startup${NC}"
echo ""
echo "6. Set up SSL with Certbot:"
echo -e "   ${GREEN}sudo certbot --nginx -d liftplannerpro.co.uk -d www.liftplannerpro.co.uk${NC}"
echo ""
echo "7. Verify the site is running:"
echo -e "   ${GREEN}curl http://localhost:3001${NC}"
echo ""
echo -e "${GREEN}🎉 Your site will be live at: https://liftplannerpro.co.uk${NC}"


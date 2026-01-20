#!/bin/bash

# ============================================
# Lift Planner Pro - FULLY AUTOMATED DEPLOY
# Run this from /var/www/liftplannerpro
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "  Lift Planner Pro - Auto Deploy"
echo "==========================================${NC}"

# Configuration
DB_NAME="liftplannerpro"
DB_USER="liftplanner"
DB_PASS="LiftPlan$(openssl rand -hex 8)"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
APP_PORT=3001
DOMAIN="liftplannerpro.co.uk"

echo -e "${YELLOW}Generated credentials:${NC}"
echo "  Database Password: $DB_PASS"
echo "  NextAuth Secret: $NEXTAUTH_SECRET"
echo ""

# Step 1: Create PostgreSQL database
echo -e "${YELLOW}[1/8] Creating PostgreSQL database...${NC}"
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
sudo -u postgres psql -c "CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
echo -e "${GREEN}✓ Database created${NC}"

# Step 2: Create .env.production
echo -e "${YELLOW}[2/8] Creating environment file...${NC}"
cat > .env.production << EOF
DATABASE_URL="postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NODE_ENV=production
PORT=$APP_PORT
EOF

# Also create .env for prisma
cp .env.production .env
echo -e "${GREEN}✓ Environment configured${NC}"

# Step 3: Build the application
echo -e "${YELLOW}[3/8] Building application (this takes a few minutes)...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Step 4: Run database migrations
echo -e "${YELLOW}[4/8] Running database migrations...${NC}"
npx prisma db push --accept-data-loss
echo -e "${GREEN}✓ Database migrated${NC}"

# Step 5: Create Nginx config
echo -e "${YELLOW}[5/8] Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/liftplannerpro > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        client_max_body_size 50M;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/liftplannerpro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Step 6: Install PM2 if needed
echo -e "${YELLOW}[6/8] Setting up PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop existing instance if running
pm2 delete liftplannerpro 2>/dev/null || true

# Start the application
PORT=$APP_PORT pm2 start npm --name "liftplannerpro" -- start
pm2 save
echo -e "${GREEN}✓ PM2 configured and app started${NC}"

# Step 7: Setup PM2 startup
echo -e "${YELLOW}[7/8] Configuring PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root 2>/dev/null || true
pm2 save
echo -e "${GREEN}✓ PM2 startup configured${NC}"

# Step 8: Setup SSL
echo -e "${YELLOW}[8/8] Setting up SSL certificate...${NC}"
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || {
    echo -e "${YELLOW}⚠ SSL setup requires manual intervention. Run:${NC}"
    echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
}

echo ""
echo -e "${GREEN}=========================================="
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Your site is now live at:${NC}"
echo -e "  ${GREEN}https://$DOMAIN${NC}"
echo ""
echo -e "${YELLOW}Credentials (SAVE THESE):${NC}"
echo "  Database: $DB_NAME"
echo "  DB User: $DB_USER"
echo "  DB Password: $DB_PASS"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  pm2 logs liftplannerpro    - View logs"
echo "  pm2 restart liftplannerpro - Restart app"
echo "  pm2 status                 - Check status"
echo ""


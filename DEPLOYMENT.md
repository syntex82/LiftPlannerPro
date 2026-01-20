# Lift Planner Pro - Server Deployment Guide

## Quick Deploy (alongside NodePress)

### 1. SSH into your server
```bash
ssh your-user@your-server-ip
```

### 2. Clone and setup
```bash
# Create directory
sudo mkdir -p /var/www/liftplannerpro
sudo chown $USER:$USER /var/www/liftplannerpro

# Clone repo
git clone https://github.com/syntex82/LiftPlannerPro.git /var/www/liftplannerpro
cd /var/www/liftplannerpro

# Install dependencies
npm install
```

### 3. Create PostgreSQL database
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE liftplannerpro;
CREATE USER liftplanner WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE liftplannerpro TO liftplanner;
\q
```

### 4. Configure environment
```bash
nano .env.production
```
```env
DATABASE_URL="postgresql://liftplanner:your_secure_password@localhost:5432/liftplannerpro"
NEXTAUTH_URL="https://liftplannerpro.co.uk"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NODE_ENV=production
PORT=3001
```

### 5. Build and migrate
```bash
npm run build
npx prisma db push
```

### 6. Create Nginx config
```bash
sudo nano /etc/nginx/sites-available/liftplannerpro
```
```nginx
server {
    listen 80;
    server_name liftplannerpro.co.uk www.liftplannerpro.co.uk;

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
        
        # Chat/SSE support
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        
        client_max_body_size 50M;
    }
}
```

### 7. Enable site
```bash
sudo ln -sf /etc/nginx/sites-available/liftplannerpro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Setup PM2
```bash
# Install PM2 if not already installed
sudo npm install -g pm2

# Start the app
cd /var/www/liftplannerpro
PORT=3001 pm2 start npm --name "liftplannerpro" -- start

# Save and setup startup
pm2 save
pm2 startup
```

### 9. Setup SSL
```bash
sudo certbot --nginx -d liftplannerpro.co.uk -d www.liftplannerpro.co.uk
```

### 10. Verify
```bash
# Check app is running
pm2 status

# Check nginx
sudo nginx -t

# Test locally
curl http://localhost:3001

# Check logs
pm2 logs liftplannerpro
```

---

## Commands Reference

| Action | Command |
|--------|---------|
| Start app | `pm2 start liftplannerpro` |
| Stop app | `pm2 stop liftplannerpro` |
| Restart app | `pm2 restart liftplannerpro` |
| View logs | `pm2 logs liftplannerpro` |
| Check status | `pm2 status` |
| Update code | `git pull && npm run build && pm2 restart liftplannerpro` |
| Reload nginx | `sudo systemctl reload nginx` |

## Ports

| Service | Port |
|---------|------|
| NodePress (existing) | 3000 |
| Lift Planner Pro | 3001 |
| PostgreSQL | 5432 |
| Nginx HTTP | 80 |
| Nginx HTTPS | 443 |

## Troubleshooting

### App not starting
```bash
pm2 logs liftplannerpro --lines 50
```

### Database connection issues
```bash
# Test connection
psql -U liftplanner -h localhost -d liftplannerpro
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```


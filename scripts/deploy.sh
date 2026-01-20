#!/bin/bash

# Lift Planner Pro - Production Deployment Script
# This script sets up everything needed for production deployment

echo ""
echo "========================================="
echo "  LIFT PLANNER PRO - DEPLOYMENT SETUP"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to prompt for input with default value
get_input() {
    local prompt="$1"
    local default="$2"
    local is_secret="$3"
    local result
    
    if [ -n "$default" ]; then
        prompt_text="$prompt [$default]: "
    else
        prompt_text="$prompt: "
    fi
    
    if [ "$is_secret" = "true" ]; then
        read -sp "$prompt_text" result
        echo ""
    else
        read -p "$prompt_text" result
    fi
    
    if [ -z "$result" ] && [ -n "$default" ]; then
        echo "$default"
    else
        echo "$result"
    fi
}

echo -e "${YELLOW}This script will help you configure Lift Planner Pro for production.${NC}"
echo ""

# Step 1: Environment Selection
echo -e "${GREEN}STEP 1: Environment Configuration${NC}"
echo "---------------------------------"
echo "1) Local Development"
echo "2) Render"
echo "3) Vercel"
echo "4) Custom Domain"
env_choice=$(get_input "Select environment (1-4)" "1")

case $env_choice in
    1) environment="local"; app_url="http://localhost:3000" ;;
    2) environment="render"; app_url=$(get_input "Enter your Render URL" "https://liftplannerpro.onrender.com") ;;
    3) environment="vercel"; app_url=$(get_input "Enter your Vercel URL" "https://liftplannerpro.vercel.app") ;;
    4) environment="custom"; app_url=$(get_input "Enter your custom domain" "https://liftplannerpro.co.uk") ;;
    *) environment="local"; app_url="http://localhost:3000" ;;
esac

echo ""
echo -e "${GREEN}STEP 2: Database Configuration${NC}"
echo "-------------------------------"
echo "1) PostgreSQL (Production)"
echo "2) SQLite (Development only)"
db_choice=$(get_input "Select database type (1-2)" "1")

if [ "$db_choice" = "1" ]; then
    db_host=$(get_input "Database host" "localhost")
    db_port=$(get_input "Database port" "5432")
    db_name=$(get_input "Database name" "liftplannerpro")
    db_user=$(get_input "Database username" "postgres")
    db_password=$(get_input "Database password" "" "true")
    
    database_url="postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}?schema=public"
else
    database_url="file:./dev.db"
fi

echo ""
echo -e "${GREEN}STEP 3: Authentication Setup${NC}"
echo "-----------------------------"
nextauth_secret=$(get_input "NextAuth Secret (leave blank to generate)" "")
if [ -z "$nextauth_secret" ]; then
    nextauth_secret=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
    echo -e "${YELLOW}Generated secret: $nextauth_secret${NC}"
fi

echo ""
echo -e "${GREEN}STEP 4: Stripe Payment Configuration${NC}"
echo "-------------------------------------"
stripe_secret_key=$(get_input "Stripe Secret Key (sk_...)" "" "true")
stripe_publishable_key=$(get_input "Stripe Publishable Key (pk_...)" "")
stripe_webhook_secret=$(get_input "Stripe Webhook Secret (whsec_...)" "" "true")
stripe_price_id=$(get_input "Stripe Price ID for £19/month plan" "price_1RrBNCFzzHwoqssW6DtAPF2N")

echo ""
echo -e "${GREEN}STEP 5: Optional Services${NC}"
echo "-------------------------"
openai_key=$(get_input "OpenAI API Key (optional, for AI features)" "" "true")

echo ""
echo -e "${GREEN}STEP 6: Admin Configuration${NC}"
echo "---------------------------"
admin_email=$(get_input "Primary Admin Email" "mickyblenk@gmail.com")

# Generate .env files
echo ""
echo -e "${YELLOW}Generating configuration files...${NC}"

cat > .env.production << EOF
# Lift Planner Pro - Production Environment Configuration
# Generated on $(date)

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=$app_url
NEXTAUTH_URL=$app_url

# Database
DATABASE_URL="$database_url"

# Authentication
NEXTAUTH_SECRET=$nextauth_secret

# Stripe Payments
STRIPE_SECRET_KEY=$stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripe_publishable_key
STRIPE_WEBHOOK_SECRET=$stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=$stripe_price_id

# AI Features (Optional)
OPENAI_API_KEY=$openai_key

# Admin
ADMIN_EMAIL=$admin_email
EOF

cp .env.production .env.local

echo -e "${GREEN}Created .env.production and .env.local${NC}"

echo ""
echo -e "${GREEN}STEP 7: Database Setup${NC}"
echo "----------------------"
setup_db=$(get_input "Run database migrations now? (y/n)" "y")

if [ "$setup_db" = "y" ]; then
    echo -e "${YELLOW}Generating Prisma client...${NC}"
    npx prisma generate

    echo -e "${YELLOW}Pushing schema to database...${NC}"
    npx prisma db push

    echo -e "${GREEN}Database setup complete!${NC}"
fi

echo ""
echo -e "${GREEN}STEP 8: Build Application${NC}"
echo "-------------------------"
build_app=$(get_input "Build the application now? (y/n)" "y")

if [ "$build_app" = "y" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm ci

    echo -e "${YELLOW}Building application...${NC}"
    npm run build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Build successful!${NC}"
    else
        echo -e "${RED}Build failed. Please check the errors above.${NC}"
        exit 1
    fi
fi

echo ""
echo "========================================="
echo "  DEPLOYMENT CONFIGURATION COMPLETE!"
echo "========================================="
echo ""

echo -e "${YELLOW}Configuration Summary:${NC}"
echo "- Environment: $environment"
echo "- App URL: $app_url"
echo "- Database: $([ "$db_choice" = "1" ] && echo 'PostgreSQL' || echo 'SQLite')"
echo "- Admin Email: $admin_email"
echo ""

case $environment in
    render)
        echo -e "${CYAN}RENDER DEPLOYMENT INSTRUCTIONS:${NC}"
        echo "1. Push your code to GitHub"
        echo "2. Go to https://dashboard.render.com"
        echo "3. Create a new Web Service from your repo"
        echo "4. Set environment variables from .env.production"
        echo "5. Build Command: npm ci && npx prisma generate && npm run build"
        echo "6. Start Command: npm start"
        ;;
    vercel)
        echo -e "${CYAN}VERCEL DEPLOYMENT INSTRUCTIONS:${NC}"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Run: vercel --prod"
        echo "3. Add environment variables in Vercel dashboard"
        ;;
    *)
        echo -e "${CYAN}LOCAL DEVELOPMENT:${NC}"
        echo "Run: npm run dev"
        ;;
esac

echo ""
echo -e "${YELLOW}STRIPE WEBHOOK SETUP:${NC}"
echo "1. Go to Stripe Dashboard > Developers > Webhooks"
echo "2. Add endpoint: $app_url/api/webhooks/stripe"
echo "3. Select events: checkout.session.completed, customer.subscription.*"
echo ""

echo -e "${RED}IMPORTANT NOTES:${NC}"
echo "- Your admin email ($admin_email) has full access without payment"
echo "- All new users get a 7-day free trial"
echo "- Subscription price is £19/month"
echo ""

start_now=$(get_input "Start the application now? (y/n)" "n")

if [ "$start_now" = "y" ]; then
    if [ "$environment" = "local" ]; then
        echo -e "${GREEN}Starting development server...${NC}"
        npm run dev
    else
        echo -e "${GREEN}Starting production server...${NC}"
        npm start
    fi
fi

echo ""
echo -e "${GREEN}Deployment script completed!${NC}"


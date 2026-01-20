# Lift Planner Pro - Production Deployment Script
# This script sets up everything needed for production deployment

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  LIFT PLANNER PRO - DEPLOYMENT SETUP" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin for some operations
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# Function to prompt for input with default value
function Get-Input {
    param(
        [string]$Prompt,
        [string]$Default = "",
        [switch]$IsSecret
    )
    
    if ($Default) {
        $promptText = "$Prompt [$Default]: "
    } else {
        $promptText = "${Prompt}: "
    }
    
    if ($IsSecret) {
        $secureInput = Read-Host -Prompt $promptText -AsSecureString
        $input = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureInput))
    } else {
        $input = Read-Host -Prompt $promptText
    }
    
    if ([string]::IsNullOrWhiteSpace($input) -and $Default) {
        return $Default
    }
    return $input
}

Write-Host "This script will help you configure Lift Planner Pro for production." -ForegroundColor Yellow
Write-Host ""

# Step 1: Environment Selection
Write-Host "STEP 1: Environment Configuration" -ForegroundColor Green
Write-Host "---------------------------------"
$envChoice = Get-Input -Prompt "Select environment (1=Local, 2=Render, 3=Vercel, 4=Custom)" -Default "1"

switch ($envChoice) {
    "1" { $environment = "local"; $appUrl = "http://localhost:3000" }
    "2" { $environment = "render"; $appUrl = Get-Input -Prompt "Enter your Render URL" -Default "https://liftplannerpro.onrender.com" }
    "3" { $environment = "vercel"; $appUrl = Get-Input -Prompt "Enter your Vercel URL" -Default "https://liftplannerpro.vercel.app" }
    "4" { $environment = "custom"; $appUrl = Get-Input -Prompt "Enter your custom domain" -Default "https://liftplannerpro.co.uk" }
    default { $environment = "local"; $appUrl = "http://localhost:3000" }
}

Write-Host ""
Write-Host "STEP 2: Database Configuration" -ForegroundColor Green
Write-Host "-------------------------------"

$dbChoice = Get-Input -Prompt "Database type (1=PostgreSQL, 2=SQLite for dev)" -Default "1"

if ($dbChoice -eq "1") {
    $dbHost = Get-Input -Prompt "Database host" -Default "localhost"
    $dbPort = Get-Input -Prompt "Database port" -Default "5432"
    $dbName = Get-Input -Prompt "Database name" -Default "liftplannerpro"
    $dbUser = Get-Input -Prompt "Database username" -Default "postgres"
    $dbPassword = Get-Input -Prompt "Database password" -IsSecret
    
    $databaseUrl = "postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public"
} else {
    $databaseUrl = "file:./dev.db"
}

Write-Host ""
Write-Host "STEP 3: Authentication Setup" -ForegroundColor Green
Write-Host "-----------------------------"

$nextAuthSecret = Get-Input -Prompt "NextAuth Secret (leave blank to generate)" -Default ""
if ([string]::IsNullOrWhiteSpace($nextAuthSecret)) {
    $nextAuthSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Generated secret: $nextAuthSecret" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "STEP 4: Stripe Payment Configuration" -ForegroundColor Green
Write-Host "-------------------------------------"

$stripeSecretKey = Get-Input -Prompt "Stripe Secret Key (sk_...)" -IsSecret
$stripePublishableKey = Get-Input -Prompt "Stripe Publishable Key (pk_...)"
$stripeWebhookSecret = Get-Input -Prompt "Stripe Webhook Secret (whsec_...)" -IsSecret
$stripePriceId = Get-Input -Prompt "Stripe Price ID for L19/month plan" -Default "price_1RrBNCFzzHwoqssW6DtAPF2N"

Write-Host ""
Write-Host "STEP 5: Optional Services" -ForegroundColor Green
Write-Host "-------------------------"

$openaiKey = Get-Input -Prompt "OpenAI API Key (optional, for AI features)" -IsSecret

Write-Host ""
Write-Host "STEP 6: Admin Configuration" -ForegroundColor Green
Write-Host "---------------------------"

$adminEmail = Get-Input -Prompt "Primary Admin Email" -Default "mickyblenk@gmail.com"

# Generate .env.local file
Write-Host ""
Write-Host "Generating configuration files..." -ForegroundColor Yellow

$envContent = @"
# Lift Planner Pro - Production Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=$appUrl
NEXTAUTH_URL=$appUrl

# Database
DATABASE_URL="$databaseUrl"

# Authentication
NEXTAUTH_SECRET=$nextAuthSecret

# Stripe Payments
STRIPE_SECRET_KEY=$stripeSecretKey
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey
STRIPE_WEBHOOK_SECRET=$stripeWebhookSecret
NEXT_PUBLIC_STRIPE_PRICE_ID=$stripePriceId

# AI Features (Optional)
OPENAI_API_KEY=$openaiKey

# Admin
ADMIN_EMAIL=$adminEmail
"@

# Save to .env.production
$envContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "Created .env.production" -ForegroundColor Green

# Also create .env.local for local testing
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "Created .env.local" -ForegroundColor Green

Write-Host ""
Write-Host "STEP 7: Database Setup" -ForegroundColor Green
Write-Host "----------------------"

$setupDb = Get-Input -Prompt "Run database migrations now? (y/n)" -Default "y"

if ($setupDb -eq "y") {
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    npx prisma generate

    Write-Host "Pushing schema to database..." -ForegroundColor Yellow
    npx prisma db push

    Write-Host "Database setup complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "STEP 8: Build Application" -ForegroundColor Green
Write-Host "-------------------------"

$buildApp = Get-Input -Prompt "Build the application now? (y/n)" -Default "y"

if ($buildApp -eq "y") {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm ci

    Write-Host "Building application..." -ForegroundColor Yellow
    npm run build

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build successful!" -ForegroundColor Green
    } else {
        Write-Host "Build failed. Please check the errors above." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT CONFIGURATION COMPLETE!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuration Summary:" -ForegroundColor Yellow
Write-Host "- Environment: $environment"
Write-Host "- App URL: $appUrl"
Write-Host "- Database: $(if($dbChoice -eq '1'){'PostgreSQL'}else{'SQLite'})"
Write-Host "- Admin Email: $adminEmail"
Write-Host ""

if ($environment -eq "render") {
    Write-Host "RENDER DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Push your code to GitHub"
    Write-Host "2. Go to https://dashboard.render.com"
    Write-Host "3. Create a new Web Service from your repo"
    Write-Host "4. Set the following environment variables in Render:"
    Write-Host "   - Copy all values from .env.production"
    Write-Host "5. Set Build Command: npm ci && npx prisma generate && npm run build"
    Write-Host "6. Set Start Command: npm start"
    Write-Host ""
} elseif ($environment -eq "vercel") {
    Write-Host "VERCEL DEPLOYMENT INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Install Vercel CLI: npm i -g vercel"
    Write-Host "2. Run: vercel --prod"
    Write-Host "3. Add environment variables in Vercel dashboard"
    Write-Host ""
} else {
    Write-Host "LOCAL DEVELOPMENT:" -ForegroundColor Cyan
    Write-Host "Run: npm run dev"
    Write-Host ""
}

Write-Host "STRIPE WEBHOOK SETUP:" -ForegroundColor Yellow
Write-Host "1. Go to Stripe Dashboard > Developers > Webhooks"
Write-Host "2. Add endpoint: $appUrl/api/webhooks/stripe"
Write-Host "3. Select events: checkout.session.completed, customer.subscription.*"
Write-Host "4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET"
Write-Host ""

Write-Host "IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "- Your admin email ($adminEmail) has full access without payment"
Write-Host "- All new users get a 7-day free trial"
Write-Host "- Subscription price is L19/month"
Write-Host ""

$startNow = Get-Input -Prompt "Start the application now? (y/n)" -Default "n"

if ($startNow -eq "y") {
    if ($environment -eq "local") {
        Write-Host "Starting development server..." -ForegroundColor Green
        npm run dev
    } else {
        Write-Host "Starting production server..." -ForegroundColor Green
        npm start
    }
}

Write-Host ""
Write-Host "Deployment script completed!" -ForegroundColor Green


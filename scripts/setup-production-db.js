const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Production Database...\n');

// Check if PostgreSQL is installed
function checkPostgreSQL() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL not found. Please install PostgreSQL first.');
    console.log('Download from: https://www.postgresql.org/download/windows/');
    console.log('Or use chocolatey: choco install postgresql');
    return false;
  }
}

// Create production database
function createProductionDatabase() {
  try {
    console.log('📊 Creating production database...');
    
    // Create database (you'll need to run this manually with postgres user)
    const createDbScript = `
-- Run these commands in PostgreSQL as postgres user:
-- createdb liftplanner_production
-- psql -d liftplanner_production -c "CREATE USER liftplanner WITH PASSWORD 'secure_production_password_2024';"
-- psql -d liftplanner_production -c "GRANT ALL PRIVILEGES ON DATABASE liftplanner_production TO liftplanner;"
-- psql -d liftplanner_production -c "GRANT ALL ON SCHEMA public TO liftplanner;"
`;

    fs.writeFileSync('setup-db-commands.sql', createDbScript);
    console.log('✅ Database setup commands written to setup-db-commands.sql');
    console.log('📝 Please run these commands manually in PostgreSQL');
    
  } catch (error) {
    console.error('❌ Error creating database setup:', error.message);
  }
}

// Update Prisma schema for production
function updatePrismaSchema() {
  console.log('🔧 Updating Prisma schema for production...');
  
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Update datasource for PostgreSQL
  const newDatasource = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;

  // Replace the existing generator and datasource
  schema = schema.replace(
    /generator client \{[\s\S]*?\}\s*datasource db \{[\s\S]*?\}/,
    newDatasource.trim()
  );
  
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Prisma schema updated for PostgreSQL');
}

// Create production environment file
function createProductionEnv() {
  console.log('⚙️ Creating production environment configuration...');
  
  const productionEnv = `# Production Environment Configuration
# Database Configuration
DATABASE_URL="postgresql://liftplanner:secure_production_password_2024@localhost:5432/liftplanner_production"

# NextAuth Configuration
NEXTAUTH_URL=http://your-domain.ddns.net:3000
NEXTAUTH_SECRET=your-super-secure-production-secret-key-change-this-immediately

# Stripe Configuration (Add your keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# File Storage Configuration
UPLOAD_DIR=./storage/uploads
CAD_FILES_DIR=./storage/cad-files
EXPORTS_DIR=./storage/exports
MAX_FILE_SIZE=50MB

# Security Configuration
ALLOWED_ORIGINS=http://your-domain.ddns.net:3000,http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Performance Configuration
NODE_ENV=production
PORT=3000
`;

  fs.writeFileSync('.env.production', productionEnv);
  console.log('✅ Production environment file created: .env.production');
  console.log('⚠️  IMPORTANT: Update your-domain.ddns.net with your actual NoIP domain!');
}

// Main setup function
async function setupProduction() {
  console.log('🏗️  Lift Planner Pro - Production Database Setup');
  console.log('=' .repeat(50));
  
  if (!checkPostgreSQL()) {
    return;
  }
  
  createProductionDatabase();
  updatePrismaSchema();
  createProductionEnv();
  
  console.log('\n🎉 Production database setup completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Install PostgreSQL if not already installed');
  console.log('2. Run the SQL commands in setup-db-commands.sql');
  console.log('3. Update .env.production with your NoIP domain');
  console.log('4. Run: npm run db:migrate:prod');
  console.log('5. Run: npm run build:prod');
}

setupProduction().catch(console.error);

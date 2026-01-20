const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🐘 Setting up PostgreSQL for Lift Planner Pro...\n')

// Database configuration
const DB_CONFIG = {
  username: 'postgres',
  password: 'syntex82',
  host: 'localhost',
  port: '5432',
  devDatabase: 'liftplannerpro_dev',
  prodDatabase: 'liftplannerpro_prod'
}

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`)
    console.log(`   Command: ${command}`)
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        reject(error)
        return
      }
      
      if (stderr && !stderr.includes('already exists')) {
        console.log(`   ⚠️ Warning: ${stderr}`)
      }
      
      if (stdout) {
        console.log(`   ✅ Output: ${stdout.trim()}`)
      } else {
        console.log(`   ✅ ${description} completed`)
      }
      
      resolve(stdout)
    })
  })
}

async function setupPostgreSQL() {
  try {
    console.log('📋 PostgreSQL Setup Configuration:')
    console.log(`   Username: ${DB_CONFIG.username}`)
    console.log(`   Password: ${DB_CONFIG.password}`)
    console.log(`   Host: ${DB_CONFIG.host}`)
    console.log(`   Port: ${DB_CONFIG.port}`)
    console.log(`   Dev Database: ${DB_CONFIG.devDatabase}`)
    console.log(`   Prod Database: ${DB_CONFIG.prodDatabase}`)
    console.log('')

    // Check if PostgreSQL is running
    console.log('🔍 Checking PostgreSQL service...')
    try {
      await runCommand('pg_isready -h localhost -p 5432', 'Check PostgreSQL service')
    } catch (error) {
      console.log('❌ PostgreSQL service not running or not accessible')
      console.log('   Please ensure PostgreSQL is installed and running')
      console.log('   Windows: Check Services or run "net start postgresql-x64-14"')
      console.log('   macOS: brew services start postgresql')
      console.log('   Linux: sudo systemctl start postgresql')
      return
    }

    // Create development database
    console.log('\n📊 Creating databases...')
    const createDevDB = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -c "CREATE DATABASE ${DB_CONFIG.devDatabase};"`
    const createProdDB = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -c "CREATE DATABASE ${DB_CONFIG.prodDatabase};"`
    
    // Set PGPASSWORD environment variable for authentication
    process.env.PGPASSWORD = DB_CONFIG.password
    
    try {
      await runCommand(createDevDB, `Create development database: ${DB_CONFIG.devDatabase}`)
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ✅ Development database already exists`)
      } else {
        console.log(`   ⚠️ Could not create development database: ${error.message}`)
      }
    }

    try {
      await runCommand(createProdDB, `Create production database: ${DB_CONFIG.prodDatabase}`)
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ✅ Production database already exists`)
      } else {
        console.log(`   ⚠️ Could not create production database: ${error.message}`)
      }
    }

    // Test database connections
    console.log('\n🔗 Testing database connections...')
    const testDevConnection = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.devDatabase} -c "SELECT version();"`
    const testProdConnection = `psql -h ${DB_CONFIG.host} -p ${DB_CONFIG.port} -U ${DB_CONFIG.username} -d ${DB_CONFIG.prodDatabase} -c "SELECT version();"`
    
    try {
      await runCommand(testDevConnection, 'Test development database connection')
    } catch (error) {
      console.log(`   ❌ Development database connection failed: ${error.message}`)
    }

    try {
      await runCommand(testProdConnection, 'Test production database connection')
    } catch (error) {
      console.log(`   ❌ Production database connection failed: ${error.message}`)
    }

    console.log('\n✅ PostgreSQL setup completed!')
    console.log('')
    console.log('📋 Next Steps:')
    console.log('   1. Install PostgreSQL client (if not already installed):')
    console.log('      npm install pg @types/pg')
    console.log('')
    console.log('   2. Generate Prisma client:')
    console.log('      npx prisma generate')
    console.log('')
    console.log('   3. Run database migrations:')
    console.log('      npx prisma db push')
    console.log('')
    console.log('   4. (Optional) View database in Prisma Studio:')
    console.log('      npx prisma studio')
    console.log('')
    console.log('🔗 Database URLs configured:')
    console.log(`   Development: postgresql://${DB_CONFIG.username}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.devDatabase}`)
    console.log(`   Production: postgresql://${DB_CONFIG.username}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.prodDatabase}`)

  } catch (error) {
    console.error('❌ PostgreSQL setup failed:', error.message)
    console.log('')
    console.log('🔧 Troubleshooting:')
    console.log('   1. Ensure PostgreSQL is installed and running')
    console.log('   2. Verify the password "syntex82" is correct for postgres user')
    console.log('   3. Check if PostgreSQL is listening on port 5432')
    console.log('   4. Ensure postgres user has database creation privileges')
    console.log('')
    console.log('📋 Manual setup commands:')
    console.log('   psql -U postgres')
    console.log('   CREATE DATABASE liftplannerpro_dev;')
    console.log('   CREATE DATABASE liftplannerpro_prod;')
    console.log('   \\q')
  }
}

// Check environment files
function checkEnvironmentFiles() {
  console.log('📁 Checking environment files...')
  
  const envLocal = path.join(process.cwd(), '.env.local')
  const envProd = path.join(process.cwd(), '.env.production')
  
  if (fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, 'utf8')
    if (content.includes('postgresql://postgres:syntex82@localhost:5432/liftplannerpro_dev')) {
      console.log('   ✅ .env.local configured correctly')
    } else {
      console.log('   ⚠️ .env.local may need updating')
    }
  } else {
    console.log('   ❌ .env.local not found')
  }
  
  if (fs.existsSync(envProd)) {
    const content = fs.readFileSync(envProd, 'utf8')
    if (content.includes('postgresql://postgres:syntex82@localhost:5432/liftplannerpro_prod')) {
      console.log('   ✅ .env.production configured correctly')
    } else {
      console.log('   ⚠️ .env.production may need updating')
    }
  } else {
    console.log('   ❌ .env.production not found')
  }
}

// Check Prisma schema
function checkPrismaSchema() {
  console.log('\n📄 Checking Prisma schema...')
  
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf8')
    if (content.includes('provider = "postgresql"')) {
      console.log('   ✅ Prisma schema configured for PostgreSQL')
    } else {
      console.log('   ⚠️ Prisma schema may still be configured for SQLite')
    }
  } else {
    console.log('   ❌ Prisma schema not found')
  }
}

async function main() {
  console.log('🎯 PostgreSQL Database Setup for Lift Planner Pro\n')
  
  checkEnvironmentFiles()
  checkPrismaSchema()
  
  console.log('')
  await setupPostgreSQL()
}

main().catch(console.error)

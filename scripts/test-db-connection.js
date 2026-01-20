const { PrismaClient } = require('@prisma/client')

console.log('🧪 Testing PostgreSQL Database Connection...\n')

async function testDatabaseConnection() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing database connection...')
    console.log('📋 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@') || 'Not set')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test query
    console.log('🔍 Testing database query...')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 PostgreSQL version:', result[0].version)
    
    // Test if we can access tables (this will fail if schema not pushed)
    try {
      console.log('🔍 Testing table access...')
      const userCount = await prisma.user.count()
      console.log('👥 User table accessible, count:', userCount)
    } catch (tableError) {
      console.log('⚠️ Tables not found - need to run: npx prisma db push')
      console.log('   Error:', tableError.message.split('\n')[0])
    }
    
    console.log('\n✅ Database connection test completed successfully!')
    console.log('🎯 Your PostgreSQL database is ready for Lift Planner Pro!')
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting ECONNREFUSED:')
      console.log('   1. Ensure PostgreSQL is running')
      console.log('   2. Check Windows Services for "postgresql-x64-XX"')
      console.log('   3. Verify PostgreSQL is listening on port 5432')
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Troubleshooting Authentication:')
      console.log('   1. Verify password is exactly: syntex82')
      console.log('   2. Check PostgreSQL user "postgres" exists')
      console.log('   3. Verify pg_hba.conf allows md5 authentication')
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n🔧 Troubleshooting Database Missing:')
      console.log('   1. Connect to PostgreSQL: psql -U postgres')
      console.log('   2. Create database: CREATE DATABASE liftplannerpro_dev;')
      console.log('   3. Exit: \\q')
    } else {
      console.log('\n🔧 General troubleshooting:')
      console.log('   1. Check DATABASE_URL in .env.local')
      console.log('   2. Ensure PostgreSQL is installed and running')
      console.log('   3. Verify network connectivity to localhost:5432')
    }
    
  } finally {
    await prisma.$disconnect()
  }
}

async function checkEnvironmentConfig() {
  console.log('📋 Environment Configuration Check:')
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development')
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL
    if (url.includes('postgresql://')) {
      console.log('   ✅ PostgreSQL URL detected')
      const parts = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
      if (parts) {
        console.log('   📊 Connection details:')
        console.log('      User:', parts[1])
        console.log('      Password:', '****')
        console.log('      Host:', parts[3])
        console.log('      Port:', parts[4])
        console.log('      Database:', parts[5])
      }
    } else {
      console.log('   ⚠️ Not a PostgreSQL URL')
    }
  } else {
    console.log('   ❌ DATABASE_URL not configured')
  }
  console.log('')
}

async function main() {
  console.log('🎯 PostgreSQL Connection Test for Lift Planner Pro\n')
  
  await checkEnvironmentConfig()
  await testDatabaseConnection()
  
  console.log('\n📋 Next Steps:')
  console.log('   1. If connection successful: Run "npx prisma db push"')
  console.log('   2. If tables created: Start your app with "npm run dev"')
  console.log('   3. Check admin panel at /admin for "Database Security: Connected"')
  console.log('   4. (Optional) Open Prisma Studio: "npx prisma studio"')
  console.log('')
  console.log('🔧 Available database commands:')
  console.log('   npm run db:migrate    - Push schema to database')
  console.log('   npm run db:generate   - Generate Prisma client')
  console.log('   npm run db:studio     - Open database GUI')
  console.log('   npm run db:reset      - Reset database (destructive)')
}

main().catch(console.error)

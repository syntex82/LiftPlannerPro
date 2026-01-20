const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function populateAdminData() {
  console.log('🚀 Populating admin dashboard with sample data...\n')

  try {
    // Create sample users if they don't exist
    console.log('👥 Creating sample users...')
    
    const users = [
      {
        name: 'John Smith',
        email: 'john.smith@construction.com',
        role: 'USER',
        subscription: 'PRO'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@engineering.com',
        role: 'USER',
        subscription: 'BASIC'
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@rigging.com',
        role: 'USER',
        subscription: 'ENTERPRISE'
      },
      {
        name: 'Lisa Brown',
        email: 'lisa.brown@safety.com',
        role: 'USER',
        subscription: 'PRO'
      },
      {
        name: 'David Lee',
        email: 'david.lee@crane.com',
        role: 'USER',
        subscription: 'BASIC'
      }
    ]

    for (const userData of users) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('password123', 12)
        await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
            emailVerified: new Date(),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
          }
        })
        console.log(`✅ Created user: ${userData.name}`)
      } else {
        console.log(`⏭️ User already exists: ${userData.name}`)
      }
    }

    // Create sample issues
    console.log('\n🐛 Creating sample issues...')
    
    const allUsers = await prisma.user.findMany()
    const sampleIssues = [
      {
        title: 'CAD Editor Crashes When Loading Large Files',
        description: 'The CAD editor becomes unresponsive and crashes when trying to load project files larger than 50MB. Steps to reproduce: 1. Open CAD editor 2. Try to load a file > 50MB 3. Editor freezes 4. Application crashes. Expected: Large files should load smoothly with progress indicator. Actual: Application crashes without error message',
        category: 'BUG',
        priority: 'HIGH',
        status: 'OPEN',
        url: '/cad',
        browserInfo: 'Chrome 120.0.0.0 Windows 10'
      },
      {
        title: 'Load Calculator Shows Incorrect Results',
        description: 'The load calculator is showing incorrect safety factors for crane operations with multiple lifting points. Steps: 1. Open load calculator 2. Enter multiple lifting points 3. Calculate safety factors 4. Results are incorrect. Expected: Accurate safety factor calculations. Actual: Safety factors are 20% lower than expected',
        category: 'BUG',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        url: '/calculator',
        browserInfo: 'Firefox 121.0 Windows 10',
        assignedTo: 'admin@liftplannerpro.org'
      },
      {
        title: 'Add Export to Excel Feature',
        description: 'Users need the ability to export RAMS documents and project data to Excel format for reporting. Feature request for export functionality.',
        category: 'FEATURE_REQUEST',
        priority: 'MEDIUM',
        status: 'OPEN',
        url: '/rams',
        browserInfo: 'Chrome 120.0.0.0 Windows 10'
      },
      {
        title: 'Mobile App Version Needed',
        description: 'Request for a mobile app version to access basic features on construction sites. Users need mobile access for field work.',
        category: 'FEATURE_REQUEST',
        priority: 'LOW',
        status: 'OPEN',
        url: '/',
        browserInfo: 'Safari 17.0 iOS 17'
      },
      {
        title: 'Slow Performance on Dashboard',
        description: 'The dashboard takes too long to load when user has many projects. Steps: 1. Login with account having 50+ projects 2. Navigate to dashboard 3. Page takes 10+ seconds to load. Expected: Dashboard loads within 2-3 seconds. Actual: Dashboard takes 10+ seconds to load',
        category: 'PERFORMANCE',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        url: '/dashboard',
        browserInfo: 'Chrome 119.0.0.0 Windows 11',
        assignedTo: 'admin@liftplannerpro.org',
        resolution: 'Implemented pagination and lazy loading. Performance improved by 80%.',
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        title: 'User Interface Improvements',
        description: 'Suggestions for improving the user interface based on user feedback. Enhancement request for better UX.',
        category: 'ENHANCEMENT',
        priority: 'LOW',
        status: 'OPEN',
        url: '/',
        browserInfo: 'Edge 120.0.0.0 Windows 10'
      }
    ]

    for (let i = 0; i < sampleIssues.length; i++) {
      const issueData = sampleIssues[i]
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]
      
      // Check if issue already exists
      const existingIssue = await prisma.issueReport.findFirst({
        where: { title: issueData.title }
      })

      if (!existingIssue) {
        await prisma.issueReport.create({
          data: {
            ...issueData,
            userId: randomUser.id,
            createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Random date within last 14 days
          }
        })
        console.log(`✅ Created issue: ${issueData.title}`)
      } else {
        console.log(`⏭️ Issue already exists: ${issueData.title}`)
      }
    }

    // Create some sample projects for users
    console.log('\n📁 Creating sample projects...')
    
    const sampleProjects = [
      'Office Building Crane Installation',
      'Bridge Construction Lift Plan',
      'Industrial Equipment Relocation',
      'Wind Turbine Assembly Project',
      'Stadium Roof Installation'
    ]

    for (let i = 0; i < Math.min(sampleProjects.length, allUsers.length); i++) {
      const user = allUsers[i]
      const projectName = sampleProjects[i]
      
      const existingProject = await prisma.project.findFirst({
        where: { 
          name: projectName,
          userId: user.id 
        }
      })

      if (!existingProject) {
        await prisma.project.create({
          data: {
            name: projectName,
            description: `Sample project: ${projectName}`,
            userId: user.id,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        })
        console.log(`✅ Created project: ${projectName} for ${user.name}`)
      } else {
        console.log(`⏭️ Project already exists: ${projectName}`)
      }
    }

    // Create some sample security logs
    console.log('\n🔒 Creating sample security logs...')

    const sampleSecurityLogs = [
      {
        action: 'LOGIN_SUCCESS',
        resource: 'authentication',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        riskLevel: 'LOW',
        details: { loginMethod: 'credentials' }
      },
      {
        action: 'LOGIN_FAILED',
        resource: 'authentication',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: false,
        riskLevel: 'MEDIUM',
        details: { reason: 'invalid_credentials', attempts: 3 }
      },
      {
        action: 'DATA_ACCESS',
        resource: 'admin_panel',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true,
        riskLevel: 'LOW',
        details: { section: 'user_management' }
      },
      {
        action: 'PROJECT_CREATE',
        resource: 'projects',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: true,
        riskLevel: 'LOW',
        details: { projectType: 'cad_project' }
      },
      {
        action: 'SUSPICIOUS_ACTIVITY',
        resource: 'api',
        ipAddress: '198.51.100.23',
        userAgent: 'curl/7.68.0',
        success: false,
        riskLevel: 'HIGH',
        details: { reason: 'rate_limit_exceeded', requests: 150 }
      }
    ]

    for (let i = 0; i < sampleSecurityLogs.length; i++) {
      const logData = sampleSecurityLogs[i]
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)]

      await prisma.securityLog.create({
        data: {
          ...logData,
          userId: randomUser.id,
          details: JSON.stringify(logData.details),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
        }
      })
      console.log(`✅ Created security log: ${logData.action}`)
    }

    console.log('\n🎉 Admin dashboard data population complete!')
    console.log('\n📊 Summary:')

    const userCount = await prisma.user.count()
    const issueCount = await prisma.issueReport.count()
    const projectCount = await prisma.project.count()
    const securityLogCount = await prisma.securityLog.count()

    console.log(`👥 Total Users: ${userCount}`)
    console.log(`🐛 Total Issues: ${issueCount}`)
    console.log(`📁 Total Projects: ${projectCount}`)
    console.log(`🔒 Total Security Logs: ${securityLogCount}`)

    console.log('\n✅ Your admin dashboard should now show data!')

  } catch (error) {
    console.error('❌ Error populating admin data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populateAdminData()

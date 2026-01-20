const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👤 Creating admin user...');
    
    const email = 'mickyblenk@gmail.com';
    const password = 'admin123';
    const name = 'Micky Blenk';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists. Updating password and role...`);
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'admin',
          subscription: 'enterprise'
        }
      });
      
      console.log(`✅ Admin user updated successfully!`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'admin',
          subscription: 'enterprise',
          emailVerified: new Date(),
        }
      });

      console.log(`✅ Admin user created successfully!`);
    }
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👑 Role: admin`);
    console.log(`💎 Subscription: enterprise`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();

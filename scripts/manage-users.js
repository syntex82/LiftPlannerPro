const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function listUsers() {
  console.log('📋 Current users in database:');
  console.log('─'.repeat(50));
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true,
      }
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role} | Subscription: ${user.subscription}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error listing users:', error.message);
  }
}

async function resetPassword(email, newPassword) {
  console.log(`🔑 Resetting password for: ${email}`);
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`✅ Password updated successfully for ${email}`);
    console.log(`🔐 New password: ${newPassword}`);
  } catch (error) {
    console.error('Error resetting password:', error.message);
  }
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  try {
    const email = 'test@liftplanner.com';
    const password = 'test123';
    const name = 'Test User';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists. Updating password...`);
      await resetPassword(email, password);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        subscription: 'pro'
      }
    });

    console.log(`✅ Test user created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
  } catch (error) {
    console.error('Error creating test user:', error.message);
  }
}

async function deleteUser(email) {
  console.log(`🗑️  Deleting user: ${email}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      return;
    }

    await prisma.user.delete({
      where: { email }
    });

    console.log(`✅ User ${email} deleted successfully.`);
  } catch (error) {
    console.error('Error deleting user:', error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      await listUsers();
      break;
    
    case 'reset':
      const email = args[1];
      const password = args[2];
      if (!email || !password) {
        console.log('Usage: node scripts/manage-users.js reset <email> <new-password>');
        return;
      }
      await resetPassword(email, password);
      break;
    
    case 'create-test':
      await createTestUser();
      break;
    
    case 'delete':
      const emailToDelete = args[1];
      if (!emailToDelete) {
        console.log('Usage: node scripts/manage-users.js delete <email>');
        return;
      }
      await deleteUser(emailToDelete);
      break;
    
    default:
      console.log('🔧 User Management Tool');
      console.log('─'.repeat(30));
      console.log('Available commands:');
      console.log('  list                           - List all users');
      console.log('  reset <email> <password>       - Reset user password');
      console.log('  create-test                    - Create test user');
      console.log('  delete <email>                 - Delete user');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/manage-users.js list');
      console.log('  node scripts/manage-users.js reset user@example.com newpass123');
      console.log('  node scripts/manage-users.js create-test');
      break;
  }

  await prisma.$disconnect();
}

main().catch(console.error);

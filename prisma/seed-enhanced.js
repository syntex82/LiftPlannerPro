const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedEnhancedFeatures() {
  try {
    console.log('🌱 Seeding enhanced features...');

    // Get the existing user
    const user = await prisma.user.findUnique({
      where: { email: 'mickyblenk@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found. Please run the main seed first.');
      return;
    }

    console.log('👤 Found user:', user.name);

    // Create default expense categories
    const expenseCategories = [
      { name: 'Travel', description: 'Transportation costs', color: '#3b82f6', icon: '✈️' },
      { name: 'Accommodation', description: 'Hotel and lodging expenses', color: '#10b981', icon: '🏨' },
      { name: 'Meals', description: 'Food and dining expenses', color: '#f59e0b', icon: '🍽️' },
      { name: 'Equipment', description: 'Tools and equipment purchases', color: '#8b5cf6', icon: '🔧' },
      { name: 'Training', description: 'Education and certification costs', color: '#ef4444', icon: '📚' },
      { name: 'Fuel', description: 'Vehicle fuel costs', color: '#06b6d4', icon: '⛽' },
      { name: 'Materials', description: 'Project materials and supplies', color: '#84cc16', icon: '📦' },
      { name: 'Other', description: 'Miscellaneous expenses', color: '#6b7280', icon: '💼' }
    ];

    for (const category of expenseCategories) {
      await prisma.expenseCategory.upsert({
        where: { 
          name_userId: { 
            name: category.name, 
            userId: user.id 
          } 
        },
        update: {},
        create: {
          ...category,
          userId: user.id,
          isDefault: true
        }
      });
    }

    console.log('✅ Created expense categories');

    // Create sample expenses
    const travelCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Travel', userId: user.id }
    });

    const accommodationCategory = await prisma.expenseCategory.findFirst({
      where: { name: 'Accommodation', userId: user.id }
    });

    const sampleExpenses = [
      {
        title: 'Flight to London',
        description: 'Business trip for crane installation project',
        amount: 450.00,
        categoryId: travelCategory.id,
        expenseDate: new Date('2024-01-15'),
        paymentMethod: 'CREDIT_CARD',
        vendor: 'British Airways',
        location: 'London, UK',
        tags: ['business', 'international'],
        status: 'APPROVED',
        isReimbursable: true,
        userId: user.id
      },
      {
        title: 'Hotel Stay - Premier Inn',
        description: '3 nights accommodation in London',
        amount: 285.00,
        categoryId: accommodationCategory.id,
        expenseDate: new Date('2024-01-16'),
        paymentMethod: 'COMPANY_CARD',
        vendor: 'Premier Inn',
        location: 'London, UK',
        tags: ['accommodation', 'business'],
        status: 'REIMBURSED',
        isReimbursable: true,
        reimbursedAt: new Date('2024-01-25'),
        reimbursedBy: 'Finance Department',
        userId: user.id
      }
    ];

    for (const expense of sampleExpenses) {
      await prisma.expense.create({ data: expense });
    }

    console.log('✅ Created sample expenses');

    // Create loft locations
    const loftLocations = [
      { name: 'Main Warehouse', description: 'Primary storage area', building: 'Building A', floor: 'Ground', section: 'North', capacity: 100 },
      { name: 'Secure Storage', description: 'High-value equipment storage', building: 'Building A', floor: 'Ground', section: 'South', capacity: 50 },
      { name: 'Workshop Area', description: 'Maintenance and repair area', building: 'Building B', floor: 'Ground', section: 'East', capacity: 25 },
      { name: 'Inspection Bay', description: 'Equipment testing and inspection', building: 'Building B', floor: 'Ground', section: 'West', capacity: 15 },
      { name: 'Outdoor Yard', description: 'Large equipment storage', building: 'Yard', floor: 'Ground', section: 'Central', capacity: 200 }
    ];

    for (const location of loftLocations) {
      await prisma.loftLocation.upsert({
        where: { 
          name_userId: { 
            name: location.name, 
            userId: user.id 
          } 
        },
        update: {},
        create: {
          ...location,
          userId: user.id
        }
      });
    }

    console.log('✅ Created loft locations');

    // Create sample lodging booking
    const sampleLodging = {
      bookingReference: 'LPP-2024-001',
      hotelName: 'Premier Inn London City',
      hotelAddress: '123 Business District, London, EC1A 1BB',
      hotelPhone: '+44 20 7123 4567',
      hotelEmail: 'reservations@premierinn.com',
      roomType: 'Standard Double',
      roomNumber: '205',
      checkInDate: new Date('2024-01-16'),
      checkOutDate: new Date('2024-01-19'),
      numberOfNights: 3,
      numberOfGuests: 1,
      guestNames: ['Michael Blenkinsop'],
      totalCost: 285.00,
      currency: 'GBP',
      bookingStatus: 'CHECKED_OUT',
      paymentStatus: 'PAID',
      paymentMethod: 'COMPANY_CARD',
      confirmationNumber: 'PI123456789',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
      specialRequests: 'Ground floor room preferred',
      notes: 'Business trip for crane installation project',
      userId: user.id
    };

    await prisma.lodgingBooking.create({ data: sampleLodging });

    console.log('✅ Created sample lodging booking');

    console.log('🎉 Enhanced features seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding enhanced features:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedEnhancedFeatures();

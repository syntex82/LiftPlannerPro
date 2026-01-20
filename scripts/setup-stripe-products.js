const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
  try {
    console.log('🚀 Setting up Stripe products...\n');

    // Create Basic Plan
    console.log('Creating Basic Plan...');
    const basicProduct = await stripe.products.create({
      name: 'Lift Planner Pro - Basic',
      description: 'Perfect for individual professionals and small projects',
    });

    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log(`✅ Basic Plan created: ${basicPrice.id}`);

    // Create Pro Plan
    console.log('Creating Pro Plan...');
    const proProduct = await stripe.products.create({
      name: 'Lift Planner Pro - Pro',
      description: 'Ideal for teams and complex lifting operations',
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log(`✅ Pro Plan created: ${proPrice.id}`);

    // Create Enterprise Plan
    console.log('Creating Enterprise Plan...');
    const enterpriseProduct = await stripe.products.create({
      name: 'Lift Planner Pro - Enterprise',
      description: 'Tailored solutions for large organizations',
    });

    const enterprisePrice = await stripe.prices.create({
      product: enterpriseProduct.id,
      unit_amount: 19900, // $199.00 (placeholder)
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log(`✅ Enterprise Plan created: ${enterprisePrice.id}`);

    console.log('\n🎉 All products created successfully!\n');
    console.log('📝 Update your components/pricing.tsx file with these Price IDs:');
    console.log('─'.repeat(60));
    console.log(`Basic Plan Price ID:      ${basicPrice.id}`);
    console.log(`Pro Plan Price ID:        ${proPrice.id}`);
    console.log(`Enterprise Plan Price ID: ${enterprisePrice.id}`);
    console.log('─'.repeat(60));
    console.log('\n💡 Copy these IDs and replace the placeholder values in components/pricing.tsx');

  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    
    if (error.message.includes('No such API key')) {
      console.log('\n🔑 Please make sure your Stripe secret key is correctly set in .env.local');
      console.log('   It should start with sk_live_ or sk_test_');
    }
  }
}

createStripeProducts();

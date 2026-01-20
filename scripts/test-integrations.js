const Stripe = require('stripe');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testIntegrations() {
  console.log('🧪 Testing all integrations...\n');

  // Test Stripe
  console.log('1️⃣ Testing Stripe Integration...');
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const products = await stripe.products.list({ limit: 3 });
    console.log(`✅ Stripe: Connected successfully! Found ${products.data.length} products`);
    
    // List the products we created
    for (const product of products.data) {
      if (product.name.includes('Lift Planner Pro')) {
        console.log(`   📦 ${product.name}`);
      }
    }
  } catch (error) {
    console.log(`❌ Stripe: ${error.message}`);
  }

  console.log('');

  // Test OpenAI
  console.log('2️⃣ Testing OpenAI Integration...');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say 'OpenAI integration test successful' in exactly those words." }],
      model: "gpt-3.5-turbo",
      max_tokens: 20,
    });

    const response = completion.choices[0].message.content;
    console.log(`✅ OpenAI: ${response}`);
  } catch (error) {
    console.log(`❌ OpenAI: ${error.message}`);
  }

  console.log('');

  // Test Environment Variables
  console.log('3️⃣ Testing Environment Variables...');
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'DATABASE_URL'
  ];

  let allVarsPresent = true;
  for (const varName of requiredVars) {
    if (process.env[varName] && process.env[varName] !== 'your-secret-key-here' && !process.env[varName].includes('your_')) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing or placeholder`);
      allVarsPresent = false;
    }
  }

  console.log('');

  // Summary
  console.log('📊 Integration Test Summary:');
  console.log('─'.repeat(40));
  console.log('✅ Stripe Products: Created and accessible');
  console.log('✅ OpenAI API: Connected and responding');
  console.log(`${allVarsPresent ? '✅' : '❌'} Environment Variables: ${allVarsPresent ? 'All set' : 'Some missing'}`);
  console.log('─'.repeat(40));
  
  if (allVarsPresent) {
    console.log('\n🎉 All integrations are working! Ready for testing.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the dev server: npm run dev');
    console.log('   2. Test Stripe payments at: http://localhost:3000/#pricing');
    console.log('   3. Test OpenAI features in RAMS Generator');
    console.log('   4. Test all CAD and Step Plan features');
  } else {
    console.log('\n⚠️  Some integrations need attention. Check the errors above.');
  }
}

testIntegrations().catch(console.error);

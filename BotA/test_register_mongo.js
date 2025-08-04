// Test script for MongoDB register feature
require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/database');
const botService = require('./services/botService');
const tokenValidator = require('./services/tokenValidator');

async function testRegisterFeature() {
  console.log('🧪 Testing MongoDB Register Feature...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Test 1: Bot Service
    console.log('\n1️⃣ Testing Bot Service...');
    
    // Test email validation
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';
    
    console.log('   Email validation:', {
      valid: botService.isValidEmail(validEmail),
      invalid: botService.isValidEmail(invalidEmail)
    });

    // Test bot name validation
    const validBotName = 'My Test Bot';
    const invalidBotName = 'A';
    
    console.log('   Bot name validation:', {
      valid: botService.isValidBotName(validBotName),
      invalid: botService.isValidBotName(invalidBotName)
    });

    // Test token format validation
    const validToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz';
    const invalidToken = 'invalid-token';
    
    console.log('   Token format validation:', {
      valid: botService.isValidTokenFormat(validToken),
      invalid: botService.isValidTokenFormat(invalidToken)
    });

    // Test 2: Token Validator
    console.log('\n2️⃣ Testing Token Validator...');
    
    const invalidTokenResult = await tokenValidator.validateToken(invalidToken);
    console.log('   Invalid token test:', invalidTokenResult.isValid ? '❌ FAIL' : '✅ PASS');

    // Test 3: Database Operations
    console.log('\n3️⃣ Testing Database Operations...');
    
    const stats = await botService.getBotStats();
    console.log('   Bot stats:', stats);

    // Test 4: Email Registration Check
    console.log('\n4️⃣ Testing Email Registration...');
    
    const emailExists = await botService.isEmailRegistered(validEmail);
    console.log('   Email registration check:', emailExists ? 'Already registered' : 'Available');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 To test the full feature:');
    console.log('1. Set your BOT_A_TOKEN in .env file');
    console.log('2. Set your MONGODB_URI in .env file');
    console.log('3. Run: npm install');
    console.log('4. Run: node index.js');
    console.log('5. Start your bot and click "Register New Bot"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnectDB();
    console.log('\n✅ MongoDB disconnected');
  }
}

// Run tests
testRegisterFeature().catch(console.error); 
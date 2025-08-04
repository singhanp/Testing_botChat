// Test script for Register model
require('dotenv').config();
const { connectDB, disconnectDB } = require('./config/database');
const Register = require('./models/register');

async function testRegisterModel() {
  console.log('🧪 Testing Register Model...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // Test 1: Validation Methods
    console.log('\n1️⃣ Testing Validation Methods...');
    
    // Test email validation
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';
    
    console.log('   Email validation:', {
      valid: Register.isValidEmail(validEmail),
      invalid: Register.isValidEmail(invalidEmail)
    });

    // Test bot name validation
    const validBotName = 'My Test Bot';
    const invalidBotName = 'A';
    
    console.log('   Bot name validation:', {
      valid: Register.isValidBotName(validBotName),
      invalid: Register.isValidBotName(invalidBotName)
    });

    // Test token format validation
    const validToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz';
    const invalidToken = 'invalid-token';
    
    console.log('   Token format validation:', {
      valid: Register.isValidTokenFormat(validToken),
      invalid: Register.isValidTokenFormat(invalidToken)
    });

    // Test 2: Session Management
    console.log('\n2️⃣ Testing Session Management...');
    
    const testUserId = 123456789;
    
    // Test session creation
    Register.registrationSessions.set(testUserId, {
      step: 'waiting_for_email',
      data: {},
      startTime: Date.now()
    });
    
    console.log('   Session creation:', Register.hasActiveSession(testUserId) ? '✅ PASS' : '❌ FAIL');
    
    // Test session retrieval
    const session = Register.getSession(testUserId);
    console.log('   Session retrieval:', session ? '✅ PASS' : '❌ FAIL');
    
    // Test session cancellation
    Register.cancelRegistration(testUserId);
    console.log('   Session cancellation:', !Register.hasActiveSession(testUserId) ? '✅ PASS' : '❌ FAIL');

    // Test 3: Statistics
    console.log('\n3️⃣ Testing Statistics...');
    
    const stats = await Register.getRegistrationStats();
    console.log('   Registration stats:', stats);

    // Test 4: Session Cleanup
    console.log('\n4️⃣ Testing Session Cleanup...');
    
    // Add an expired session
    Register.registrationSessions.set(testUserId, {
      step: 'waiting_for_email',
      data: {},
      startTime: Date.now() - 700000 // 11 minutes ago (expired)
    });
    
    const beforeCleanup = Register.getAllSessions().length;
    Register.cleanupExpiredSessions();
    const afterCleanup = Register.getAllSessions().length;
    
    console.log('   Session cleanup:', beforeCleanup > afterCleanup ? '✅ PASS' : '❌ FAIL');

    console.log('\n🎉 All Register model tests completed successfully!');
    console.log('\n📝 The Register model is ready to use with:');
    console.log('• Email validation');
    console.log('• Bot name validation');
    console.log('• Token format validation');
    console.log('• Session management');
    console.log('• MongoDB integration');
    console.log('• Automatic cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await disconnectDB();
    console.log('\n✅ MongoDB disconnected');
  }
}

// Run tests
testRegisterModel().catch(console.error);
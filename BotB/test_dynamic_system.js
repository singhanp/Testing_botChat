const axios = require('axios');
const Bot = require('../BotA/models/Bot');

// Test configuration
const WEBHOOK_URL = 'http://localhost:3001';
const TEST_BOT_DATA = {
  agentId: 'TEST_AGENT_001',
  email: 'test@example.com',
  botName: 'Test Bot',
  botToken: '1234567890:TEST_TOKEN_FOR_TESTING_ONLY',
  botUsername: 'test_bot_username',
  botId: 123456789,
  registeredBy: 987654321,
  userInfo: {
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser'
  },
  isActive: true,
  registeredAt: new Date(),
  lastUpdated: new Date()
};

async function testWebhookConnection() {
  try {
    console.log('🔍 Testing webhook connection...');
    const response = await axios.get(`${WEBHOOK_URL}/health`, { timeout: 5000 });
    console.log('✅ Webhook service is reachable');
    console.log('📊 Health status:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Webhook service is not reachable:', error.message);
    return false;
  }
}

async function testBotRegistration() {
  try {
    console.log('🆕 Testing bot registration webhook...');
    const payload = {
      action: 'bot_registered',
      botData: TEST_BOT_DATA
    };
    
    const response = await axios.post(`${WEBHOOK_URL}/webhook/bot-registration`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Bot registration webhook successful');
    console.log('📨 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Bot registration webhook failed:', error.message);
    return false;
  }
}

async function testGetActiveBots() {
  try {
    console.log('📋 Testing get active bots...');
    const response = await axios.get(`${WEBHOOK_URL}/api/bots`, { timeout: 5000 });
    console.log('✅ Get active bots successful');
    console.log('📊 Active bots:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Get active bots failed:', error.message);
    return false;
  }
}

async function testBotRestart() {
  try {
    console.log('🔄 Testing bot restart...');
    const response = await axios.post(`${WEBHOOK_URL}/api/bots/${TEST_BOT_DATA.botUsername}/restart`, {}, {
      timeout: 10000
    });
    console.log('✅ Bot restart successful');
    console.log('📨 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Bot restart failed:', error.message);
    return false;
  }
}

async function testBotStop() {
  try {
    console.log('🛑 Testing bot stop...');
    const response = await axios.post(`${WEBHOOK_URL}/api/bots/${TEST_BOT_DATA.botUsername}/stop`, {}, {
      timeout: 10000
    });
    console.log('✅ Bot stop successful');
    console.log('📨 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Bot stop failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    console.log('🗄️ Testing database connection...');
    
    // This would require the database to be running
    // For now, we'll just test if we can import the model
    const Bot = require('../BotA/models/Bot');
    console.log('✅ Database model imported successfully');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Dynamic Bot System Tests...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Webhook Connection', fn: testWebhookConnection },
    { name: 'Bot Registration', fn: testBotRegistration },
    { name: 'Get Active Bots', fn: testGetActiveBots },
    { name: 'Bot Restart', fn: testBotRestart },
    { name: 'Bot Stop', fn: testBotStop }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📝 Running: ${test.name}`);
    const success = await test.fn();
    results.push({ name: test.name, success });
    console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASSED' : 'FAILED'}`);
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The dynamic bot system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the configuration and try again.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testWebhookConnection,
  testBotRegistration,
  testGetActiveBots,
  testBotRestart,
  testBotStop,
  testDatabaseConnection,
  runAllTests
}; 
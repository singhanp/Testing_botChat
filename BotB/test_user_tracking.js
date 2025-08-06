const userTrackingService = require('./services/userTrackingService');

// Mock Telegram context for testing
const createMockContext = (userId, firstName, lastName, username, botUsername, messageType, messageContent) => {
  return {
    from: {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      username: username
    },
    chat: {
      id: userId
    },
    botInfo: {
      username: botUsername
    },
    message: {
      text: messageContent
    }
  };
};

// Test user tracking functionality
async function testUserTracking() {
  console.log('🧪 Testing User Tracking Service...\n');

  // Test data
  const testUsers = [
    { userId: 123456789, firstName: 'John', lastName: 'Doe', username: 'johndoe', botUsername: 'test_bot_1' },
    { userId: 987654321, firstName: 'Jane', lastName: 'Smith', username: 'janesmith', botUsername: 'test_bot_2' },
    { userId: 555666777, firstName: 'Bob', lastName: 'Johnson', username: 'bobjohnson', botUsername: 'test_bot_1' }
  ];

  const testMessages = [
    { type: 'TEXT', content: 'Hello, how are you?' },
    { type: 'COMMAND', content: '/start' },
    { type: 'CALLBACK', content: 'game_menu' },
    { type: 'TEXT', content: 'I want to play a game' },
    { type: 'COMMAND', content: '/myrole' }
  ];

  // Simulate user interactions
  console.log('📝 Simulating user interactions...\n');

  for (let i = 0; i < 10; i++) {
    const user = testUsers[i % testUsers.length];
    const message = testMessages[i % testMessages.length];
    
    const mockCtx = createMockContext(
      user.userId,
      user.firstName,
      user.lastName,
      user.username,
      user.botUsername,
      message.type,
      message.content
    );

    // Log the interaction
    userTrackingService.logUserInteraction(
      user.userId,
      user.botUsername,
      message.type,
      message.content,
      mockCtx
    );

    // Small delay to simulate real-time interactions
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Print statistics
  console.log('\n📊 Final Statistics:');
  userTrackingService.printStats();

  // Test specific functions
  console.log('\n🔍 Testing specific functions:');
  
  const testUserId = 123456789;
  const currentBot = userTrackingService.getUserCurrentBot(testUserId);
  console.log(`   User ${testUserId} current bot: ${currentBot ? `@${currentBot}` : 'None'}`);

  const testBotUsername = 'test_bot_1';
  const botUsers = userTrackingService.getBotUsers(testBotUsername);
  console.log(`   Users for @${testBotUsername}: ${botUsers.length} users`);

  const userHistory = userTrackingService.getUserHistory(testUserId);
  console.log(`   User ${testUserId} history: ${userHistory.length} interactions`);

  const botHistory = userTrackingService.getBotHistory(testBotUsername);
  console.log(`   Bot @${testBotUsername} history: ${botHistory.length} interactions`);

  // Export logs
  const logs = userTrackingService.exportLogs();
  console.log(`\n📄 Logs exported (${logs.length} characters)`);

  console.log('\n✅ User tracking test completed!');
}

// Test real-time monitoring
function testRealTimeMonitoring() {
  console.log('\n🔄 Testing real-time monitoring...\n');

  // Simulate periodic stats printing
  const interval = setInterval(() => {
    userTrackingService.printStats();
  }, 2000); // Print every 2 seconds for testing

  // Stop after 10 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('\n⏹️ Real-time monitoring test completed!');
  }, 10000);
}

// Run tests
async function runTests() {
  await testUserTracking();
  testRealTimeMonitoring();
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testUserTracking,
  testRealTimeMonitoring,
  runTests
}; 
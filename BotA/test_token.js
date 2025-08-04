// Test script to check your bot token
require('dotenv').config();
const { Telegraf } = require('telegraf');
const tokenValidator = require('./services/tokenValidator');

async function testYourToken() {
  console.log('🧪 Testing Your Bot Token...\n');
  
  const yourToken = '7780085107:AAHDbLFM1KHk-doB17aR2r86Uxfdz-pHonQ';
  
  console.log('📋 Token Details:');
  console.log('   Token:', yourToken);
  console.log('   Length:', yourToken.length);
  console.log('   Format:', yourToken.includes(':') ? '✅ Contains colon' : '❌ Missing colon');
  
  // Test 1: Format validation
  console.log('\n1️⃣ Testing Token Format...');
  const formatCheck = tokenValidator.isValidTokenFormat(yourToken);
  console.log('   Format validation:', formatCheck ? '✅ PASS' : '❌ FAIL');
  
  // Test 2: Token validation with Telegram API
  console.log('\n2️⃣ Testing Token with Telegram API...');
  try {
    const result = await tokenValidator.validateToken(yourToken);
    console.log('   API validation result:', result);
    
    if (result.isValid) {
      console.log('✅ Token is valid!');
      console.log('   Bot ID:', result.botInfo.id);
      console.log('   Bot Username:', result.botInfo.username);
      console.log('   Bot Name:', result.botInfo.firstName);
    } else {
      console.log('❌ Token validation failed:');
      console.log('   Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
  }
  
  // Test 3: Direct API call
  console.log('\n3️⃣ Testing Direct API Call...');
  try {
    const testBot = new Telegraf(yourToken);
    const botInfo = await testBot.telegram.getMe();
    console.log('✅ Direct API call successful!');
    console.log('   Bot Info:', botInfo);
    await testBot.stop();
  } catch (error) {
    console.error('❌ Direct API call failed:', error.message);
    console.error('   Error code:', error.code);
    console.error('   Error description:', error.description);
  }
  
  console.log('\n📝 Troubleshooting Tips:');
  console.log('1. Make sure your bot is not blocked or deleted');
  console.log('2. Check if the token is copied correctly');
  console.log('3. Verify the bot is active in BotFather');
  console.log('4. Try creating a new bot if needed');
}

// Run the test
testYourToken().catch(console.error); 
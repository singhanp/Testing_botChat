require('dotenv').config();
const { connectDB } = require('./config/database');
const dynamicBotManager = require('./services/dynamicBotManager');
const WebhookService = require('./services/webhookService');

async function startBotB() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');

    // Initialize webhook service
    const webhookService = new WebhookService();
    webhookService.start();

    // Initialize all dynamic bots from database
    await dynamicBotManager.initializeBots();

    console.log('🤖 BotB (Dynamic Multi-Bot System) started successfully!');
    console.log('📊 Active bots:', dynamicBotManager.getActiveBots());

    // Graceful shutdown handling
    process.once('SIGINT', async () => {
      console.log('🛑 Shutting down BotB...');
      await dynamicBotManager.shutdownAllBots();
      webhookService.stop();
      process.exit(0);
    });

    process.once('SIGTERM', async () => {
      console.log('🛑 Shutting down BotB...');
      await dynamicBotManager.shutdownAllBots();
      webhookService.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error starting BotB:', error);
    process.exit(1);
  }
}

// Start the application
startBotB();

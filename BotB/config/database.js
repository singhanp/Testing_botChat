const mongoose = require('mongoose');

const connectDB = async () => {
  const baseURI = process.env.MONGODB_URI;
  const dbName = process.env.TELEBOT;

  if (!baseURI || !dbName) {
    throw new Error('Missing MONGODB_URI or TELEBOT in .env');
  }

  const fullURI = `${baseURI}${dbName}?authSource=admin`; // Add authSource if needed for cloud DBs

  try {
    await mongoose.connect(fullURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 second timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`✅ Connected to MongoDB database: ${dbName}`);
    
    // Test the connection
    await mongoose.connection.db.admin().ping();
    console.log('🏓 MongoDB connection test successful');
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔧 Possible solutions:');
    console.log('   1. Check if MongoDB URI is correct');
    console.log('   2. Verify network connectivity');
    console.log('   3. Check database credentials');
    console.log('   4. Ensure database server is running');
    
    // Don't exit immediately, let the app try to continue
    console.log('⚠️ Continuing without database - some features may not work');
  }
};

module.exports = { connectDB };
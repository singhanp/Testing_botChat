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
    });

    console.log(`✅ Connected to MongoDB database: ${dbName}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
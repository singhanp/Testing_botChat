const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  botName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 32
  },
  botToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  botUsername: {
    type: String,
    trim: true
  },
  botId: {
    type: Number
  },
  registeredBy: {
    type: Number, // Telegram user ID
    required: true
  },
  userInfo: {
    firstName: String,
    lastName: String,
    username: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastValidated: {
    type: Date,
    default: Date.now
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated field before saving
botSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Index for efficient queries
botSchema.index({ agentId: 1, isActive: 1 });
botSchema.index({ email: 1, isActive: 1 });
botSchema.index({ botToken: 1, isActive: 1 });
botSchema.index({ registeredBy: 1 });

module.exports = mongoose.model('Bot', botSchema); 
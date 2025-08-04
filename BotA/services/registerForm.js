const fs = require('fs').promises;
const path = require('path');

// Import register functions from the Register model
const {
  startRegistration,
  handleRegistrationInput,
  hasActiveSession,
  cancelRegistration,
  getSession,
  getAllSessions,
  isValidEmail,
  isValidBotName,
  isValidTokenFormat,
  getRegistrationStats,
  cleanupExpiredSessions
} = require('../models/register');

class RegisterForm {
  /**
   * Start the registration process
   * @param {Object} ctx - Telegram context
   */
  async startRegisterForm(ctx) {
    await startRegistration(ctx);
  }

  /**
   * Handle registration input
   * @param {Object} ctx - Telegram context
   * @returns {Promise<Object|null>} - Result object or null
   */
  async handleRegisterInput(ctx) {
    return await handleRegistrationInput(ctx);
  }

  /**
   * Check if user has active registration session
   * @param {number} userId - User ID
   * @returns {boolean} - Whether user has active session
   */
  hasActiveSession(userId) {
    return hasActiveSession(userId);
  }

  /**
   * Cancel registration for user
   * @param {number} userId - User ID
   */
  cancelRegister(userId) {
    cancelRegistration(userId);
  }

  /**
   * Get registration session for user
   * @param {number} userId - User ID
   * @returns {Object|null} - Registration session or null
   */
  getSession(userId) {
    return getSession(userId);
  }

  /**
   * Get all active sessions
   * @returns {Array} - Array of active sessions
   */
  getAllSessions() {
    return getAllSessions();
  }

  /**
   * Get registration statistics
   * @returns {Promise<Object>} - Registration statistics
   */
  async getRegistrationStats() {
    return await getRegistrationStats();
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  isValidEmail(email) {
    return isValidEmail(email);
  }

  /**
   * Validate bot name
   * @param {string} name - Bot name to validate
   * @returns {boolean} - Whether bot name is valid
   */
  isValidBotName(name) {
    return isValidBotName(name);
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} - Whether token format is valid
   */
  isValidTokenFormat(token) {
    return isValidTokenFormat(token);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    cleanupExpiredSessions();
  }
}

// Create singleton instance
const registerForm = new RegisterForm();

module.exports = registerForm;
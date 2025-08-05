// Store login sessions
const loginSessions = new Map();

class LoginForm {
  /**
   * Start the login process
   * @param {Object} ctx - Telegram context
   */
  async startLoginForm(ctx) {
    const userId = ctx.from.id;
    
    // Initialize login session
    loginSessions.set(userId, {
      step: 'waiting_for_email',
      data: {}
    });
    
    await ctx.reply('🔐 Welcome to Login!\n\n📧 Please enter your email address:', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '❌ Cancel Login', callback_data: 'cancel_login' }
          ]
        ]
      }
    });
    await ctx.answerCbQuery();
  }

  /**
   * Handle login input
   * @param {Object} ctx - Telegram context
   * @returns {Promise<Object|null>} - Result object or null
   */
  async handleLoginInput(ctx) {
    const userId = ctx.from.id;
    const session = loginSessions.get(userId);
    
    if (!session) return null;
    
    const text = ctx.message.text.trim();
    
    if (session.step === 'waiting_for_email') {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        await ctx.reply('❌ Invalid email format. Please enter a valid email address:');
        return null;
      }
      
      // Store email and ask for password
      session.data.email = text;
      session.step = 'waiting_for_password';
      
      loginSessions.set(userId, session);
      
      await ctx.reply('✅ Email received!\n\n🔒 Now please enter your password:', {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '❌ Cancel Login', callback_data: 'cancel_login' }
            ]
          ]
        }
      });
      
      return null;
    }
    
    if (session.step === 'waiting_for_password') {
      // Store password
      session.data.password = text;
      
      // Validate credentials (for now, simulate successful login)
      // In a real implementation, you would validate against a database
      const isValidCredentials = await this.validateCredentials(session.data.email, session.data.password);
      
      if (isValidCredentials) {
        loginSessions.delete(userId);
        await ctx.reply('✅ Login successful! Redirecting to main bot...');
        return { success: true, email: session.data.email };
      } else {
        // Reset to email step on failed login
        session.step = 'waiting_for_email';
        session.data = {};
        loginSessions.set(userId, session);
        
        await ctx.reply('❌ Invalid credentials. Please try again.\n\n📧 Enter your email address:', {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '❌ Cancel Login', callback_data: 'cancel_login' }
              ]
            ]
          }
        });
        return null;
      }
    }
    
    return null;
  }

  /**
   * Validate user credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<boolean>} - Whether credentials are valid
   */
  async validateCredentials(email, password) {
    // For now, simulate validation
    // In a real implementation, you would:
    // 1. Hash the password
    // 2. Query your database
    // 3. Compare hashed passwords
    
    // Demo credentials for testing
    const demoCredentials = {
      'admin@example.com': 'admin123',
      'user@example.com': 'user123',
      'test@example.com': 'test123'
    };
    
    return demoCredentials[email] === password;
  }

  /**
   * Check if user has active login session
   * @param {number} userId - User ID
   * @returns {boolean} - Whether user has active session
   */
  hasActiveSession(userId) {
    return loginSessions.has(userId);
  }

  /**
   * Cancel login for user
   * @param {number} userId - User ID
   */
  cancelLogin(userId) {
    loginSessions.delete(userId);
  }

  /**
   * Get login session for user
   * @param {number} userId - User ID
   * @returns {Object|null} - Login session or null
   */
  getSession(userId) {
    return loginSessions.get(userId) || null;
  }
}

// Create singleton instance
const loginForm = new LoginForm();

module.exports = loginForm;
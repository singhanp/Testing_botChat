const { authService } = require('./auth');

class LoginFormHandler {
  constructor() {
    this.loginSessions = new Map(); // Store temporary login sessions
  }

  // Start login process - request email
  async startLoginForm(ctx) {
    const userId = ctx.from.id;
    
    // Initialize login session
    this.loginSessions.set(userId, {
      step: 'email',
      startTime: Date.now(),
      attempts: 0
    });

    await ctx.reply(
      '📧 Login Form\n\nPlease enter your email address:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Login', callback_data: 'cancel_login' }]
          ]
        }
      }
    );
  }

  // Handle user input during login process
  async handleLoginInput(ctx) {
    const userId = ctx.from.id;
    const session = this.loginSessions.get(userId);
    
    if (!session) {
      await ctx.reply('❌ No active login session. Please start login again.');
      return false;
    }

    // Check session timeout (5 minutes)
    if (Date.now() - session.startTime > 300000) {
      this.loginSessions.delete(userId);
      await ctx.reply('⏰ Login session expired. Please try again.');
      return false;
    }

    const userInput = ctx.message.text.trim();

    switch (session.step) {
      case 'email':
        return await this.handleEmailInput(ctx, userInput, session);
      case 'password':
        return await this.handlePasswordInput(ctx, userInput, session);
      default:
        return false;
    }
  }

  // Handle email input
  async handleEmailInput(ctx, email, session) {
    const userId = ctx.from.id;

    // Basic email validation
    if (!this.isValidEmail(email)) {
      session.attempts++;
      if (session.attempts >= 3) {
        this.loginSessions.delete(userId);
        await ctx.reply('❌ Too many invalid attempts. Please start login again.');
        return false;
      }
      await ctx.reply('❌ Invalid email format. Please enter a valid email address:');
      return false;
    }

    // Store email and move to password step
    session.email = email;
    session.step = 'password';
    session.attempts = 0;

    await ctx.reply(
      '🔐 Email received!\n\nNow please enter your password:',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Cancel Login', callback_data: 'cancel_login' }]
          ]
        }
      }
    );

    return true;
  }

  // Handle password input
  async handlePasswordInput(ctx, password, session) {
    const userId = ctx.from.id;

    if (!password || password.length < 6) {
      session.attempts++;
      if (session.attempts >= 3) {
        this.loginSessions.delete(userId);
        await ctx.reply('❌ Too many invalid attempts. Please start login again.');
        return false;
      }
      await ctx.reply('❌ Password must be at least 6 characters. Please try again:');
      return false;
    }

    // Store password
    session.password = password;

    // Validate credentials
    const isValid = await this.validateCredentials(session.email, password);
    
    if (isValid) {
      // Clear the session
      this.loginSessions.delete(userId);
      
      await ctx.reply('✅ Login successful! Redirecting to main bot...');
      return { success: true, email: session.email };
    } else {
      session.attempts++;
      if (session.attempts >= 3) {
        this.loginSessions.delete(userId);
        await ctx.reply('❌ Too many failed login attempts. Please start login again.');
        return false;
      }
      await ctx.reply('❌ Invalid email or password. Please try again with your password:');
      session.step = 'password'; // Stay on password step
      return false;
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate user credentials
  async validateCredentials(email, password) {
    try {
      // Read users database - create it if it doesn't exist
      const usersData = await this.getUsersDatabase();
      
      // Find user by email
      const user = usersData.find(u => u.email === email && u.password === password);
      
      return !!user;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }

  // Get users database (create default users if file doesn't exist)
  async getUsersDatabase() {
    const fs = require('fs').promises;
    const path = require('path');
    const usersFilePath = path.join(__dirname, '../database/users.json');

    try {
      const data = await fs.readFile(usersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create default users file
        const defaultUsers = [
          {
            id: 1,
            email: 'admin@example.com',
            password: 'admin123',
            role: 'super_admin',
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            email: 'agent@example.com',
            password: 'agent123',
            role: 'agent',
            createdAt: new Date().toISOString()
          },
          {
            id: 3,
            email: 'user@example.com',
            password: 'user123',
            role: 'member',
            createdAt: new Date().toISOString()
          }
        ];

        // Ensure database directory exists
        const dbDir = path.dirname(usersFilePath);
        await fs.mkdir(dbDir, { recursive: true });
        
        await fs.writeFile(usersFilePath, JSON.stringify(defaultUsers, null, 2));
        return defaultUsers;
      }
      throw error;
    }
  }

  // Cancel login session
  cancelLogin(userId) {
    this.loginSessions.delete(userId);
  }

  // Check if user has active login session
  hasActiveSession(userId) {
    return this.loginSessions.has(userId);
  }

  // Get session info
  getSession(userId) {
    return this.loginSessions.get(userId);
  }
}

module.exports = new LoginFormHandler();
class AuthenticationService {
  constructor() {
    this.userSessions = new Map(); // userId -> session data
    this.pendingVerifications = new Map(); // userId -> verification data
  }

  /**
   * Check if user is authenticated
   * @param {number} userId - Telegram user ID
   * @returns {boolean}
   */
  isAuthenticated(userId) {
    const session = this.userSessions.get(userId);
    return session && session.isVerified;
  }

  /**
   * Get user session
   * @param {number} userId - Telegram user ID
   * @returns {Object|null}
   */
  getUserSession(userId) {
    return this.userSessions.get(userId) || null;
  }

  /**
   * Start authentication process
   * @param {number} userId - Telegram user ID
   * @param {Object} userInfo - User info from Telegram
   * @param {string} authType - 'login' or 'register'
   */
  startAuthentication(userId, userInfo, authType = 'login') {
    const session = {
      userId: userId,
      firstName: userInfo.first_name,
      lastName: userInfo.last_name || '',
      username: userInfo.username || '',
      isVerified: false,
      authType: authType, // 'login' or 'register'
      step: 'contact_input', // contact_input, otp_verification, completed
      contactInfo: null,
      contactType: null, // 'email' or 'phone'
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.userSessions.set(userId, session);
    return session;
  }


  /**
   * Set user contact information
   * @param {number} userId - Telegram user ID
   * @param {string} contact - Email or phone number
   * @param {string} type - 'email' or 'phone'
   */
  setUserContact(userId, contact, type) {
    const session = this.userSessions.get(userId);
    if (session) {
      session.contactInfo = contact;
      session.contactType = type;
      session.step = 'otp_verification';
      session.lastActivity = new Date();
      this.userSessions.set(userId, session);
    }
  }

  /**
   * Generate and store OTP for user
   * @param {number} userId - Telegram user ID
   * @returns {string} OTP code
   */
  generateOTP(userId) {
    // For now, always return default OTP
    const otp = '8888888';
    
    const verification = {
      otp: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
      maxAttempts: 3
    };

    this.pendingVerifications.set(userId, verification);
    
    console.log(`🔐 Generated OTP for user ${userId}: ${otp}`);
    return otp;
  }

  /**
   * Verify OTP
   * @param {number} userId - Telegram user ID
   * @param {string} inputOtp - User input OTP
   * @returns {Object} Verification result
   */
  verifyOTP(userId, inputOtp) {
    const verification = this.pendingVerifications.get(userId);
    const session = this.userSessions.get(userId);

    if (!verification || !session) {
      return { success: false, error: 'No verification found' };
    }

    if (new Date() > verification.expiresAt) {
      this.pendingVerifications.delete(userId);
      return { success: false, error: 'OTP expired' };
    }

    if (verification.attempts >= verification.maxAttempts) {
      this.pendingVerifications.delete(userId);
      return { success: false, error: 'Maximum attempts exceeded' };
    }

    verification.attempts++;

    if (inputOtp === verification.otp) {
      // OTP is correct
      session.isVerified = true;
      session.step = 'completed';
      session.verifiedAt = new Date();
      session.lastActivity = new Date();
      
      this.userSessions.set(userId, session);
      this.pendingVerifications.delete(userId);
      
      console.log(`✅ User ${userId} successfully verified with OTP`);
      return { success: true };
    } else {
      // OTP is incorrect
      const attemptsLeft = verification.maxAttempts - verification.attempts;
      return { 
        success: false, 
        error: 'Invalid OTP', 
        attemptsLeft: attemptsLeft 
      };
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  isValidPhone(phone) {
    // Remove all non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    // Accept 10-15 digits
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  /**
   * Format phone number
   * @param {string} phone - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    // Add + if not present
    return cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone;
  }

  /**
   * Send OTP (placeholder - for future implementation)
   * @param {string} contact - Email or phone
   * @param {string} type - 'email' or 'phone'
   * @param {string} otp - OTP code
   * @returns {Promise<boolean>}
   */
  async sendOTP(contact, type, otp) {
    // TODO: Implement actual email/SMS sending
    console.log(`📧 [UNDER CONSTRUCTION] Would send OTP ${otp} to ${type}: ${contact}`);
    console.log(`💡 For now, using default OTP: 8888888`);
    return true;
  }

  /**
   * Clean expired sessions and verifications
   */
  cleanExpiredData() {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean expired sessions
    for (const [userId, session] of this.userSessions.entries()) {
      if (now - session.lastActivity > maxAge) {
        this.userSessions.delete(userId);
        console.log(`🧹 Cleaned expired session for user ${userId}`);
      }
    }

    // Clean expired verifications
    for (const [userId, verification] of this.pendingVerifications.entries()) {
      if (now > verification.expiresAt) {
        this.pendingVerifications.delete(userId);
        console.log(`🧹 Cleaned expired verification for user ${userId}`);
      }
    }
  }

  /**
   * Logout user (clear session)
   * @param {number} userId - Telegram user ID
   * @returns {boolean} Success status
   */
  logout(userId) {
    const session = this.userSessions.get(userId);
    if (session) {
      this.userSessions.delete(userId);
      this.pendingVerifications.delete(userId); // Also clear any pending verifications
      console.log(`User ${userId} logged out successfully`);
      return true;
    }
    return false;
  }

  /**
   * Get user session info for display
   * @param {number} userId - Telegram user ID
   * @returns {Object|null}
   */
  getUserSessionInfo(userId) {
    const session = this.userSessions.get(userId);
    if (session && session.isVerified) {
      return {
        authType: session.authType,
        contactType: session.contactType,
        contactInfo: session.contactInfo,
        verifiedAt: session.verifiedAt,
        lastActivity: session.lastActivity
      };
    }
    return null;
  }

  /**
   * Get authentication statistics
   * @returns {Object}
   */
  getStats() {
    return {
      totalSessions: this.userSessions.size,
      verifiedUsers: Array.from(this.userSessions.values()).filter(s => s.isVerified).length,
      pendingVerifications: this.pendingVerifications.size,
      activeUsers: Array.from(this.userSessions.values()).filter(s => 
        new Date() - s.lastActivity < 60 * 60 * 1000 // 1 hour
      ).length
    };
  }
}

// Create singleton instance
const authenticationService = new AuthenticationService();

// Clean expired data every hour
setInterval(() => {
  authenticationService.cleanExpiredData();
}, 60 * 60 * 1000);

module.exports = authenticationService;
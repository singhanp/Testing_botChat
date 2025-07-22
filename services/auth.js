const ADMIN_ID = process.env.ADMIN_ID;

module.exports = {
  ADMIN_ID,
  isAdmin: (userId) => String(userId) === String(ADMIN_ID)
}; 
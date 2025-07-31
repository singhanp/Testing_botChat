// Example: How to use MongoDB in your controllers
const userService = require('../services/userService');

// Example controller function using MongoDB
async function handleUserRegistration(ctx) {
  try {
    const { id, first_name, last_name } = ctx.from;
    
    // Check if user already exists
    let user = await userService.findUserByChatId(id);
    
    if (!user) {
      // Create new user
      user = await userService.createUser({
        chatId: id,
        firstName: first_name,
        lastName: last_name || '',
        goodMorningEnabled: true
      });
      
      await ctx.reply(`Welcome ${first_name}! You've been registered successfully.`);
    } else {
      // Update existing user
      user = await userService.updateUser(id, {
        firstName: first_name,
        lastName: last_name || ''
      });
      
      await ctx.reply(`Welcome back ${first_name}!`);
    }
    
  } catch (error) {
    console.error('Error in user registration:', error);
    await ctx.reply('Sorry, there was an error processing your registration.');
  }
}

// Example: Toggle good morning setting
async function handleToggleGoodMorning(ctx) {
  try {
    const { id } = ctx.from;
    const user = await userService.toggleGoodMorning(id);
    
    const status = user.goodMorningEnabled ? 'enabled' : 'disabled';
    await ctx.reply(`Good morning messages are now ${status}!`);
    
  } catch (error) {
    console.error('Error toggling good morning:', error);
    await ctx.reply('Sorry, there was an error updating your settings.');
  }
}

// Example: Get all users (admin function)
async function handleGetAllUsers(ctx) {
  try {
    const users = await userService.getAllUsers();
    const userList = users.map(user => 
      `${user.firstName} ${user.lastName} (ID: ${user.chatId})`
    ).join('\n');
    
    await ctx.reply(`Total users: ${users.length}\n\n${userList}`);
    
  } catch (error) {
    console.error('Error getting users:', error);
    await ctx.reply('Sorry, there was an error retrieving user data.');
  }
}

module.exports = {
  handleUserRegistration,
  handleToggleGoodMorning,
  handleGetAllUsers
}; 
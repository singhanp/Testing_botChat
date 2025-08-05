const { authService, getUserRole, getUserInfo } = require('../services/auth');
const buttons = require('../services/buttons');
const home = require('./home');
const game = require('./game');
const login = require('./login');

module.exports = (bot, scheduler, botB = null) => {
  // Store user data temporarily (if needed)
  const userData = {};

  // Start command with role-based welcome
  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    const userInfo = await getUserInfo(userId);
    
    // Check if user came from Bot A login
    const startPayload = ctx.message?.text?.split(' ')[1];
    const isFromLogin = startPayload === 'from_login';
    
    let welcomeMessage = '';
    let keyboard = null;

    switch (userRole) {
      case 'super_admin':
        welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.superAdminKeyboard();
        break;
        
      case 'agent':
        welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.agentKeyboard(userInfo.agentName);
        break;
        
      case 'member':
        welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.memberKeyboard();
        break;
        
      default: // guest
        welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.welcomeKeyboard();
    }

    // Add special message if coming from login
    if (isFromLogin) {
      welcomeMessage = `Welcome from Login!\n\n${welcomeMessage}\n\nYou have successfully logged in from Bot A!`;
    }

    await ctx.reply(welcomeMessage, { reply_markup: keyboard });
  });

  // Handle users who haven't started the bot yet (when they send any message)
  bot.on('message', async (ctx) => {
    // Skip if it's a command (handled by other handlers)
    if (ctx.message.text && ctx.message.text.startsWith('/')) {
      return;
    }
    
    // Check if this is the first message from this user
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    // If user has a role but this might be their first interaction
    if (userRole !== 'guest') {
      const welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
      await ctx.reply(welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🚀 Start My Interface', callback_data: 'start_interface' }
            ]
          ]
        }
      });
    } else {
      // Guest user - show basic welcome
      await ctx.reply(`Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`);
    }
  });

  // Respond to greetings with role-based response
  bot.hears(/^(hi|hello|hey|greetings|good\s?morning|good\s?afternoon|good\s?evening)$/i, async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    let responseMessage = '';
    let keyboard = null;

    switch (userRole) {
      case 'super_admin':
        responseMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.superAdminKeyboard();
        break;
        
      case 'agent':
        const agentInfo = await getUserInfo(userId);
        responseMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.agentKeyboard(agentInfo.agentName);
        break;
        
      case 'member':
        responseMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.memberKeyboard();
        break;
        
      default:
        responseMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
        keyboard = buttons.welcomeKeyboard();
    }

    await ctx.reply(responseMessage, { reply_markup: keyboard });
  });

  // Register separated controllers
  // Removed: help, gallery, demo controllers

  // Role-based commands
  bot.command('myrole', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    const userInfo = await getUserInfo(userId);
    
    let roleMessage = `🎭 Your Role: ${userRole.toUpperCase()}\n\n`;
    
    switch (userRole) {
      case 'super_admin':
        roleMessage += `👑 You are the Super Administrator\n🔹 Full system access\n🔹 Manage all agents and members\n🔹 System-wide statistics and settings`;
        break;
        
      case 'agent':
        roleMessage += `👨‍💼 You are an Agent\n🔹 Agent Name: ${userInfo.agentName}\n🔹 Manage your team members\n🔹 View your agent statistics\n🔹 Send messages to your members`;
        break;
        
      case 'member':
        roleMessage += `🎮 You are a Member\n🔹 Agent: ${userInfo.agentInfo.agentName}\n🔹 Play games and earn points\n🔹 View your personal statistics\n🔹 Customize your preferences`;
        break;
        
      default:
        roleMessage += `👤 You are a Guest\n🔹 Limited access to features\n🔹 Contact an agent to become a member\n🔹 Basic game access available`;
    }
    
    await ctx.reply(roleMessage);
  });

  // Super Admin commands
  bot.command('systemstats', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    if (userRole !== 'super_admin') {
      await ctx.reply('❌ This command is only available for Super Administrators.');
      return;
    }
    
    try {
      const agents = await authService.getAgents();
      const members = await authService.getMembers();
      const stats = await scheduler.getStats();
      
      const systemStats = `📊 System Statistics\n\n👥 Total Agents: ${agents.length}\n👤 Total Members: ${members.length}\n🌅 Good Morning Subscribers: ${stats.subscribedUsers}\n\n📈 System Health: ✅ Active`;
      
      await ctx.reply(systemStats, { reply_markup: buttons.superAdminKeyboard() });
    } catch (error) {
      console.error('Error getting system stats:', error);
      await ctx.reply('❌ Error retrieving system statistics.');
    }
  });

  // Agent commands
  bot.command('agentstats', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    if (userRole !== 'agent') {
      await ctx.reply('❌ This command is only available for Agents.');
      return;
    }
    
    try {
      const agent = await authService.getAgentByChatId(userId);
      const members = await authService.getMembersByAgentId(agent.agentId);
      
      const agentStats = `📊 Agent Statistics\n\n👨‍💼 Agent: ${agent.agentName}\n👤 Total Members: ${members.length}\n📊 Max Members: ${agent.settings.maxMembers}\n🌅 Good Morning Enabled: ${agent.settings.goodMorningEnabled ? '✅' : '❌'}\n\n📈 Status: ✅ Active`;
      
      await ctx.reply(agentStats, { reply_markup: buttons.agentKeyboard(agent.agentName) });
    } catch (error) {
      console.error('Error getting agent stats:', error);
      await ctx.reply('❌ Error retrieving agent statistics.');
    }
  });

  // Member commands
  bot.command('mystats', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    if (userRole !== 'member') {
      await ctx.reply('❌ This command is only available for Members.');
      return;
    }
    
    try {
      const member = await authService.getMemberByChatId(userId);
      const agent = await authService.getAgentByAgentId(member.agentId);
      
      const memberStats = `📊 My Statistics\n\n🎮 Games Played: ${member.stats.gamesPlayed}\n🏆 Total Score: ${member.stats.totalScore}\n👨‍💼 Agent: ${agent.agentName}\n🌅 Good Morning: ${member.preferences.goodMorningEnabled ? '✅' : '❌'}\n\n📈 Status: ✅ Active`;
      
      await ctx.reply(memberStats, { reply_markup: buttons.memberKeyboard() });
    } catch (error) {
      console.error('Error getting member stats:', error);
      await ctx.reply('❌ Error retrieving member statistics.');
    }
  });

  // Good morning message commands (updated for role-based access)
  bot.command('goodmorning', async (ctx) => {
    const chatId = ctx.chat.id;
    const firstName = ctx.from.first_name;
    const lastName = ctx.from.lastName || '';
    const userRole = await getUserRole(chatId);
    
    let isEnabled = false;
    
    if (userRole === 'agent') {
      const agent = await authService.getAgentByChatId(chatId);
      isEnabled = agent.settings.goodMorningEnabled;
    } else if (userRole === 'member') {
      const member = await authService.getMemberByChatId(chatId);
      isEnabled = member.preferences.goodMorningEnabled;
    } else {
      isEnabled = await scheduler.isGoodMorningEnabled(chatId);
    }
    
    if (isEnabled) {
      await ctx.reply('🌅 You are already subscribed to good morning messages!\n\nUse /stopgoodmorning to unsubscribe.');
    } else {
      if (userRole === 'agent') {
        const agent = await authService.getAgentByChatId(chatId);
        await authService.updateAgent(agent.agentId, {
          'settings.goodMorningEnabled': true
        });
      } else if (userRole === 'member') {
        const member = await authService.getMemberByChatId(chatId);
        await authService.updateMember(member.memberId, {
          'preferences.goodMorningEnabled': true
        });
      } else {
        await scheduler.enableGoodMorning(chatId, firstName, lastName);
      }
      
      await ctx.reply('✅ Good morning messages enabled!\n\n🌞 You will receive a daily good morning message at 8:00 AM UTC.\n\nUse /stopgoodmorning to unsubscribe anytime.');
    }
  });

  bot.command('stopgoodmorning', async (ctx) => {
    const chatId = ctx.chat.id;
    const userRole = await getUserRole(chatId);
    
    let isEnabled = false;
    
    if (userRole === 'agent') {
      const agent = await authService.getAgentByChatId(chatId);
      isEnabled = agent.settings.goodMorningEnabled;
    } else if (userRole === 'member') {
      const member = await authService.getMemberByChatId(chatId);
      isEnabled = member.preferences.goodMorningEnabled;
    } else {
      isEnabled = await scheduler.isGoodMorningEnabled(chatId);
    }
    
    if (!isEnabled) {
      await ctx.reply('❌ You are not subscribed to good morning messages.\n\nUse /goodmorning to subscribe.');
    } else {
      if (userRole === 'agent') {
        const agent = await authService.getAgentByChatId(chatId);
        await authService.updateAgent(agent.agentId, {
          'settings.goodMorningEnabled': false
        });
      } else if (userRole === 'member') {
        const member = await authService.getMemberByChatId(chatId);
        await authService.updateMember(member.memberId, {
          'preferences.goodMorningEnabled': false
        });
      } else {
        await scheduler.disableGoodMorning(chatId);
      }
      
      await ctx.reply('🛑 Good morning messages disabled.\n\nYou will no longer receive daily good morning messages.\n\nUse /goodmorning to subscribe again anytime.');
    }
  });

  // Admin command to see good morning stats (Super Admin only)
  bot.command('goodmorningstats', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    if (userRole !== 'super_admin') {
      await ctx.reply('❌ This command is only available for Super Administrators.');
      return;
    }
    
    const stats = await scheduler.getStats();
    await ctx.reply(`📊 Good Morning Statistics:\n\n👥 Total Users: ${stats.totalUsers}\n✅ Subscribed: ${stats.subscribedUsers}\n❌ Unsubscribed: ${stats.unsubscribedUsers}\n\n🕰️ Next message: 8:00 AM UTC daily`);
  });

  // Test command to send a sample good morning message (Super Admin only)
  bot.command('testgoodmorning', async (ctx) => {
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    if (userRole !== 'super_admin') {
      await ctx.reply('❌ This command is only available for Super Administrators.');
      return;
    }
    
    await scheduler.sendGoodMorningMessages();
    await ctx.reply('🧪 Test good morning messages sent to all subscribed users!');
  });

  // Callback query handler for inline buttons with role-based actions
  bot.on('callback_query', async (ctx) => {
    const action = ctx.callbackQuery.data;
    const userId = ctx.from.id;
    const userRole = await getUserRole(userId);
    
    switch (action) {
      case 'login':
        await login.handleLogin(ctx);
        break;
      case 'game_menu':
        await game.handleGameList(ctx, 1);
        break;
      case 'quick_play':
        await game.handleQuickPlay(ctx);
        break;
      case 'check_balance':
        await ctx.reply('💰 Balance: $0.00\n\nThis is a dummy balance display. Your account balance will be shown here.');
        break;
      case 'deposit':
        await ctx.reply('💳 Deposit\n\nThis is a dummy deposit function. Deposit functionality will be implemented here.');
        break;
      case 'withdraw':
        await ctx.reply('💸 Withdraw\n\nThis is a dummy withdraw function. Withdrawal functionality will be implemented here.');
        break;
      case 'logout':
        await ctx.reply('🚪 Logout\n\nThis is a dummy logout function. Logout functionality will be implemented here.');
        break;
      case 'manage_agents':
        if (userRole === 'super_admin') {
          await ctx.reply('👥 Agent Management\n\nWhat would you like to do?', {
            reply_markup: buttons.agentManagementKeyboard()
          });
        } else {
          await ctx.reply('❌ Access denied. Super Admin only.');
        }
        break;
      case 'manage_members':
        if (userRole === 'agent') {
          await ctx.reply('👥 Member Management\n\nWhat would you like to do?', {
            reply_markup: buttons.memberManagementKeyboard()
          });
        } else {
          await ctx.reply('❌ Access denied. Agents only.');
        }
        break;
      case 'play_games':
        if (userRole === 'member') {
          await game.handleGameMenu(ctx);
        } else {
          await ctx.reply('❌ Access denied. Members only.');
        }
        break;
      case 'system_stats':
        if (userRole === 'super_admin') {
          await ctx.reply('📊 Loading system statistics...');
          // Implement system stats logic
        } else {
          await ctx.reply('❌ Access denied. Super Admin only.');
        }
        break;
      case 'agent_stats':
        if (userRole === 'agent') {
          await ctx.reply('📊 Loading agent statistics...');
          // Implement agent stats logic
        } else {
          await ctx.reply('❌ Access denied. Agents only.');
        }
        break;
      case 'my_stats':
        if (userRole === 'member') {
          await ctx.reply('📊 Loading your statistics...');
          // Implement member stats logic
        } else {
          await ctx.reply('❌ Access denied. Members only.');
        }
        break;

      case 'settings':
        await ctx.reply('⚙️ Here are the settings!', {
          reply_markup: buttons.settingsKeyboard(userRole)
        });
        break;
      case 'back_to_main':
        await home.handleHome(ctx);
        break;
      case 'start_interface':
        // Trigger the start command programmatically
        const userId = ctx.from.id;
        const userRole = await getUserRole(userId);
        const userInfo = await getUserInfo(userId);
        
        let welcomeMessage = '';
        let keyboard = null;

        switch (userRole) {
          case 'super_admin':
            welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
            keyboard = buttons.superAdminKeyboard();
            break;
            
          case 'agent':
            welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
            keyboard = buttons.agentKeyboard(userInfo.agentName);
            break;
            
          case 'member':
            welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
            keyboard = buttons.memberKeyboard();
            break;
            
          default:
            welcomeMessage = `Welcome ${ctx.from.first_name}!\n\nPlease select an action from the options below.`;
            keyboard = buttons.welcomeKeyboard();
        }

        await ctx.editMessageText(welcomeMessage, { reply_markup: keyboard });
        break;
      default:
        // Handle game list pagination
        if (action.startsWith('game_list_page_')) {
          const page = parseInt(action.replace('game_list_page_', ''));
          await game.handleGameList(ctx, page);
        } else if (action.startsWith('game_detail_')) {
          const gameId = action.replace('game_detail_', '');
          await game.handleGameDetail(ctx, gameId);
        } else if (action === 'page_info') {
          await ctx.answerCbQuery('Page information');
        } else {
          await ctx.answerCbQuery('Unknown action!');
        }
    }
    // Always answer the callback to remove the loading state
    await ctx.answerCbQuery();
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('🚨 An error occurred. Please try again or contact support.');
  });
}; 
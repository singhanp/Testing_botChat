const fs = require('fs').promises;
const path = require('path');

// Super Admin ID (you can change this)
const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || '52648427812802789';

class AuthService {
  constructor() {
    this.agentsFilePath = path.join(__dirname, '../database/agents.json');
    this.membersFilePath = path.join(__dirname, '../database/members.json');
  }

  // Check if user is Super Admin
  isSuperAdmin(userId) {
    return String(userId) === String(SUPER_ADMIN_ID);
  }

  // Check if user is an Agent
  async isAgent(userId) {
    try {
      const agents = await this.getAgents();
      return agents.some(agent => agent.chatId === userId && agent.isActive);
    } catch (error) {
      console.error('Error checking if user is agent:', error);
      return false;
    }
  }

  // Check if user is a Member
  async isMember(userId) {
    try {
      const members = await this.getMembers();
      return members.some(member => member.chatId === userId && member.isActive);
    } catch (error) {
      console.error('Error checking if user is member:', error);
      return false;
    }
  }

  // Get user role (super_admin, agent, member, or guest)
  async getUserRole(userId) {
    if (this.isSuperAdmin(userId)) {
      return 'super_admin';
    }
    
    if (await this.isAgent(userId)) {
      return 'agent';
    }
    
    if (await this.isMember(userId)) {
      return 'member';
    }
    
    return 'guest';
  }

  // Get agent by chat ID
  async getAgentByChatId(chatId) {
    try {
      const agents = await this.getAgents();
      return agents.find(agent => agent.chatId === chatId && agent.isActive);
    } catch (error) {
      console.error('Error getting agent by chat ID:', error);
      return null;
    }
  }

  // Get member by chat ID
  async getMemberByChatId(chatId) {
    try {
      const members = await this.getMembers();
      return members.find(member => member.chatId === chatId && member.isActive);
    } catch (error) {
      console.error('Error getting member by chat ID:', error);
      return null;
    }
  }

  // Get all members for a specific agent
  async getMembersByAgentId(agentId) {
    try {
      const members = await this.getMembers();
      return members.filter(member => member.agentId === agentId && member.isActive);
    } catch (error) {
      console.error('Error getting members by agent ID:', error);
      return [];
    }
  }

  // Get agent by agent ID
  async getAgentByAgentId(agentId) {
    try {
      const agents = await this.getAgents();
      return agents.find(agent => agent.agentId === agentId && agent.isActive);
    } catch (error) {
      console.error('Error getting agent by agent ID:', error);
      return null;
    }
  }

  // Add new agent
  async addAgent(agentData) {
    try {
      const agents = await this.getAgents();
      const newAgent = {
        agentId: `agent_${Date.now()}`,
        ...agentData,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      agents.push(newAgent);
      await this.saveAgents(agents);
      return newAgent;
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  }

  // Add new member
  async addMember(memberData) {
    try {
      const members = await this.getMembers();
      const newMember = {
        memberId: `member_${Date.now()}`,
        ...memberData,
        isActive: true,
        joinedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        stats: {
          gamesPlayed: 0,
          totalScore: 0,
          lastGamePlayed: null
        },
        preferences: {
          goodMorningEnabled: true,
          notificationsEnabled: true
        }
      };
      
      members.push(newMember);
      await this.saveMembers(members);
      return newMember;
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  // Update agent
  async updateAgent(agentId, updateData) {
    try {
      const agents = await this.getAgents();
      const agentIndex = agents.findIndex(agent => agent.agentId === agentId);
      
      if (agentIndex >= 0) {
        agents[agentIndex] = {
          ...agents[agentIndex],
          ...updateData,
          lastUpdated: new Date().toISOString()
        };
        await this.saveAgents(agents);
        return agents[agentIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  }

  // Update member
  async updateMember(memberId, updateData) {
    try {
      const members = await this.getMembers();
      const memberIndex = members.findIndex(member => member.memberId === memberId);
      
      if (memberIndex >= 0) {
        members[memberIndex] = {
          ...members[memberIndex],
          ...updateData,
          lastUpdated: new Date().toISOString()
        };
        await this.saveMembers(members);
        return members[memberIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  }

  // Get all agents
  async getAgents() {
    try {
      const data = await fs.readFile(this.agentsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Get all members
  async getMembers() {
    try {
      const data = await fs.readFile(this.membersFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  // Save agents
  async saveAgents(agents) {
    await fs.writeFile(this.agentsFilePath, JSON.stringify(agents, null, 2));
  }

  // Save members
  async saveMembers(members) {
    await fs.writeFile(this.membersFilePath, JSON.stringify(members, null, 2));
  }

  // Check if agent can add more members
  async canAgentAddMember(agentId) {
    try {
      const agent = await this.getAgentByAgentId(agentId);
      if (!agent) return false;
      
      const members = await this.getMembersByAgentId(agentId);
      return members.length < agent.settings.maxMembers;
    } catch (error) {
      console.error('Error checking if agent can add member:', error);
      return false;
    }
  }

  // Get user info (works for all user types)
  async getUserInfo(userId) {
    const role = await this.getUserRole(userId);
    
    switch (role) {
      case 'super_admin':
        return {
          role: 'super_admin',
          chatId: userId,
          permissions: ['all']
        };
      case 'agent':
        const agent = await this.getAgentByChatId(userId);
        return {
          role: 'agent',
          ...agent,
          permissions: ['manage_own_members', 'view_own_stats', 'send_messages']
        };
      case 'member':
        const member = await this.getMemberByChatId(userId);
        const memberAgent = await this.getAgentByAgentId(member.agentId);
        return {
          role: 'member',
          ...member,
          agentInfo: memberAgent,
          permissions: ['play_games', 'view_own_stats']
        };
      default:
        return {
          role: 'guest',
          chatId: userId,
          permissions: ['basic_access']
        };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

module.exports = {
  SUPER_ADMIN_ID,
  authService,
  isSuperAdmin: (userId) => authService.isSuperAdmin(userId),
  isAgent: (userId) => authService.isAgent(userId),
  isMember: (userId) => authService.isMember(userId),
  getUserRole: (userId) => authService.getUserRole(userId),
  getUserInfo: (userId) => authService.getUserInfo(userId)
}; 
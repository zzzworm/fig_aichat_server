/**
 * chat-conversation service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::chat-conversation.chat-conversation', ({ strapi }) => ({
  async createMessage(data) {
    try {
      // 创建聊天消息
      const chatMessage = await strapi.entityService.create('api::chat-conversation.chat-conversation', {
        data,
      });
      
      return chatMessage;
    } catch (error) {
      console.error('Error in createMessage service:', error);
      throw error;
    }
  },
}));

/**
 * Custom chat-conversation routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/chat-conversations/create-message',
      handler: 'chat-conversation.createMessage',
      config: {
        middlewares: ['global::koasseStream']
      },
    },
    {
      method: 'GET',
      path: '/chat-conversations/my-list',
      handler: 'chat-conversation.myList'
    },
  ],
};

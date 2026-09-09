const mongoose = require('mongoose');
const chatService = require('../services/chatService');

const createMessageParser = () => {
  const recentMessages = [];
  return (value) => {
    const message = typeof value === 'string' ? value.trim() : '';
    if (!message || message.length > 1000) return null;
    const now = Date.now();
    while (recentMessages.length && recentMessages[0] < now - 10_000) recentMessages.shift();
    if (recentMessages.length >= 10) return null;
    recentMessages.push(now);
    return message;
  };
};

const emitError = (socket, message, error) => {
  if (error) console.error(message, error);
  socket.emit('chat_error', message);
};

const registerChatHandlers = (io, socket) => {
  const userId = socket.user._id.toString();
  const userRoom = `user:${userId}`;
  const parseMessage = createMessageParser();

  socket.on('join_chat', async () => {
    if (socket.user.role === 'owner') return emitError(socket, 'Owners cannot join customer chat rooms.');
    try {
      socket.join(userRoom);
      const session = await chatService.getOrCreateSession(userId);
      socket.emit('chat_history', session.messages);
    } catch (error) {
      emitError(socket, 'Unable to load chat history.', error);
    }
  });

  socket.on('join_admin', () => {
    if (socket.user.role !== 'owner') return emitError(socket, 'Owner access required.');
    socket.join('admin_room');
  });

  socket.on('send_message', async ({ text } = {}) => {
    if (socket.user.role === 'owner') return emitError(socket, 'Owners cannot send customer messages.');
    const safeText = parseMessage(text);
    if (!safeText) return emitError(socket, 'Message is empty, too long, or being sent too quickly.');
    try {
      const message = await chatService.addCustomerMessage(userId, safeText);
      io.to(userRoom).emit('receive_message', message);
      io.to('admin_room').emit('new_admin_message', { userId, message });
    } catch (error) {
      emitError(socket, 'Unable to send message.', error);
    }
  });

  socket.on('admin_reply', async ({ userId: customerId, text } = {}) => {
    if (socket.user.role !== 'owner') return emitError(socket, 'Owner access required.');
    const safeText = parseMessage(text);
    if (!safeText || !mongoose.isValidObjectId(customerId)) return emitError(socket, 'Invalid recipient or message.');
    try {
      const message = await chatService.addAdminMessage(customerId, safeText);
      io.to(`user:${customerId}`).emit('receive_message', message);
      io.to('admin_room').emit('new_admin_message', { userId: customerId, message });
    } catch (error) {
      emitError(socket, error.statusCode === 404 ? error.message : 'Unable to send reply.', error);
    }
  });
};

module.exports = registerChatHandlers;

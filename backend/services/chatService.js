const ChatSession = require('../models/chatModel');
const AppError = require('../utils/AppError');

const listSessions = () => ChatSession.find()
  .populate('user', 'name email')
  .sort({ lastUpdated: -1 });

const getOrCreateSession = async (userId) => {
  let session = await ChatSession.findOne({ user: userId });
  if (!session) session = await ChatSession.create({ user: userId, messages: [] });
  return session;
};

const addCustomerMessage = async (userId, text) => {
  const session = await getOrCreateSession(userId);
  session.messages.push({ sender: 'customer', text });
  session.lastUpdated = Date.now();
  await session.save();
  return session.messages.at(-1);
};

const addAdminMessage = async (userId, text) => {
  const session = await ChatSession.findOne({ user: userId });
  if (!session) throw new AppError('Chat session not found', 404);
  session.messages.push({ sender: 'admin', text });
  session.lastUpdated = Date.now();
  await session.save();
  return session.messages.at(-1);
};

module.exports = { listSessions, getOrCreateSession, addCustomerMessage, addAdminMessage };

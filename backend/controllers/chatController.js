const asyncHandler = require('../middleware/asyncHandler');
const chatService = require('../services/chatService');

const getAllChatSessions = asyncHandler(async (req, res) => {
  res.json(await chatService.listSessions());
});

module.exports = { getAllChatSessions };

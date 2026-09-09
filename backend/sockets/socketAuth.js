const authService = require('../services/authService');

const authenticateSocket = async (socket, next) => {
  try {
    socket.user = await authService.getSocketUserFromToken(socket.handshake.auth?.token);
    next();
  } catch {
    next(new Error('Invalid or expired authentication token'));
  }
};

module.exports = authenticateSocket;

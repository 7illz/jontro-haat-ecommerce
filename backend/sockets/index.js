const authenticateSocket = require('./socketAuth');
const registerChatHandlers = require('./chatSocket');

const configureSockets = (io) => {
  io.use(authenticateSocket);
  io.on('connection', (socket) => {
    registerChatHandlers(io, socket);
  });
};

module.exports = configureSockets;

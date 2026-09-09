const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const { port, mongoUri } = require('./config/env');
const { socketCorsOptions } = require('./config/cors');
const configureSockets = require('./sockets');

const server = http.createServer(app);
const io = new Server(server, { cors: socketCorsOptions });

configureSockets(io);

const startServer = async () => {
  await mongoose.connect(mongoUri);
  console.log('MongoDB Connected');
  server.listen(port, () => console.log(`Server running on port ${port}`));
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start server:', error);
    process.exitCode = 1;
  });
}

module.exports = { app, server, io, startServer };

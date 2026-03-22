require('dotenv').config();
const os = require('os');
const isDevelopment = (process.env.NODE_ENV === 'development');
const express = require('express');
const app = express();
const fs = require('fs');

const options = {
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.crt')
};

const server = require('https').Server(options, app);

const port = process.env.PORT || 443;

app.use(express.static('public'));

const { Server } = require("socket.io");
const io = new Server(server);

server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`cmd+click ↓`);
        console.log(`https://${iface.address}:${port}\n`);
      }
    }
  }
});

const clients = {};
io.on('connection', socket => {
  clients[socket.id] = { id: socket.id };

  socket.on('disconnect', () => {
    delete clients[socket.id];
    io.emit('clients', clients);
  });

  socket.on('signal', (peerId, signal) => {
    console.log(`Received signal from ${socket.id} to ${peerId}`);
    io.to(peerId).emit('signal', socket.id, signal, socket.id);
  });

  // io.emit('clients', clients);

});
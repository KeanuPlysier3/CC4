require('dotenv').config();
const os = require('os');
const isDevelopment = (process.env.NODE_ENV === 'development');
const express = require('express');
const app = express();
const fs = require('fs');
const { execSync } = require('child_process');//let`s us run commands

// const generateCertificate = (ip) => {
//   const certExists = fs.existsSync('./cert.pem') && fs.existsSync('./key.pem');//check if the certificates already exist
//   const ipFile = '.lastIP';
//   const lastIP = fs.existsSync(ipFile) ? fs.readFileSync(ipFile, 'utf8') : '';

//   if (certExists && lastIP === ip) {
//     console.log(`Using existing certificate for ${ip}`);
//     return;
//   }

//   console.log(`Generating certificate for ${ip}...`);
//   try {
//     execSync(
//       `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=${ip}" -addext "subjectAltName=DNS:localhost,IP:${ip}"`,
//       { stdio: 'ignore' }
//     );
//     fs.writeFileSync(ipFile, ip);//save ip -> helps with remembering
//     console.log(`Certificate generated.`);
//   } catch (err) {
//     console.error('Failed to generate certificate. Make sure openssl is installed.');
//     process.exit(1);
//   }
// };



// const getLocalIP = () => {
//   const networkInterfaces = os.networkInterfaces();//list of all network interfaces devices could use to connect to  this server. (e.g. wifi, ethernet, etc.)
//   for (const interfaceName in networkInterfaces) { // for each interface name (e.g. "eth0", "wifi0", "lo", etc.)
//     for (const iface of networkInterfaces[interfaceName]) { // for each interface object in that array (e.g. { family: 'IPv4', address: '192.168.1.2' })
//       if (iface.family === 'IPv4' && !iface.internal) { //check if it is an IPv$ and not internal
//         return iface.address
//       }
//     }
//   }
// }

// const localIP = getLocalIP();


// let options = {};
// if (isDevelopment) {
//   generateCertificate(localIP);//generate certifacate for the local ip if necessary
//   options = {
//     key: fs.readFileSync('./key.pem'),
//     cert: fs.readFileSync('./cert.pem')
//   };
// }

const options = {
  key: fs.readFileSync('./localhost.key'),
  cert: fs.readFileSync('./localhost.crt')
};
const server = require('https').Server(options, app); // httpS instead of http

// const server = require(isDevelopment ? 'https' : 'http').Server(options, app);
const port = process.env.PORT || 443;

app.use(express.static('public'));


const { Server } = require("socket.io");
const io = new Server(server);

// server.listen(port, () => {
//   const protocol = isDevelopment ? 'https' : 'http';

//   console.log(`\n Server running!`);
//   //console.log(`Local: ${protocol}://localhost:${port}`);
//   console.log(`Network: ${protocol}://${localIP}:${port}\n`);
// });

server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // console.log(`http://${iface.address}`);
        console.log(`https://${iface.address}:${port}\n`);
      }
    }
  }
  console.log(`https://localhost:${port}`);
  // console.log(`App listening on port ${port}!`);
});

const clients = {};
io.on('connection', socket => {
  clients[socket.id] = { id: socket.id };

  socket.on('disconnect', () => {
    delete clients[socket.id];
    io.emit('clients', clients);
  });

  socket.on('peerOffer', (peerId, offer) => {
    console.log(`Received peerOffer from ${socket.id} to ${peerId}`);
    io.to(peerId).emit('peerOffer', peerId, offer, socket.id);
  });

  socket.on('peerAnswer', (peerId, answer) => {
    console.log(`Received peerAnswer from ${socket.id} to ${peerId}`);
    io.to(peerId).emit('peerAnswer', peerId, answer, socket.id);
  });

  socket.on('peerIce', (peerId, candidate) => {
    console.log(`Received peerIce from ${socket.id} to ${peerId}`);
    io.to(peerId).emit('peerIce', peerId, candidate, socket.id);
  });

  io.emit('clients', clients);

});
# Keanu's Development Diary.

## concept:
The concept of my project is to build upon my previous project from last year (https://keanupl.be/clicker/) and create a new way of playing the clicker game.

In this new version, the player will be able to connect using their smartphone. By saying the words **two** or **three** into their phone, the game will recognize the command and determine whether to shoot a two-pointer or a three-pointer.

### steps:
- CONNECTING: establishing connection between peers.
- TRANSPORTING DATA: transporting data from peer to peer.
- MODEL: creating and implementing a model that understands which word we say (**two** or **three**).
- TWEAKING: the game will need some tweeks for it to actually work.


## connection: 

To establish a connection I think it was important to understand the following things.
- First thing is that we need a QR-code for the peers to find eachother. 
- Second is that we use the server as a middle man in the signalling.
- Third we need to incorporate ICE for the peers to find potential routes between them.

When looking at those points it becomes clear that this assignment is a mix of exercise made in class. The qr-code will deliver a url, inside the url we will find the socketID of the receiver. We can than use that socket ID inside the sender, and send a peerOffer. From that point it's the same as the webRTC exercise in class.


## server

To start this project I will start with creating the server-side, inside of index.js,
This will probably be very similar to the webRTC project provided to us.

At the moment I think the most important change is the listener, this needs to function for devices on the same network. I simply replaced:

```
server.listen(port, () => {
 console.log(`App listening on port ${port}!`);
});
```

with the snippent from the qr exercise:

```
server.listen(port, () => {
  const networkInterfaces = os.networkInterfaces();//list of all network interfaces devices could use to connect to  this server. (e.g. wifi, ethernet, etc.)
  for (const interfaceName in networkInterfaces) { // for each interface name (e.g. "eth0", "wifi0", "lo", etc.)
    for (const iface of networkInterfaces[interfaceName]) { // for each interface object in that array (e.g. { family: 'IPv4', address: '192.168.1.2' })
      if (iface.family === 'IPv4' && !iface.internal) { //check if it is an IPv$ and not internal
        console.log(`http://${iface.address}`);//log the adress in the terminal to make it easy to access
      }
    }
  }
  console.log(`App listening on port ${port}!`);
});

```

I asked several questions to my AI as I usually do. I always want to understand what I am doing and that is why I added comments next to it, that explain this snippet.

That way I also realised that I have to change the port number from 443 to 80 for http, but this might cause some problems in the future, as I vaguely remember that webRTC can only use https.

![alt text](image.png) 

<br><br>
I usually try to understand the explanation, and than form my way of understanding it back. That way the AI can clearly see where I missunderstand certain concepts. This time I seem to have understood the concept fairly well.
<br><br>


![alt text](image-1.png)

As for now, the server works and directs us to the index.html(receiver).
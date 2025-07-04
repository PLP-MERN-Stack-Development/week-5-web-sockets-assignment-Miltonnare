const express=require('express');
const cors=require('cors');
const http=require('http');

const {Server}=require('socket.io');

const app=express();

app.use(cors());

const server=http.createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*"
  }
});

// Store connected users with their socket IDs
const connectedUsers = new Map(); // userName -> socketId
const userSockets = new Map(); // socketId -> userName

io.on("connection",(socket)=>{
  console.log("User Conected", socket.id);

  socket.on('set-username',(userName, ack)=>{
    // Remove old username if it exists
    if (socket.userName) {
      connectedUsers.delete(socket.userName);
      userSockets.delete(socket.id);
    }
    
    socket.userName=userName;
    connectedUsers.set(userName, socket.id);
    userSockets.set(socket.id, userName);
    
    // Broadcast updated online users list
    io.emit('user-status-update', {
      type: 'user-online',
      userName: userName,
      onlineUsers: Array.from(connectedUsers.keys())
    });
    
    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

   socket.on('chat-message', (data) => {
    io.emit('chat-message', data);
  });

   socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username); 
  });

  socket.on("disconnect",()=>{
    console.log("User disconnected",socket.id);
    
    // Remove user from online list
    const userName = userSockets.get(socket.id);
    if (userName) {
      connectedUsers.delete(userName);
      userSockets.delete(socket.id);
      
      // Broadcast updated online users list
      io.emit('user-status-update', {
        type: 'user-offline',
        userName: userName,
        onlineUsers: Array.from(connectedUsers.keys())
      });
    }
  });
}

);

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});
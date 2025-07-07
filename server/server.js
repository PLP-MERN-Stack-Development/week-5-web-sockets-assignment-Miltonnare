const express=require('express');
const cors=require('cors');
const http=require('http');
const { v4: uuidv4 } = require('uuid');

const {Server}=require('socket.io');

const app=express();

app.use(cors());

const server=http.createServer(app);
const io=new Server(server,{
  cors:{
    origin:"*"
  }
});

// Store connected users with their socket IDs and rooms
const connectedUsers = new Map(); 
const userSockets = new Map(); 
const roomUsers = new Map(); 

// Store message reactions: messageId -> { emoji: [userName, ...] }
const messageReactions = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on('join-room', ({ userName, room }, ack) => {
    // Remove user from previous room if exists
    if (socket.userName && socket.room) {
      if (roomUsers.has(socket.room)) {
        roomUsers.get(socket.room).delete(socket.userName);
        if (roomUsers.get(socket.room).size === 0) roomUsers.delete(socket.room);
      }
    }
    socket.join(room);
    socket.userName = userName;
    socket.room = room;
    connectedUsers.set(userName, { socketId: socket.id, room });
    userSockets.set(socket.id, userName);
    if (!roomUsers.has(room)) roomUsers.set(room, new Set());
    roomUsers.get(room).add(userName);
    // Broadcast updated online users list to the room
    io.to(room).emit('user-status-update', {
      type: 'user-online',
      userName,
      onlineUsers: Array.from(roomUsers.get(room))
    });
    if (typeof ack === 'function') {
      ack({ success: true });
    }
  });

  socket.on('chat-message', (data) => {
    // data: { userName, msg, timestamp, room }
    console.log('Received chat message:', data);
    if (data.room) {
      // Assign a unique ID to each message if not present
      if (!data.id) data.id = uuidv4();
      console.log('Broadcasting message to room:', data.room);
      console.log('Message data:', data);
      io.to(data.room).emit('chat-message', data);
    } else {
      console.log('Message rejected - no room specified');
    }
  });

  // Read receipts
  socket.on('message-read', ({ messageId, room, userName }) => {
    // Broadcast to the room that this user has read the message
    io.to(room).emit('message-read', { messageId, userName });
  });

  socket.on('typing', ({ userName, room }) => {
    socket.to(room).emit('typing', userName);
  });

  // Message reactions
  socket.on('message-reaction', ({ messageId, emoji, userName, room }) => {
    if (!messageId || !emoji || !userName || !room) return;
    if (!messageReactions.has(messageId)) messageReactions.set(messageId, {});
    const reactions = messageReactions.get(messageId);
    if (!reactions[emoji]) reactions[emoji] = [];
    // Toggle reaction: add if not present, remove if present
    if (reactions[emoji].includes(userName)) {
      reactions[emoji] = reactions[emoji].filter(u => u !== userName);
    } else {
      reactions[emoji].push(userName);
    }
    messageReactions.set(messageId, reactions);
    // Broadcast updated reactions to the room
    io.to(room).emit('message-reaction-update', { messageId, reactions });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    const userName = userSockets.get(socket.id);
    const room = socket.room;
    if (userName && room) {
      connectedUsers.delete(userName);
      userSockets.delete(socket.id);
      if (roomUsers.has(room)) {
        roomUsers.get(room).delete(userName);
        if (roomUsers.get(room).size === 0) roomUsers.delete(room);
      }
      // Broadcast updated online users list to the room
      if (room) {
        io.to(room).emit('user-status-update', {
          type: 'user-offline',
          userName,
          onlineUsers: roomUsers.has(room) ? Array.from(roomUsers.get(room)) : []
        });
      }
    }
  });
});

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});
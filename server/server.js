
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

io.on("connection",(socket)=>{
  console.log("User Conected", socket.id);
  socket.on('set-username',(userName)=>{
    socket.userName=userName;
    io.emit('user-online',{id:socket.id, userName});
  });

  // Send all currently online users to the new user
  const onlineUsers = [];
  for (let [id, s] of io.of('/').sockets) {
    if (s.userName) {
      onlineUsers.push({ id, userName: s.userName });
    }
  }
  socket.emit('online-users', onlineUsers);

   socket.on('chat-message', (data) => {
    io.emit('chat-message', data);
  });

   socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username); 
  });

  socket.on("disconnect",()=>{
    console.log("User disconnected",socket.id);
    if (socket.userName) {
      io.emit('user-offline', socket.id);
    }
  });
}

);

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});
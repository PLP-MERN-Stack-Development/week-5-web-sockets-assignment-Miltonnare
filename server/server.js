
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

  socket.on('set-username',(userName, ack)=>{
    socket.userName=userName;
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
    
  });
}

);

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});
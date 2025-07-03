
const express=require('express');
const cors=require('cors');
const http=require('http');

const {server}=require('socket.io');

const app=express();

app.use(cors());

const server=http.createServer(app);
const io=new server(server,{
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

  socket.on("disconnect",(socket)=>{
    console.log("User disconnected",socket.id);
  });
}

);

server.listen(process.env.PORT||3000,()=>{
  console.log(`Server running on Port:${process.env.PORT||3000}`);
});
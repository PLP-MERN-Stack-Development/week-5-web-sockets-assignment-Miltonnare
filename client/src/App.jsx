import { useEffect,useState } from "react";

import {io} from 'socket.io-client';


const socket=io(import.meta.env.SOCKET_URL)

function App(){
  useEffect(()=>{
    socket.on('connect',()=>{
      console.log("Connected to Server:",socket.id);
    });
    return ()=>socket.disconnect();
  },[]);


  return(
    <div>
      <h1>CHAT APP</h1>
    </div>

  )
}

export default App;

import { useState,useEffect } from "react";

function Chat({socket,userName}){

    const [message, setMessage]=useState('');
    const [messages, setMessages]=useState([]);


    const sendMessage=()=>{
        if(!message.trim()) return;
        socket.emit('chat-message',{
            userName,
            msg:message,
            timestamp:Date.now()
        });

        setMessage('')

};

useEffect(()=>{
    socket.on('chat-message',(data)=>{
        setMessages((prev)=>[...prev,data])
    });

    return () =>socket.off('chat-message')
})

return(
    <div>
        <input type="text" 
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        placeholder="Type Message"
        />
        <button onClick={sendMessage}>Send</button>
    </div>
)
}

export default Chat;
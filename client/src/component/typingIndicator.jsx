import {useEffect } from "react";

function TypingIndicator({socket,setTypingUser}){


    useEffect(()=>{
        socket.on('typing',(user)=>{
            setTypingUser(user);
        });

        return ()=>socket.off('typing');
    },[socket]);

    return null;
}

export default TypingIndicator;
import { useEffect, useState } from "react";
import Login from "./component/login";
import { io } from 'socket.io-client';
import Chat from "./component/chat";

const socket = io(import.meta.env.VITE_SOCKET_URL);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected to Server:", socket.id);
    });

    return () => socket.disconnect();
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };

  return (
    <div>
  <h1>CHAT APP</h1>
  {!isLoggedIn ? (
    <Login socket={socket} onLogin={handleLogin} />
  ) : (
    <Chat socket={socket} username={username} />
  )}
</div>
  );
}

export default App;

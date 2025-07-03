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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4 tracking-wide">Chat App</h1>
        {!isLoggedIn ? (
          <Login socket={socket} onLogin={handleLogin} />
        ) : (
          <Chat socket={socket} username={username} />
        )}
      </div>
    </div>
  );
}

export default App;

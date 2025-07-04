import { useEffect, useState } from "react";
import Login from "./component/login";
import { io } from 'socket.io-client';
import Chat from "./component/chat";

const socket = io(import.meta.env.VITE_SOCKET_URL);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected to Server:", socket.id);
      setIsSocketConnected(true);
    });
    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const handleLogin = (name) => {
    socket.emit('set-username', name, (res) => {
      if (res && res.success) {
        setUserName(name);
        setIsLoggedIn(true);
      } else {
        alert('Failed to set username.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4 tracking-wide">Chat App</h1>
        {isLoggedIn && (
          <div className="text-xs text-center mb-2 text-gray-700">
            Logged in as: <span className="font-semibold text-orange">{userName}</span>
          </div>
        )}
        {/* Socket status: Connected */}
        {!isLoggedIn ? (
          <Login socket={socket} onLogin={handleLogin} />
        ) : (
          <Chat socket={socket} userName={userName} />
        )}
      </div>
    </div>
  );
}

export default App;

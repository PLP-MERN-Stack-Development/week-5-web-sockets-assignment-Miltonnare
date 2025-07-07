import { useEffect, useState } from "react";
import Login from "./component/login";
import { io } from 'socket.io-client';
import Chat from "./component/chat";

const socket = io(import.meta.env.VITE_SOCKET_URL);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [room, setRoom] = useState('General');
  const [roomInput, setRoomInput] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected to Server:", socket.id);
      setIsSocketConnected(true);
    });
    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });
    
    // Listen for user status updates
    socket.on('user-status-update', (data) => {
      console.log('User status update:', data);
      setOnlineUsers(data.onlineUsers);
    });
    
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-status-update');
      // Removed socket.disconnect() to keep the connection alive
    };
  }, []);

  const handleLogin = (name) => {
    console.log('handleLogin called with:', name);
    console.log('Current room state:', { room, roomInput });
    
    // Use the latest room input value if present
    const selectedRoom = roomInput.trim() ? roomInput.trim() : room;
    console.log('Selected room for login:', selectedRoom);
    
    setRoom(selectedRoom); // update state for display
    
    console.log('Emitting join-room with:', { userName: name, room: selectedRoom });
    socket.emit('join-room', { userName: name, room: selectedRoom }, (res) => {
      console.log('join-room response:', res);
      if (res && res.success) {
        console.log('Login successful, setting state');
        setUserName(name);
        setIsLoggedIn(true);
      } else {
        console.log('Login failed');
        alert('Failed to join room.');
      }
    });
  };

  // Room selection UI
  const roomSelector = (
    <div className="flex flex-col gap-2 mb-2">
      <label className="text-xs font-semibold text-gray-700">Select or create a room/channel:</label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Room name (default: General)"
          value={roomInput}
          onChange={e => {
            setRoomInput(e.target.value);
            setRoom(e.target.value.trim() ? e.target.value.trim() : 'General');
          }}
          className="border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1"
        />
      </div>
      <div className="text-xs text-gray-500">Current room: <span className="font-bold">{roomInput.trim() ? roomInput.trim() : room}</span></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-4 tracking-wide">Chat App</h1>
        {isLoggedIn && (
          <div className="text-xs text-center mb-2 text-gray-700">
            Logged in as: <span className="font-semibold text-orange">{userName}</span> in <span className="font-semibold text-blue-700">{room}</span>
          </div>
        )}
        {!isLoggedIn ? (
          <>
            {roomSelector}
            <Login socket={socket} onLogin={handleLogin} />
          </>
        ) : (
          <Chat socket={socket} userName={userName} onlineUsers={onlineUsers} room={room} />
        )}
      </div>
    </div>
  );
}

export default App;

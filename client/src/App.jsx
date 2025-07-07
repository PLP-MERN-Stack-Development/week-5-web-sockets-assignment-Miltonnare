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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(!socket.connected);
    socket.on('connect', () => {
      setIsSocketConnected(true);
      setLoading(false);
    });
    socket.on('disconnect', () => {
      setIsSocketConnected(false);
      setLoading(true);
      setError('Disconnected from server. Trying to reconnect...');
    });
    socket.on('user-status-update', (data) => {
      setOnlineUsers(data.onlineUsers);
    });
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-status-update');
    };
  }, []);

  const handleLogin = (name) => {
    setLoading(true);
    setError('');
    const selectedRoom = roomInput.trim() ? roomInput.trim() : room;
    setRoom(selectedRoom);
    socket.emit('join-room', { userName: name, room: selectedRoom }, (res) => {
      setLoading(false);
      if (res && res.success) {
        setUserName(name);
        setIsLoggedIn(true);
      } else {
        setError('Failed to join room. Please try again.');
      }
    });
  };

  // Room selection UI
  const roomSelector = (
    <div className="flex flex-col gap-2 mb-2">
      <label className="text-xs font-semibold text-gray-700">Select or create a room/channel:</label>
      <div className="flex gap-2 flex-col sm:flex-row">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-2 sm:p-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-700 mb-2 sm:mb-4 tracking-wide">Chat App</h1>
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-xs text-center">{error}</div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-blue-600 text-xs mb-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            {isSocketConnected ? 'Joining room...' : 'Connecting to server...'}
          </div>
        )}
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

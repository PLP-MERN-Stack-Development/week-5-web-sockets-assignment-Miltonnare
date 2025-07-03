import { useState } from 'react';

function Login({ socket, onLogin }) {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (!username.trim()) return;
    socket.emit('set-username', username);
    onLogin(username);
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>
    </div>
  );
}

export default Login;

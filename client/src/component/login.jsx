import { useState } from 'react';

function Login({ socket, onLogin }) {
  const [userName, setUserName] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login button clicked');
    console.log('Socket connected:', socket.connected);
    if (!userName.trim()) return;
    try {
      socket.emit('set-username', userName, (res) => {
        console.log('set-username response:', res);
        if (res && res.success) {
          onLogin(userName);
          console.log("Username",userName);
        } else {
          alert('Failed to set username.');
        }
      });
    } catch (err) {
      alert('Socket error: ' + err.message);
    }
  };

  socket.on("disconnect", (reason) => {
    console.log("User disconnected", socket.id, "Reason:", reason);
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="Enter username"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
      >
        Login
      </button>
    </form>
  );
}

export default Login;

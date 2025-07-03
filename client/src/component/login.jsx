import { useState } from 'react';

function Login({ socket, onLogin }) {
  const [username, setUsername] = useState('');

  const handleLogin = () => {
    if (!username.trim()) return;
    socket.emit('set-username', username);
    onLogin(username);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;

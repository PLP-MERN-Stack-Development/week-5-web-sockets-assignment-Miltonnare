import TypingIndicator from "./typingIndicator";
import { useState, useEffect } from "react";

function Chat({ socket, userName }) {

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);


    const sendMessage = () => {
        if (!message.trim()) return;
        socket.emit('chat-message', {
            userName,
            msg: message,
            timestamp: Date.now()
        });
        setMessage('')
    };

    useEffect(() => {
        socket.on('chat-message', (data) => {
            setMessages((prev) => [...prev, data])
        });
        return () => socket.off('chat-message')
    }, [socket]);

    useEffect(() => {
        // Listen for all currently online users
        socket.on('online-users', (users) => {
            setOnlineUsers(users);
        });
        // Listen for user-online events
        socket.on('user-online', ({ id, userName }) => {
            setOnlineUsers((prev) => {
                if (!prev.some(u => u.id === id)) {
                    return [...prev, { id, userName }];
                }
                return prev;
            });
        });
        // Listen for user disconnects
        socket.on('user-offline', (id) => {
            setOnlineUsers((prev) => prev.filter(u => u.id !== id));
        });
        return () => {
            socket.off('online-users');
            socket.off('user-online');
            socket.off('user-offline');
        };
    }, [socket]);

    return (
        <div className="flex flex-col h-96">
            {/* Online users list */}
            <div className="flex gap-2 mb-2 flex-wrap">
                {onlineUsers.map(u => (
                    <span key={u.id} className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
                        {u.userName}
                    </span>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.userName === userName ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm ${msg.userName === userName ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            <span className="font-semibold mr-2">{msg.userName}</span>
                            <span>{msg.msg}</span>
                            <div className="text-xs text-right text-gray-400 mt-1">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
                        </div>
                    </div>
                ))}
            </div>
            <TypingIndicator socket={socket} setTypingUser={setTypingUser} />
            {typingUser && <p className="text-xs text-gray-500 mb-1">{typingUser} is typing...</p>}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        socket.emit('typing', userName);
                    }}
                    placeholder="Type Message"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    onKeyDown={e => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition"
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default Chat;
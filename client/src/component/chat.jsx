import TypingIndicator from "./typingIndicator";
import { useState, useEffect } from "react";

function Chat({ socket, userName, onlineUsers }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState('');


    const sendMessage = () => {
        console.log('Send button clicked');
        console.log('Socket connected:', socket.connected);
        if (!message.trim()) return;
        socket.emit('chat-message', {
            userName,
            msg: message,
            timestamp: Date.now()
        });
        setMessage('')
    };

    useEffect(() => {
        const handleMessage = (data) => {
            // Log for debugging
            console.log('Received message:', data);
            if (data && typeof data.userName !== 'undefined' && typeof data.msg !== 'undefined') {
                setMessages((prev) => [...prev, data]);
            }
        };
        socket.on('chat-message', handleMessage);
        return () => socket.off('chat-message', handleMessage);
    }, [socket]);



    // Debug: log userName
    console.log('Chat userName prop:', userName);
    return (
        <div className="flex flex-col h-96">
            {/* Online Users List */}
            <div className="mb-3 p-2 bg-gray-100 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Online Users ({onlineUsers.length})</h3>
                <div className="flex flex-wrap gap-1">
                    {onlineUsers.map((user, index) => (
                        <div key={index} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${user === userName ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <span className={`text-xs ${user === userName ? 'font-bold text-green-700' : 'text-gray-600'}`}>
                                {user}
                            </span>
                            {index < onlineUsers.length - 1 && <span className="text-gray-400">,</span>}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                {messages.map((msg, idx) => {
                  const colors = [
                    'bg-blue-500 text-white',
                    'bg-green-500 text-white',
                    'bg-purple-500 text-white',
                    'bg-pink-500 text-white',
                    'bg-yellow-400 text-gray-900',
                    'bg-red-500 text-white',
                    'bg-indigo-500 text-white',
                    'bg-teal-500 text-white',
                  ];
                  function hashUser(str) {
                    let hash = 0;
                    for (let i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    return Math.abs(hash);
                  }
                  const colorClass = msg.userName === userName
                    ? 'bg-blue-700 text-white' 
                    : colors[hashUser(msg.userName || '') % colors.length];
                  return (
                    <div key={idx} className={`flex ${msg.userName === userName ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm ${colorClass} flex flex-col`}>
                        <div className="flex w-full">
                          <span className="font-semibold mr-2 text-left w-full block">{msg.userName || 'Unknown'}</span>
                        </div>
                        <span>{msg.msg}</span>
                        <div className="text-xs text-right text-gray-200/80 mt-1">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
                      </div>
                    </div>
                  );
                })}
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
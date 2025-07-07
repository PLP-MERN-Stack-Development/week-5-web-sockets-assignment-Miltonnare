import TypingIndicator from "./typingIndicator";
import { useState, useEffect, useRef } from "react";

function Chat({ socket, userName, onlineUsers, room }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState('');
    const [readBy, setReadBy] = useState({}); // { messageId: [userName, ...] }
    const [reactions, setReactions] = useState({}); // { messageId: { emoji: [userName, ...] } }
    const messagesEndRef = useRef(null);
    const availableReactions = [
        { emoji: '👍', label: 'Like' },
        { emoji: '❤️', label: 'Love' },
        { emoji: '😂', label: 'Haha' },
        { emoji: '😮', label: 'Wow' },
        { emoji: '😢', label: 'Sad' },
        { emoji: '👏', label: 'Clap' },
    ];

    const sendMessage = () => {
        console.log('Send button clicked');
        console.log('Socket connected:', socket.connected);
        if (!message.trim()) return;
        socket.emit('chat-message', {
            userName,
            msg: message,
            timestamp: Date.now(),
            room
        });
        setMessage('')
    };

    
    useEffect(() => {
        if (window.Notification && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    
    useEffect(() => {
        const handleMessage = (data) => {
            // Log for debugging
            console.log('Received message:', data);
            console.log('Current room:', room);
            console.log('Message room:', data.room);
            console.log('Room match:', data.room === room);
            
            if (data && typeof data.userName !== 'undefined' && typeof data.msg !== 'undefined') {
                console.log('Adding message to state');
                setMessages((prev) => [...prev, data]);
                
                if (document.visibilityState !== 'visible' && data.userName !== userName && window.Notification && Notification.permission === 'granted') {
                    new Notification(`New message from ${data.userName}`, {
                        body: data.msg.length > 60 ? data.msg.slice(0, 60) + '...' : data.msg,
                        icon: '/vite.svg'
                    });
                }
            } else {
                console.log('Message filtered out - missing required fields');
            }
        };
        socket.on('chat-message', handleMessage);
        return () => socket.off('chat-message', handleMessage);
    }, [socket, room, userName]);

   
    useEffect(() => {
        const handleRead = ({ messageId, userName: reader }) => {
            setReadBy(prev => ({
                ...prev,
                [messageId]: prev[messageId] ? [...new Set([...prev[messageId], reader])] : [reader]
            }));
        };
        socket.on('message-read', handleRead);
        return () => socket.off('message-read', handleRead);
    }, [socket]);

    
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.id) {
                socket.emit('message-read', { messageId: lastMsg.id, room, userName });
            }
        }
        
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, room, userName, socket]);

 
    useEffect(() => {
        const handleReactionUpdate = ({ messageId, reactions: newReactions }) => {
            setReactions(prev => ({ ...prev, [messageId]: newReactions }));
        };
        socket.on('message-reaction-update', handleReactionUpdate);
        return () => socket.off('message-reaction-update', handleReactionUpdate);
    }, [socket]);

    
    useEffect(() => {
        setMessages([]);
        setReadBy({});
        setReactions({});
    }, [room]);

    const handleReact = (messageId, emoji) => {
        socket.emit('message-reaction', { messageId, emoji, userName, room });
    };

    // Debug: log userName
    console.log('Chat userName prop:', userName);
    return (
        <div className="flex flex-col h-96 max-h-[80vh]">
            {/* Online Users List */}
            <div className="mb-3 p-2 bg-gray-100 rounded-lg overflow-x-auto">
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
            
            <div className="flex-1 overflow-y-auto mb-2 bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
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
                  const isRead = readBy[msg.id]?.length >= onlineUsers.length;
                  return (
                    <div key={msg.id || idx} className={`flex ${msg.userName === userName ? 'justify-end' : 'justify-start'} mb-2`}>
                      <div className={`max-w-[80vw] sm:max-w-xs px-3 py-2 rounded-2xl shadow text-sm ${colorClass} flex flex-col`}>
                        <div className="flex w-full">
                          <span className="font-semibold mr-2 text-left w-full block truncate">{msg.userName || 'Unknown'}</span>
                        </div>
                        <span className="break-words">{msg.msg}</span>
                        <div className="text-xs text-right text-gray-200/80 mt-1 flex items-center gap-1">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                          {msg.userName === userName && msg.id && (
                            <span className="ml-2 text-green-500 text-xs font-bold">
                              {isRead ? '✓✓ Read' : (readBy[msg.id]?.length ? `✓ Read by ${readBy[msg.id].length}` : '')}
                            </span>
                          )}
                        </div>
                        {/* Message Reactions UI */}
                        {msg.id && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {availableReactions.map(r => (
                              <button
                                key={r.emoji}
                                className={`text-lg px-1 rounded hover:bg-gray-200 focus:outline-none ${reactions[msg.id]?.[r.emoji]?.includes(userName) ? 'bg-blue-100' : ''}`}
                                title={r.label}
                                onClick={() => handleReact(msg.id, r.emoji)}
                                type="button"
                              >
                                {r.emoji}
                                {reactions[msg.id]?.[r.emoji]?.length > 0 && (
                                  <span className="ml-1 text-xs text-gray-600">{reactions[msg.id][r.emoji].length}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
            </div>
            <TypingIndicator socket={socket} setTypingUser={setTypingUser} />
            {typingUser && <p className="text-xs text-gray-500 mb-1">{typingUser} is typing...</p>}
            <div className="flex gap-2 flex-col sm:flex-row w-full">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        socket.emit('typing', { userName, room });
                    }}
                    placeholder="Type Message"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
                    onKeyDown={e => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition text-sm"
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default Chat;
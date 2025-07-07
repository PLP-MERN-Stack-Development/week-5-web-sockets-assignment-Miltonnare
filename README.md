
# Real-Time Chat Application with Socket.io

Focuses on building a real-time chat application using Socket.io, implementing bidirectional communication between clients and server.

## 🚀 Features

- 🔗 Real-time messaging using Socket.io
- 👤 Simple username-based login
- 💬 Global and private chat rooms
- ✍️ Typing indicators
- ✅ Online/offline user tracking
- 💖 Message reactions (like, love, etc.)
- 📥 File/image sharing (optional)
- 🔔 Real-time and browser notifications
- 📱 Responsive design for mobile & desktop
- 💾 MongoDB integration for persistent storage

---
## 🏗️ Tech Stack

### Frontend
- React
- Socket.io-client
- TailwindCSS / CSS
 ### Backend
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose

---

## Project Structure

```
socketio-chat/
├── client/                 # React front-end
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── socket/         # Socket.io client setup
│   │   └── App.jsx         # Main application component
│   └── package.json        # Client dependencies
├── server/                 # Node.js back-end
│   ├── config/             # Configuration files
│   ├── controllers/        # Socket event handlers
│   ├── models/             # Data models
│   ├── socket/             # Socket.io server setup
│   ├── utils/              # Utility functions
│   ├── server.js           # Main server file
│   └── package.json        # Server dependencies
└── README.md               # Project documentation
```

## 🔌 Socket.io Events Summary

Event 	           Direction	           Description

connect	client → server	Client connects to socket server

set-username	client → server	Assigns username to connected socket

chat-message	client ↔ server	Broadcasts message to room

join-room	client → server	Joins a specific room

typing	client → server	Emits typing status

reaction-updated	server → client	Broadcasts updated reactions on message

add-reaction	client → server	React to a message

disconnect	server → client	Handle user disconnect

## Screenshots
<img width="599" alt="webs" src="https://github.com/user-attachments/assets/fb6f403a-3738-4c65-90df-58be1d546ea4" />
<img width="445" alt="webs2" src="https://github.com/user-attachments/assets/93b11e2f-75d3-4bc4-8faf-d240bcd05b33" />


## LIVE DEMO
[CLICK HERE](https://web-sockets-lovat.vercel.app/)

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser
- Basic understanding of React and Express

## Future Improvements

🔐 JWT authentication

🔎 Search messages

📅 Message pagination

🛎️ Custom notification sounds

🌐 WebSocket namespaces and channels

🌍 Language support / i18n

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.
## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Building a Chat Application with Socket.io](https://socket.io/get-started/chat) 

# 🚀 Real-Time Chat and Video Conference App (Zoom)

Welcome to our Real-Time Chat and Video Conference App! This project lets you join chat rooms, send messages, and have video calls with others. Let's dive in to see what it offers and how you can use it!

## 🌟 Features

- **Chat in Real-Time**: Join rooms and chat with friends instantly.
- **Video Calls**: Start video calls with anyone in the same room.
- **User Nicknames**: Identify yourself with a simple nickname.
- **Dynamic Rooms**: Create and join rooms easily, see how many people are in each room.
- **Media Control**: Manage your camera and microphone during calls.
- **Live Updates**: Real-time communication using WebSockets.

## 🛠️ Technologies Used

### Frontend

- **HTML & CSS**: Structure and styling.
- **JavaScript (ES6+)**: Core functionality.
- **React**: Building interactive UIs.
- **TypeScript**: Type safety and better code management.

### Backend

- **Node.js**: Backend runtime.
- **Express**: Web framework for handling requests.
- **socket.io**: WebSocket library for real-time communication.
- **WebRTC**: Peer-to-peer video and audio communication.

### DevOps

- **npm**: Package management.
- **Babel**: Transpiling modern JavaScript.
- **Webpack**: Bundling JavaScript modules.
- **Express Static Middleware**: Serving static files.

### Database

- **MongoDB / PostgreSQL**: (Future integration for storing data).

## 🚀 Getting Started

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/ChanwooBrianKim/Zoom.git
   cd Zoom
2. **Install Dependencies**:
   ```bash
   npm install
3. **Run the App**:
   ```bash
   npm start
4. **Open in Browse**:
   ```bash
   http://localhost:3000
   
## 🤔 How to Use

- **Join a Room**: Enter a room name and hit join.
- **Send Messages**: Type your message and hit send.
- **Video Calls**: Allow camera and microphone access, then join a room.
- **Mute/Unmute & Toggle Camera**: Use the buttons to control your audio and video.

## 📂 Project Structure

### Frontend
- **index.html**: Main HTML file.
- **styles.css**: Styling for the app.
- **client.js**: Handles chat and video functionalities on the client side.

### Backend
- **server.js**: Sets up Express and WebSocket server.
- **socketHandlers.js**: Manages WebSocket events.

## 🚀 Future Enhancements

- **User Authentication**: Adding secure login.
- **Chat History**: Save and display past messages.
- **UI Improvements**: Making the interface even more user-friendly.

## 🙏 Acknowledgements
- **socket.io**: For real-time WebSocket communication.
- **WebRTC**: For peer-to-peer video communication.
- **Express**: For the web server framework.
- **MDN Web Docs**: For great documentation and resources.
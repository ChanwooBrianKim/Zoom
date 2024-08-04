// import http from "http";
// import { Server } from "socket.io";
// import { instrument } from "@socket.io/admin-ui";
// import express from "express";

// const app = express();

// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));
// app.get("/", (_, res) => res.render("home"));
// app.get("/*", (_, res) => res.redirect("/"));

// const httpServer = http.createServer(app);
// const wsServer = new Server(httpServer, {
//   cors: {
//     origin: ["https://admin.socket.io"],
//     credentials: true,
//   },
// });

// // Zoom video
// wsServer.on("connection", (socket) => {
//   socket.on("join_room", (roomName) => {
//     socket.join(roomName);
//     socket.to(roomName).emit("welcome");
//   });
//   socket.on("offer", (offer, roomName) => {
//     socket.to(roomName).emit("offer", offer);
//   });
//   socket.on("answer", (answer, roomName) => {
//     socket.to(roomName).emit("answer", answer);
//   });
//   socket.on("ice", (ice, roomName) => {
//     socket.to(roomName).emit("ice", ice);
//   });
// });

// instrument(wsServer, {
//   auth: false
// });

// function publicRooms() {
//   const {
//     sockets: {
//       adapter: { sids, rooms },
//     },
//   } = wsServer;
//   const publicRooms = [];
//   rooms.forEach((_, key) => {
//     if (sids.get(key) === undefined) {
//       publicRooms.push(key);
//     }
//   });
//   return publicRooms;
// }

// function countRoom(roomName) {
//   return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

// wsServer.on("connection", (socket) => {
//   socket["nickname"] = "Anon";
//   socket.onAny((event) => {
//     console.log(`Socket Event: ${event}`);
//   });
//   socket.on("enter_room", (roomName, done) => {
//     socket.join(roomName); // Join the room
//     done(); // Done function
//     socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // Send "welcome" everybody in the roomName
//     wsServer.sockets.emit("room_change", publicRooms());
//   });
//   socket.on("disconnecting", () => {
//     socket.rooms.forEach((room) =>
//       socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
//     );
//   });
//   socket.on("disconnect", () => {
//     wsServer.sockets.emit("room_change", publicRooms());
//   });
//   socket.on("new_message", (msg, room, done) => {
//     socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
//     done();
//   });
//   socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
// });

// const handleListen = () => console.log(`Listening on http://localhost:3000`);
// httpServer.listen(3000, handleListen);

// // file sharing using multer
// // const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const appp = express();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// app.post('/upload', upload.single('file'), (req, res) => {
//   res.send({ filePath: '/uploads/${req.file.filename}' });
// });

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import bodyParser from 'body-parser';
import path from 'path';

import './db.js'; // Ensure the database connection is established

import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { authenticateSocket } from './middlewares/auth.js';
import { publicRooms, countRoom, handleSocketConnection } from './socket.js';

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(path.resolve(), 'src/views')); // Updated to point to src/views

app.use('/public', express.static(path.join(path.resolve(), 'src/public')));
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.get('/', (_, res) => res.render('home'));
app.get('/login', (_, res) => res.render('login'));
app.get('/register', (_, res) => res.render('register'));
app.get('/*', (_, res) => res.redirect('/'));

app.use('/auth', authRoutes);
app.use('/upload', authenticateSocket, uploadRoutes);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

wsServer.use(authenticateSocket);
wsServer.on('connection', (socket) => handleSocketConnection(socket, wsServer));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

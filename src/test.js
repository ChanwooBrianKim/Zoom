import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import './db.js'; // Ensure db.js is imported to establish the database connection

import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { authenticateSocket } from './middlewares/auth.js';
import { publicRooms, countRoom, handleSocketConnection } from './socket.js';

dotenv.config();
const app = express();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');
app.set('views', path.join(path.resolve(), 'views'));
app.use('/public', express.static(path.join(path.resolve(), 'public')));
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

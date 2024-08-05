import Message from './models/Message.js';

export function publicRooms(wsServer) {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

// Returns the number of sockets in a given room
export function countRoom(roomName, wsServer) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

export function handleSocketConnection(socket, wsServer) {
// Sets the initial nickname of the socket to the username of the connected user
  socket['nickname'] = socket.user.username;
  // Logs all socket events for debugging purposes
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  // Joins the socket to a specified room and emits a welcome message to others in the room
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName, wsServer));
  });
  // Emits a goodbye message to each room the socket is in before it disconnects
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room, wsServer) - 1)
    );
  });
  // Emits an event to all sockets informing them of room changes when a socket disconnects
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms(wsServer));
  });

  socket.on('new_message', async (msg, room, done) => {
    // Saves a new message to the database
    const message = new Message({
      room,
      nickname: socket.nickname,
      message: msg,
    });
    await message.save();
    // emits the message to others in the room
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));

  // Emits a file shared event to all sockets
  socket.on('file_shared', (filePath) => {
    wsServer.emit('file_shared', filePath);
  });
}
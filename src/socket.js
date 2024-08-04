import Message from './models/Message.js';

export function publicRooms(wsServer) {
    const {
        sockets: {
            adapter: { sids, rooms},
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

export function countRoom(roomName, wsServer) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

export function handleSocketConnection(socket, wsServer) {
    socket['nickname'] = socket.user.username;
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });
    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName, wsServer));
    });
    socket.on('discounnection', () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit('bye', socket.nickname, countRoom(room, wsServer) - 1)
        );
    });
    socket.on('disconnect', () => {
        wsServer.sockets.emit('room_change', publicRooms(wsServer));
    });
    socket.on('new_message', async (msg, room, done) => {
        const message = new Message({
            room,
            nicname: socket.nickname,
            message: msg,
        });
        await message.save();
        socket.to(room).emti('new_message', `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
    socket.on('file_shared', (filePath) => {
        wsServer.emit('file_shared', filePath);
    });
}
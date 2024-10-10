import { Server } from 'socket.io';

// Function to get a list of all public rooms (rooms that are not private)
export function publicRooms(wsServer) {
    const {
        sockets: {
            adapter: { sids, rooms }, // Extracting sids (session IDs) and rooms from wsServer adapter
        },
    } = wsServer;

    const publicRooms = [];
    
    // Iterate through all the rooms and filter out private rooms (rooms that have session IDs)
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) { // Public rooms have no corresponding session ID
            publicRooms.push(key); // Add the room to the list of public rooms
        }
    });
    return publicRooms; // Return the list of public rooms
}

// Function to count the number of participants in a given room
export function countRoom(roomName, wsServer) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size; // Get the size of the room (number of sockets/clients)
}

// Function to handle all socket-related events for a new client connection
export function handleSocketConnection(socket, wsServer) {
    
    // Logs every socket event for monitoring/debugging
    socket.onAny((event) => {
        console.log(`Socket Event: ${event}`);
    });

    // Event handler for when a user enters a room
    socket.on('enter_room', (roomName, done) => {
        socket.join(roomName); // Add the socket to the specified room
        done(); // Acknowledge the event was successfully processed
        socket.to(roomName).emit('welcome', socket.id, countRoom(roomName, wsServer)); // Notify other users in the room that someone has joined
    });

    // Event handler for when the socket (user) is about to disconnect
    socket.on('disconnecting', () => {
        // Iterate through all the rooms the socket is connected to and notify the other participants
        socket.rooms.forEach((room) =>
            socket.to(room).emit('bye', socket.id, countRoom(room, wsServer) - 1)
        );
    });

    // Event handler for when the socket (user) has disconnected
    socket.on('disconnect', () => {
        // Emit the updated list of public rooms to all connected clients
        wsServer.sockets.emit('room_change', publicRooms(wsServer));
    });

    // Event handler for sending a new message in a room
    socket.on('new_message', (msg, room, done) => {
        socket.to(room).emit('new_message', msg); // Broadcast the message to everyone in the room
        done(); // Acknowledge that the message was successfully handled
    });

    // Event handler for setting the user's nickname
    socket.on('nickname', (nickname) => (socket['nickname'] = nickname)); // Store the user's nickname on the socket object

    // Event handler for file sharing
    socket.on('file_shared', (filePath) => {
        wsServer.emit('file_shared', filePath); // Broadcast the file path to all connected clients
    });
}

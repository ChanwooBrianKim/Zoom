import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import Chat from "../models/Chat";

export function initializeSocket(httpServer) {
  const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true,
    },
  });

  instrument(wsServer, {
    auth: false,
  });

  function publicRooms() {
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

  function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
  }

  wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
      console.log(`Socket Event: ${event}`);
    });

    socket.on("enter_room", async (roomName, done) => {
      socket.join(roomName);
      done();
      const messages = await Chat.find({ room: roomName }).sort({ timestamp: 1 }).exec();
      socket.emit("load_messages", messages);
      socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
      wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) =>
        socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
      );
    });

    socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("new_message", async (msg, room, done) => {
      const message = new Chat({ room, message: msg, sender: socket.nickname });
      await message.save();
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      done();
    });

    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  });
}

import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000'); // http & ws server will be run on the same port, 3000

// Run http & Websocket server at the same time
const server = http.createServer(app); // http server
const wss = new WebSocket.Server({ server }); // Websocket server

function onSocketClose() {
    console.log("Disconnected from the Browser ❌");
  }

function onSocketMessage(message) {
console.log(message);
}

const sockets = []; // Fake database to allow to interact with different browsers eg) Chrome and Firefox

// socket is created after the connection
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anonymous";
    console.log("Connected to Browser ✅");
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => {
      const message = JSON.parse(msg);
      switch (message.type) {
        case "new_message":
          sockets.forEach((aSocket) =>
            aSocket.send(`${socket.nickname}: ${message.payload}`)
          );
        case "nickname":
          socket["nickname"] = message.payload;
      }
    });
  });
  
  server.listen(3000, handleListen);
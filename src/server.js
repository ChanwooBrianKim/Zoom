import http from "http";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "./passportConfig";
import routes from "./routes";
import { initializeSocket } from "./utils/socket";

const app = express();

mongoose.connect("mongodb://localhost:27017/your-database").then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Error connecting to MongoDB", err);
});

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

const httpServer = http.createServer(app);
initializeSocket(httpServer);

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

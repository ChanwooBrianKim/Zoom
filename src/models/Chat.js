import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  room: String,
  message: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

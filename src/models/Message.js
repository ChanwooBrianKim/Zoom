import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    room: { type: String, required: true },
    nickname: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
})

const Message = mongoose.model('Message', messageSchema);

export default Message;
import mongoose from "mongoose"; // Importing mongoose to define and use the schema and model

const Schema = mongoose.Schema; // Creating a shortcut for mongoose.Schema for easier reference

// Defining the schema for a message in the chat application
const messageSchema = new Schema({
    room: { type: String, required: true }, // The name of the room where the message was sent, required field
    nickname: { type: String, required: true }, // The nickname of the user who sent the message, required field
    message: { type: String, required: true }, // The content of the message, required field
    timestamp: { type: Date, default: Date.now }, // The timestamp when the message was sent, default value is the current date and time
});

// Creating the Message model from the schema, which will allow interaction with the 'messages' collection in MongoDB
const Message = mongoose.model('Message', messageSchema);

// Exporting the Message model so it can be used in other parts of the application
export default Message;

import mongoose from "mongoose"; // Importing mongoose to define and use schema and model

const Schema = mongoose.Schema; // Creating a shortcut for mongoose.Schema for easier reference

// Defining the schema for a user in the application
const userSchema = new Schema({
    username: { type: String, unique: true, required: true }, // The username, it must be unique (no duplicates allowed) and is required
    password: { type: String, required: true }, // The hashed password, which is also a required field
});

// Creating the User model from the schema, which will allow interaction with the 'users' collection in MongoDB
const User = mongoose.model('User', userSchema);

// Exporting the User model so it can be used in other parts of the application
export default User;

import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true, requried: true},
    password: { type: String, reqeuired: true},
});

const User = mongoose.model('User', userSchema);

export default User;
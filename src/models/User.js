import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, unique: true, requried: true},
    password: { type: String, reqeuired: true},
});

export default mongoose.model('User', userSchema);
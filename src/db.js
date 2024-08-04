import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

console.log('MONGODB_URI in db.js:', process.env.MONGODB_URI); // Debug statement

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('MONGODB_URI is not defined in the .env file');
  throw new Error('MONGODB_URI is not defined in the .env file');
}

mongoose.connect(mongoURI).catch(error => console.error('Initial connection error:', error));

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

export default db;

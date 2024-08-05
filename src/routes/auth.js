import express from 'express';
import bcrypt from 'bcryptjs'; // library for hashing passwords
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Secured in .env file

// Registration route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hashes the password using bcrypt with a salt factor of 10
  try {
    const user = new User({ username, password: hashedPassword }); // Create new user
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Username already exists' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  // if the users exists & hashed password matches & sets an expiration of 1h
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.send({ token }); // sends token in the response
  } else {
    res.status(401).send({ error: 'Invalid username or password' });
  }
});

export default router;

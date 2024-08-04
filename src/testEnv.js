const dotenv = require('dotenv');
dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SECRET_KEY:', process.env.SECRET_KEY);

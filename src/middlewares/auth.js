import jwt from 'jsonwebtoken'; // Import the JSON Web Token library to handle JWT creation and verification
const SECRET_KEY = process.env.SECRET_KEY; // Retrieve the secret key from environment variables

// Middleware to authenticate JWT token for HTTP requests
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Get the Authorization header from the request
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part of the Authorization header (if present)
  
  // If no token is provided, return HTTP 401 (Unauthorized)
  if (token == null) return res.sendStatus(401);

  // Verify the token using the secret key
  jwt.verify(token, SECRET_KEY, (err, user) => {
    // If token verification fails, return HTTP 403 (Forbidden)
    if (err) return res.sendStatus(403);
    
    // If verification succeeds, store the decoded user information in the request object for later use
    req.user = user;
    next(); // Continue to the next middleware or route handler
  });
};

// Middleware to authenticate JWT token for Socket.io connections
export const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token; // Get the token from the socket handshake (sent during socket authentication)

  // If no token is provided, emit an authentication error
  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify the token using the secret key
  jwt.verify(token, SECRET_KEY, (err, user) => {
    // If token verification fails, emit an authentication error
    if (err) {
      return next(new Error('Authentication error'));
    }
    
    // If verification succeeds, store the decoded user information in the socket object for later use
    socket.user = user;
    next(); // Proceed to the next step in the Socket.io connection process
  });
};

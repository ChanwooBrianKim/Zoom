import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY;

export const authenticateToken = (req, res, next) => {
    const authHEader = req.headers['authorization'];
    const token = authHEader && authHEader.split(' ')[1];
    if (token == null) return res.sendSatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendSatus(403);
        req.user = user;
        next();
    });
};

export const authenticateSocket = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = user;
        next();
    });
};
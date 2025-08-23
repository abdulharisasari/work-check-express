// const jwt = require('jsonwebtoken');

// const authMiddleware = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) return res.status(401).json({ message: 'No token provided' });

//     const token = authHeader.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Token missing' });

//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) return res.status(403).json({ message: 'Invalid token' });
//         req.user = decoded;
//         next();
//     });
// };

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ code: 401, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ code: 403, message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;

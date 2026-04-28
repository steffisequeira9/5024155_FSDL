const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token. Expecting format "Bearer <token>"
        const tokenParts = token.split(' ');
        const tokenString = tokenParts.length > 1 ? tokenParts[1] : token;
        
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

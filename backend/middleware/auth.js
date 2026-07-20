const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || "LinkPulseSecretKey@2026";

function setUser(user) {
    return jwt.sign(
        {
            _id: user._id || user.id,
            id: user.id || user._id,
            email: user.email,
            name: user.name,
        },
        SECRET_KEY,
        { expiresIn: '7d' }
    );
}

function getUser(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

function checkForAuthentication(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = req.cookies?.uid || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);
    
    req.user = null;
    if (token) {
        req.user = getUser(token);
    }
    return next();
}

function restrictToLoggedInUserOnly(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    return next();
}

module.exports = {
    setUser,
    getUser,
    checkForAuthentication,
    restrictToLoggedInUserOnly,
};

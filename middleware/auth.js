const jwt = require('jsonwebtoken');

const SECRET_KEY = "LinkPulseSecretKey@2026";

function setUser(user) {
    return jwt.sign(
        {
            _id: user._id,
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
    const tokenCookie = req.cookies?.uid || req.headers['authorization']?.replace('Bearer ', '');
    req.user = null;
    if (tokenCookie) {
        const user = getUser(tokenCookie);
        req.user = user;
    }
    return next();
}

function restrictToLoggedInUserOnly(req, res, next) {
    if (!req.user) {
        return res.redirect('/login?error=Please login to access your dashboard');
    }
    return next();
}

module.exports = {
    setUser,
    getUser,
    checkForAuthentication,
    restrictToLoggedInUserOnly,
};

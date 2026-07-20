const User = require('../models/user');
const { setUser } = require('../middleware/auth');

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const user = await User.createUser({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        const token = setUser(user);
        res.cookie('uid', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        
        return res.status(201).json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
            token: token
        });

    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = setUser(user);
        res.cookie('uid', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email },
            token: token
        });

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
}

async function handleGetCurrentUser(req, res) {
    if (!req.user) {
        return res.status(401).json({ user: null });
    }
    return res.json({ user: req.user });
}

async function handleUserLogout(req, res) {
    res.clearCookie('uid');
    return res.json({ success: true, message: 'Logged out successfully' });
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleGetCurrentUser,
    handleUserLogout,
};

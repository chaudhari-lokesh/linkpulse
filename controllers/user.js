const User = require('../models/user');
const { setUser } = require('../middleware/auth');

async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.render('signup', { error: 'All fields are required.' });
    }

    if (password.length < 6) {
        return res.render('signup', { error: 'Password must be at least 6 characters long.' });
    }

    try {
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.render('signup', { error: 'An account with this email already exists.' });
        }

        const user = await User.createUser({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password
        });

        const token = setUser(user);
        res.cookie('uid', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.redirect('/dashboard?success=Welcome to LinkPulse!');

    } catch (err) {
        console.error("Signup error:", err);
        return res.render('signup', { error: 'Registration failed. Please try again.' });
    }
}

async function handleUserLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('login', { error: 'Email and password are required.' });
    }

    try {
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        const token = setUser(user);
        res.cookie('uid', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        return res.redirect('/dashboard');

    } catch (err) {
        console.error("Login error:", err);
        return res.render('login', { error: 'Login failed. Please try again.' });
    }
}

async function handleUserLogout(req, res) {
    res.clearCookie('uid');
    return res.redirect('/login?success=You have logged out.');
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout,
};
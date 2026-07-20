const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const db = require('./database/db'); // Dual Neon PostgreSQL + SQLite driver initializer
const URL = require('./models/url');
const urlRoutes = require('./routes/url');
const staticRouter = require('./routes/staticRouter');
const userRoutes = require('./routes/user');
const { checkForAuthentication } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 8001;

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.resolve("./views"));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Global Auth Context Middleware
app.use(checkForAuthentication);

// Application Routers
app.use("/url", urlRoutes);
app.use("/user", userRoutes);
app.use("/", staticRouter);

// Short URL Redirection Endpoint with SQL Visit Tracking
app.get('/url/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findUrlByShortId(shortId);

        if (!entry) {
            return res.status(404).render('home', {
                error: 'Short URL not found or has been removed.',
                user: req.user
            });
        }

        // Check Expiration
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            return res.status(410).render('home', {
                error: 'This short link has expired.',
                user: req.user
            });
        }

        // Log Click Visit in SQL Database
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Anonymous';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const referrer = req.headers['referer'] || 'Direct';

        await URL.logVisit(entry.id, {
            ip: clientIp,
            userAgent: userAgent,
            referrer: referrer
        });

        return res.redirect(entry.redirectUrl);

    } catch (err) {
        console.error("Redirection error:", err);
        return res.status(500).send('Server Error redirecting URL.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 LinkPulse Server running at: http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./database/db');
const URL = require('./models/url');
const urlRoutes = require('./routes/url');
const userRoutes = require('./routes/user');
const { checkForAuthentication } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for decoupled frontend
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true
}));
app.options('*', cors());

// Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global Auth Context Middleware
app.use(checkForAuthentication);

// REST API Routers
app.use("/api/url", urlRoutes);
app.use("/api/user", userRoutes);

// Short URL Redirection Endpoint with SQL Visit Tracking
app.get('/url/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findUrlByShortId(shortId);

        if (!entry) {
            return res.status(404).send('Short URL not found or removed.');
        }

        // Check Expiration
        if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
            return res.status(410).send('This short link has expired.');
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

app.get('/api/health', (req, res) => {
    return res.json({ status: 'healthy', timestamp: new Date() });
});

app.listen(PORT, () => {
    console.log(`🚀 LinkPulse Backend REST API running at: http://localhost:${PORT}`);
});

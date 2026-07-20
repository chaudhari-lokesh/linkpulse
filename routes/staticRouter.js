const express = require('express');
const URL = require('../models/url');
const { restrictToLoggedInUserOnly } = require('../middleware/auth');
const QRCode = require('qrcode');

const router = express.Router();

router.get('/', async (req, res) => {
    return res.render("home", {
        user: req.user,
        error: req.query.error,
        success: req.query.success
    });
});

router.get('/dashboard', restrictToLoggedInUserOnly, async (req, res) => {
    try {
        const userUrls = await URL.findUserUrls(req.user._id);
        
        // Calculate Statistics
        const totalLinks = userUrls.length;
        const totalClicks = userUrls.reduce((sum, url) => sum + url.visitHistory.length, 0);
        const activeLinks = userUrls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;

        // Generate QR codes for dashboard URLs
        const urlsWithQr = await Promise.all(userUrls.map(async (url) => {
            const fullShortUrl = `${req.protocol}://${req.get('host')}/url/${url.shortId}`;
            const qrCode = await QRCode.toDataURL(fullShortUrl);
            return {
                ...url,
                fullShortUrl,
                qrCode
            };
        }));

        return res.render("dashboard", {
            user: req.user,
            urls: urlsWithQr,
            stats: { totalLinks, totalClicks, activeLinks },
            error: req.query.error,
            success: req.query.success
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        return res.render("dashboard", {
            user: req.user,
            urls: [],
            stats: { totalLinks: 0, totalClicks: 0, activeLinks: 0 },
            error: "Failed to load dashboard data."
        });
    }
});

router.get('/analytics/:shortId', async (req, res) => {
    try {
        const shortId = req.params.shortId;
        const urlEntry = await URL.findUrlByShortId(shortId);

        if (!urlEntry) {
            return res.status(404).render("home", { error: "Short URL not found", user: req.user });
        }

        const fullShortUrl = `${req.protocol}://${req.get('host')}/url/${urlEntry.shortId}`;
        const qrCode = await QRCode.toDataURL(fullShortUrl);

        // Group clicks by date for chart rendering
        const clicksByDate = {};
        urlEntry.visitHistory.forEach(v => {
            const dateStr = new Date(v.timestamp).toLocaleDateString();
            clicksByDate[dateStr] = (clicksByDate[dateStr] || 0) + 1;
        });

        return res.render("analytics", {
            user: req.user,
            url: {
                ...urlEntry,
                fullShortUrl,
                qrCode,
                clickCount: urlEntry.visitHistory.length,
                clicksByDate
            }
        });
    } catch (err) {
        console.error("Analytics page error:", err);
        return res.redirect('/dashboard?error=Error loading analytics page');
    }
});

router.get('/signup', (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    return res.render("signup", { error: req.query.error, user: null });
});

router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    return res.render("login", { error: req.query.error, success: req.query.success, user: null });
});

router.get('/docs', (req, res) => {
    return res.render("docs", { user: req.user });
});

module.exports = router;
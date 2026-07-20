const { customAlphabet } = require('nanoid');
const QRCode = require('qrcode');
const URL = require('../models/url');

const generateShortId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

function formatUrl(url) {
    if (!url) return '';
    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted)) {
        formatted = 'http://' + formatted;
    }
    return formatted;
}

async function handleGenerateNewShortUrl(req, res) {
    try {
        const { url, customAlias, title, expiration } = req.body;

        if (!url) {
            if (req.headers['accept']?.includes('application/json')) {
                return res.status(400).json({ error: 'URL is required' });
            }
            return res.render('home', { error: 'Please enter a valid URL', user: req.user });
        }

        const redirectUrl = formatUrl(url);

        try {
            new globalThis.URL(redirectUrl);
        } catch (e) {
            if (req.headers['accept']?.includes('application/json')) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            return res.render('home', { error: 'Invalid URL format. Example: https://google.com', user: req.user });
        }

        let shortId = customAlias ? customAlias.trim() : generateShortId();

        if (customAlias && customAlias.trim()) {
            const existing = await URL.findUrlByShortId(shortId);
            if (existing) {
                if (req.headers['accept']?.includes('application/json')) {
                    return res.status(409).json({ error: 'Custom alias already in use' });
                }
                return res.render('home', { error: `Alias "${shortId}" is already taken. Try another!`, user: req.user });
            }
        }

        let expiresAt = null;
        if (expiration) {
            const now = new Date();
            if (expiration === '24h') expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            else if (expiration === '7d') expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            else if (expiration === '30d') expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        const newUrlDoc = await URL.createUrl({
            shortId: shortId,
            customAlias: customAlias ? shortId : undefined,
            title: title ? title.trim() : 'Shortened Link',
            redirectUrl: redirectUrl,
            createdBy: req.user ? req.user._id : null,
            expiresAt: expiresAt
        });

        const fullShortUrl = `${req.protocol}://${req.get('host')}/url/${shortId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(fullShortUrl);

        if (req.headers['accept']?.includes('application/json') || req.path === '/api') {
            return res.status(201).json({
                success: true,
                shortId: shortId,
                shortUrl: fullShortUrl,
                qrCode: qrCodeDataUrl,
                redirectUrl: redirectUrl,
                expiresAt: expiresAt
            });
        }

        const referrer = req.get('Referer') || '';
        if (referrer.includes('/dashboard')) {
            return res.redirect('/dashboard?success=URL shortened successfully!');
        }

        return res.render('home', {
            id: shortId,
            shortUrl: fullShortUrl,
            qrCode: qrCodeDataUrl,
            redirectUrl: redirectUrl,
            user: req.user,
            success: 'Short link generated successfully!'
        });

    } catch (err) {
        console.error("Error creating short URL:", err);
        return res.status(500).render('home', { error: 'Server error generating link. Please try again.', user: req.user });
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;
        const entry = await URL.findUrlByShortId(shortId);
        if (!entry) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        return res.json({
            totalClicks: entry.visitHistory.length,
            analytics: entry.visitHistory,
            title: entry.title,
            redirectUrl: entry.redirectUrl,
            createdAt: entry.createdAt
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}

async function handleDeleteUrl(req, res) {
    try {
        const id = req.params.id;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const deleted = await URL.deleteUrl(id, req.user._id);
        if (!deleted) {
            return res.status(404).json({ error: 'Link not found or access denied' });
        }

        if (req.headers['accept']?.includes('application/json')) {
            return res.json({ success: true, message: 'Link deleted successfully' });
        }
        return res.redirect('/dashboard?success=Link deleted successfully');
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting link' });
    }
}

module.exports = {
    handleGenerateNewShortUrl,
    handleGetAnalytics,
    handleDeleteUrl
};
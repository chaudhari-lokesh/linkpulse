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
            return res.status(400).json({ error: 'Destination URL is required' });
        }

        const redirectUrl = formatUrl(url);

        try {
            new globalThis.URL(redirectUrl);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid URL format. Example: https://google.com' });
        }

        let shortId = customAlias ? customAlias.trim() : generateShortId();

        if (customAlias && customAlias.trim()) {
            const existing = await URL.findUrlByShortId(shortId);
            if (existing) {
                return res.status(409).json({ error: `Alias "${shortId}" is already taken. Try another!` });
            }
        }

        let expiresAt = null;
        if (expiration) {
            const now = new Date();
            if (expiration === '24h') expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            else if (expiration === '7d') expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            else if (expiration === '30d') expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        const createdBy = req.user ? (req.user._id || req.user.id) : null;

        const newUrlDoc = await URL.createUrl({
            shortId: shortId,
            customAlias: customAlias ? shortId : undefined,
            title: title ? title.trim() : 'Shortened Link',
            redirectUrl: redirectUrl,
            createdBy: createdBy,
            expiresAt: expiresAt
        });

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fullShortUrl = `${baseUrl}/url/${shortId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(fullShortUrl);

        return res.status(201).json({
            success: true,
            shortId: shortId,
            shortUrl: fullShortUrl,
            qrCode: qrCodeDataUrl,
            redirectUrl: redirectUrl,
            title: newUrlDoc.title,
            expiresAt: expiresAt
        });

    } catch (err) {
        console.error("Error creating short URL:", err);
        return res.status(500).json({ error: 'Server error generating link. Please try again.' });
    }
}

async function handleGetUserUrls(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.user._id || req.user.id;
        const userUrls = await URL.findUserUrls(userId);

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        const urlsWithQr = await Promise.all(userUrls.map(async (url) => {
            const fullShortUrl = `${baseUrl}/url/${url.shortId}`;
            const qrCode = await QRCode.toDataURL(fullShortUrl);
            return {
                ...url,
                fullShortUrl,
                qrCode
            };
        }));

        const totalLinks = userUrls.length;
        const totalClicks = userUrls.reduce((sum, url) => sum + url.visitHistory.length, 0);
        const activeLinks = userUrls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length;

        return res.json({
            urls: urlsWithQr,
            stats: { totalLinks, totalClicks, activeLinks }
        });

    } catch (err) {
        console.error("Error fetching user URLs:", err);
        return res.status(500).json({ error: 'Failed to load user links' });
    }
}

async function handleGetAnalytics(req, res) {
    try {
        const shortId = req.params.shortId;
        const urlEntry = await URL.findUrlByShortId(shortId);

        if (!urlEntry) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fullShortUrl = `${baseUrl}/url/${urlEntry.shortId}`;
        const qrCode = await QRCode.toDataURL(fullShortUrl);

        const clicksByDate = {};
        urlEntry.visitHistory.forEach(v => {
            const dateStr = new Date(v.timestamp).toLocaleDateString();
            clicksByDate[dateStr] = (clicksByDate[dateStr] || 0) + 1;
        });

        return res.json({
            url: {
                ...urlEntry,
                fullShortUrl,
                qrCode,
                clickCount: urlEntry.visitHistory.length,
                clicksByDate
            }
        });
    } catch (err) {
        console.error("Analytics fetch error:", err);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
}

async function handleDeleteUrl(req, res) {
    try {
        const id = req.params.id;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.user._id || req.user.id;
        const deleted = await URL.deleteUrl(id, userId);

        if (!deleted) {
            return res.status(404).json({ error: 'Link not found or access denied' });
        }

        return res.json({ success: true, message: 'Link deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: 'Error deleting link' });
    }
}

module.exports = {
    handleGenerateNewShortUrl,
    handleGetUserUrls,
    handleGetAnalytics,
    handleDeleteUrl
};

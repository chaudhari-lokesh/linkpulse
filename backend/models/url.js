const db = require('../database/db');

const URL = {
    async createUrl({ shortId, customAlias, title, redirectUrl, createdBy, expiresAt }) {
        const expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : null;
        
        const res = await db.query(
            `INSERT INTO urls (short_id, custom_alias, title, redirect_url, created_by, expires_at)
             VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            [
                shortId,
                customAlias || null,
                title || 'Untitled Link',
                redirectUrl,
                createdBy || null,
                expiresAtIso
            ]
        );

        const newId = res[0]?.id;
        return this.findUrlById(newId);
    },

    async findUrlById(id) {
        const row = await db.queryOne(`SELECT * FROM urls WHERE id = ?`, [id]);
        if (!row) return null;
        return this._formatUrlRow(row);
    },

    async findUrlByShortId(shortId) {
        const row = await db.queryOne(
            `SELECT * FROM urls WHERE short_id = ? OR custom_alias = ?`,
            [shortId, shortId]
        );
        if (!row) return null;
        return this._formatUrlRow(row);
    },

    async findUserUrls(userId) {
        const rows = await db.query(
            `SELECT u.*, COUNT(v.id) as total_clicks
             FROM urls u
             LEFT JOIN visit_logs v ON u.id = v.url_id
             WHERE u.created_by = ?
             GROUP BY u.id
             ORDER BY u.created_at DESC`,
            [userId]
        );
        return Promise.all(rows.map(r => this._formatUrlRow(r)));
    },

    async logVisit(urlId, { ip, userAgent, referrer }) {
        await db.query(
            `INSERT INTO visit_logs (url_id, ip_address, user_agent, referrer) VALUES (?, ?, ?, ?)`,
            [urlId, ip || 'Anonymous', userAgent || 'Unknown', referrer || 'Direct']
        );
    },

    async getVisitHistory(urlId) {
        const logs = await db.query(
            `SELECT id, ip_address as ip, user_agent as userAgent, referrer, created_at as timestamp
             FROM visit_logs WHERE url_id = ? ORDER BY created_at DESC`,
            [urlId]
        );
        return logs.map(l => ({
            ...l,
            timestamp: new Date(l.timestamp).getTime()
        }));
    },

    async deleteUrl(id, userId) {
        const res = await db.query(`DELETE FROM urls WHERE id = ? AND created_by = ?`, [id, userId]);
        return (res[0]?.changes > 0) || (res.length > 0);
    },

    async _formatUrlRow(row) {
        const history = await this.getVisitHistory(row.id);
        return {
            _id: row.id,
            id: row.id,
            shortId: row.short_id,
            customAlias: row.custom_alias,
            title: row.title,
            redirectUrl: row.redirect_url,
            createdBy: row.created_by,
            expiresAt: row.expires_at ? new Date(row.expires_at) : null,
            createdAt: row.created_at,
            visitHistory: history,
            totalClicks: row.total_clicks !== undefined ? parseInt(row.total_clicks) : history.length
        };
    }
};

module.exports = URL;

const path = require('path');
const { Pool } = require('pg');
const Database = require('better-sqlite3');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let isPg = false;
let pgPool = null;
let sqliteDb = null;

if (connectionString) {
    console.log("🌐 Using Neon PostgreSQL Database Server");
    isPg = true;
    pgPool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS urls (
            id SERIAL PRIMARY KEY,
            short_id VARCHAR(50) UNIQUE NOT NULL,
            custom_alias VARCHAR(50) UNIQUE,
            title VARCHAR(255) DEFAULT 'Untitled Link',
            redirect_url TEXT NOT NULL,
            created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS visit_logs (
            id SERIAL PRIMARY KEY,
            url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
            ip_address VARCHAR(100) DEFAULT 'Anonymous',
            user_agent TEXT DEFAULT 'Unknown',
            referrer TEXT DEFAULT 'Direct',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `).then(() => console.log("⚡ Neon PostgreSQL tables verified!"))
      .catch(err => console.error("⚠️ Error creating PostgreSQL tables:", err));

} else {
    console.log("📁 Using Local SQLite Database");
    const dbPath = path.resolve(__dirname, '../linkpulse.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_id TEXT UNIQUE NOT NULL,
            custom_alias TEXT UNIQUE,
            title TEXT DEFAULT 'Untitled Link',
            redirect_url TEXT NOT NULL,
            created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
            expires_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS visit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url_id INTEGER NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
            ip_address TEXT DEFAULT 'Anonymous',
            user_agent TEXT DEFAULT 'Unknown',
            referrer TEXT DEFAULT 'Direct',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

const db = {
    isPg,
    async query(text, params = []) {
        if (isPg) {
            let paramIndex = 1;
            const pgText = text.replace(/\?/g, () => `$${paramIndex++}`);
            const res = await pgPool.query(pgText, params);
            return res.rows;
        } else {
            const stmt = sqliteDb.prepare(text);
            if (text.trim().toUpperCase().startsWith('SELECT')) {
                return stmt.all(...params);
            } else {
                const info = stmt.run(...params);
                return [{ id: info.lastInsertRowid, changes: info.changes }];
            }
        }
    },

    async queryOne(text, params = []) {
        const rows = await this.query(text, params);
        return rows[0] || null;
    }
};

module.exports = db;

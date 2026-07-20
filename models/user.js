const db = require('../database/db');
const bcrypt = require('bcryptjs');

const User = {
    async createUser({ name, email, password }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const res = await db.query(
            `INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id, name, email`,
            [name, email.toLowerCase().trim(), hashedPassword]
        );

        const created = res[0] || {};
        return {
            _id: created.id,
            id: created.id,
            name,
            email: email.toLowerCase().trim()
        };
    },

    async findUserByEmail(email) {
        const user = await db.queryOne(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
        if (user) {
            user._id = user.id;
        }
        return user;
    },

    async findUserById(id) {
        const user = await db.queryOne(`SELECT id, name, email, created_at FROM users WHERE id = ?`, [id]);
        if (user) {
            user._id = user.id;
        }
        return user;
    },

    async comparePassword(candidatePassword, hashedPassword) {
        return bcrypt.compare(candidatePassword, hashedPassword);
    }
};

module.exports = User;
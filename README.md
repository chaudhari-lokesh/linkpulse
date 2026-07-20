# ⚡ LinkPulse — Modern URL Shortener & Traffic Analytics Platform

![LinkPulse Tech Stack](https://img.shields.io/badge/Node.js-v18+-6366f1?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-5.x-a855f7?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Cloud-06b6d4?style=for-the-badge&logo=postgresql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Local-10b981?style=for-the-badge&logo=sqlite&logoColor=white)

**LinkPulse** is a feature-packed, production-grade URL Shortener and Traffic Analytics Web Application. Built with Node.js, Express, EJS, and a glassmorphism dark UI design system. It supports **dual SQL database engines** (SQLite for instant zero-config local development, and Neon PostgreSQL for cloud production).

---

## ✨ Key Features

- 🎨 **Glassmorphism Dark UI**: Designed with Inter typography, neon gradients (`indigo/violet/cyan`), micro-animations, and toast alerts.
- 🔐 **Authentication & User Dashboard**: Cookie-based JWT sessions with `bcryptjs` password hashing. Logged-in users can manage, search, and delete their links.
- ⚡ **Branded Custom Aliases**: Option to create custom URL slugs (e.g. `short.link/my-brand`).
- ⏳ **Expiration Timers**: Configure link expiration (24 hours, 7 days, 30 days, or Never).
- 📱 **Instant QR Code Generator**: Auto-generates high-resolution PNG QR codes previewable in a modal and downloadable.
- 📊 **Traffic Analytics**: Real-time click tracking, IP addresses, referrers, user agents, and visual Chart.js traffic graphs.
- 🛠 **Developer REST API**: Endpoints for programmatic link creation (`POST /url`) and analytics fetching (`GET /url/analytics/:shortId`) with interactive API docs (`/docs`).
- 🗃 **Dual Database Driver**: Automatically runs on **SQLite** locally (`linkpulse.db`) and switches to **Neon PostgreSQL** in cloud environments when `DATABASE_URL` is set.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database Layer**: SQLite (`better-sqlite3`) & PostgreSQL (`pg`)
- **Frontend Views**: EJS (Embedded JavaScript), Vanilla CSS3 (Glassmorphism), Chart.js
- **Security & Utils**: `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `qrcode`, `nanoid`

---

## 🚀 Local Quickstart

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation Steps

1. **Clone Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/linkpulse.git
   cd linkpulse
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Application**:
   ```bash
   node index.js
   ```

4. **Open Browser**:
   Navigate to `http://localhost:8001`

---

## 🌐 Deployment (Neon + Render / Vercel)

### 1. Database Setup (Neon PostgreSQL)
1. Create a free cluster on [Neon.tech](https://neon.tech).
2. Copy your connection string:
   `postgres://user:password@ep-xxx.neon.tech/neondb?sslmode=require`

### 2. Deploy on Render
1. Create a new **Web Service** on [Render.com](https://render.com) connected to your GitHub repository.
2. Build Command: `npm install`
3. Start Command: `node index.js`
4. Add Environment Variable:
   - `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
5. Deploy! LinkPulse will automatically verify and create SQL tables on Neon.

---

## 📖 API Documentation

### Create Short Link
```http
POST /url
Content-Type: application/json
Accept: application/json

{
  "url": "https://example.com/very-long-path",
  "customAlias": "my-brand",
  "title": "Campaign Link",
  "expiration": "7d"
}
```

### Get Analytics
```http
GET /url/analytics/my-brand
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

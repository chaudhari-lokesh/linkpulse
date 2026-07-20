# ⚡ LinkPulse — Decoupled URL Shortener & Analytics Platform

![LinkPulse Stack](https://img.shields.io/badge/Architecture-Decoupled_REST_API_%2B_React_SPA-6366f1?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Node.js_%2F_Express-a855f7?style=for-the-badge&logo=express)
![Frontend](https://img.shields.io/badge/Frontend-Vite_%2B_React-06b6d4?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-Neon_PostgreSQL-10b981?style=for-the-badge&logo=postgresql)

LinkPulse is a decoupled, modern URL Shortener and Click Analytics Web Application.

🌐 **Live Application**: [https://linkpulse-2gyec84vl-lokeshs-projects-6d5179ab.vercel.app/](https://linkpulse-2gyec84vl-lokeshs-projects-6d5179ab.vercel.app/)  
⚙️ **Live REST API**: [https://linkpulse-backend-m82h.onrender.com](https://linkpulse-backend-m82h.onrender.com)

---

## 📁 Repository Structure

```text
d:\url\
├── backend/            # Express REST API Server (Port 5000 / Render)
│   ├── database/       # Dual Database Driver (SQLite & Neon PostgreSQL)
│   ├── models/         # SQL Data Models (User, URL, Visit Logs)
│   ├── controllers/    # JSON REST Controllers
│   ├── middleware/     # JWT Auth Middleware
│   ├── routes/         # REST API Routes
│   └── index.js        # Server Entry Point
│
├── frontend/           # Vite + React SPA Application (Port 3000 / Vercel)
│   ├── src/            # App.jsx, index.css, Glassmorphism UI
│   └── vite.config.js  # Vite Proxy & Server Settings
│
└── README.md           # Documentation
```

---

## ✨ Features

- 🎨 **Glassmorphism Dark UI**: Designed with Inter typography, neon gradients, micro-animations, and toast alerts.
- 🔐 **Authentication & User Dashboard**: Cookie & Bearer JWT sessions with `bcryptjs` password hashing.
- ⚡ **Branded Custom Aliases**: Option to create custom URL slugs (e.g. `short.link/my-brand`).
- ⏳ **Expiration Timers**: Configure link expiration (24 hours, 7 days, 30 days, or Never).
- 📱 **Instant QR Code Generator**: Auto-generates high-resolution PNG QR codes previewable in a modal and downloadable.
- 📊 **Traffic Analytics**: Real-time click tracking, IP addresses, referrers, user agents, and visual Chart.js traffic graphs.
- 🛠 **Developer REST API**: Endpoints for programmatic link creation (`POST /api/url`) and analytics fetching (`GET /api/url/analytics/:shortId`) with interactive API docs (`/docs`).

---

## 🚀 Local Quickstart

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend API running at: `http://localhost:5000`*

### 2. Start Frontend React App
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend Web App running at: `http://localhost:3000`*

---

## 🌐 Production Deployment

- **Database**: Cloud-hosted on **[Neon.tech](https://neon.tech)** (PostgreSQL).
- **Backend Service**: Deployed on **[Render.com](https://render.com)** -> `https://linkpulse-backend-m82h.onrender.com`
- **Frontend SPA App**: Deployed on **[Vercel.com](https://vercel.com)** -> `https://linkpulse-2gyec84vl-lokeshs-projects-6d5179ab.vercel.app/`

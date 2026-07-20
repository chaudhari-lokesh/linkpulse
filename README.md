# ⚡ LinkPulse — Decoupled URL Shortener & Analytics Platform

![LinkPulse Stack](https://img.shields.io/badge/Architecture-Decoupled_REST_API_%2B_React_SPA-6366f1?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Node.js_%2F_Express-a855f7?style=for-the-badge&logo=express)
![Frontend](https://img.shields.io/badge/Frontend-Vite_%2B_React-06b6d4?style=for-the-badge&logo=react)

LinkPulse is a decoupled, modern URL Shortener and Click Analytics Web Application:

- **`backend/`**: Node.js & Express REST API server (CORS enabled, JWT auth, SQLite & Neon PostgreSQL database support).
- **`frontend/`**: Vite + React Single-Page Application (Glassmorphism dark UI, Chart.js traffic analytics, QR codes).

---

## 📁 Repository Structure

```text
d:\url\
├── backend/            # Express REST API Server (Port 5000)
│   ├── database/       # Dual Database Driver (SQLite & Neon PostgreSQL)
│   ├── models/         # SQL Data Models (User, URL, Visit Logs)
│   ├── controllers/    # JSON REST Controllers
│   ├── middleware/     # JWT Auth Middleware
│   ├── routes/         # REST API Routes
│   └── index.js        # Server Entry Point
│
├── frontend/           # Vite + React SPA Application (Port 3000)
│   ├── src/            # App.jsx, index.css, Glassmorphism UI
│   └── vite.config.js  # Vite Proxy & Server Settings
│
└── README.md           # Documentation
```

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

## 🌐 Cloud Deployment Guide

1. **Database (Neon PostgreSQL)**: Create a project on [Neon.tech](https://neon.tech) and copy your PostgreSQL connection string.
2. **Backend (Render.com)**: Connect repo -> Set **Root Directory** to `backend` -> Add environment variable `DATABASE_URL`.
3. **Frontend (Vercel.com)**: Connect repo -> Set **Root Directory** to `frontend` -> Deploy!

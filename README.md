# 💬 Ytalk — Real-Time Communication Platform

<div align="center">

> **Fast. Secure. Real-Time.**
> One platform for messaging, group chats, HD video calls, and AI assistance.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blueviolet?style=for-the-badge)](https://ytalk.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Rohit-011205/Ytalk)

</div>

---

## 🌐 About

**Ytalk** is a next-generation real-time communication platform that unifies instant messaging, HD video calls, group collaboration, and AI-powered assistance — all in one place.

Built with a modern SFU (Selective Forwarding Unit) architecture powered by **LiveKit**, Ytalk delivers low-latency, scalable video communication for both personal and group calls. With Socket.IO-powered messaging, dynamic group management, and an intelligent AI assistant, Ytalk is designed for seamless, real-time communication at scale.

---

## ✨ Features

✅ **1:1 & Group Chat** — Real-time text and image messaging with typing indicators and online presence.

✅ **Personal Video Calls** — Peer-to-peer HD video calls with low-latency streaming.

✅ **Group Video Calls** — Multi-participant video calls powered by LiveKit's SFU architecture for scalable, high-quality communication.

✅ **SFU Architecture** — Selective Forwarding Unit via LiveKit — each participant sends one stream to the server, which selectively forwards to others. Eliminates mesh overhead and scales effortlessly.

✅ **AI Assistant** — Integrated AI assistant for smart, context-aware responses within your chats.

✅ **Dynamic Group Management** — Create groups, add and remove members, update group info, and delete groups — all in real time.

✅ **Call History** — Full call log with direction tagging (incoming / outgoing / missed / declined / cancelled) and callback support.

✅ **Online Presence** — Real-time user status tracking (online / offline) across all conversations.

✅ **User Authentication** — Secure JWT-based authentication with protected routes and persistent sessions.

✅ **Google Authentication** — Sign in with Google via OAuth 2.0 — automatically fetches your Google name and profile picture on first login, no manual setup needed.

✅ **Screen Sharing** — Share your screen in real time during video calls for seamless collaboration and presentations.

✅ **Media Uploads** — Profile pictures and group images powered by Cloudinary CDN.

✅ **Scalable Architecture** — Modular design with Socket.IO and REST APIs for seamless real-time performance.

---

## 📸 Screenshots

<img width="1919" height="920" alt="image" src="https://github.com/user-attachments/assets/214e257f-6ebf-4883-8bc7-5bbcf48993c6" />

<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/c9865210-9547-455a-a16d-7d314b8dae9c" />


<img width="1917" height="916" alt="image" src="https://github.com/user-attachments/assets/021f500e-8bb4-4f57-a490-931d720a152f" />

<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/bf8f6ecb-c1bd-4bc7-a928-8fdb0d19457d" />

<img width="1919" height="910" alt="image" src="https://github.com/user-attachments/assets/dfe3e182-ec8e-4314-821c-e920be4352fd" />

---

## 🧩 Tech Stack

### 💻 Frontend

| Technology | Purpose |
|---|---|
| React.js (Vite) | Core UI framework — fast, modular, reactive |
| Tailwind CSS | Utility-first styling and responsive design |
| Zustand | Lightweight global state management |
| React Router DOM | Dynamic routing and protected navigation |
| Socket.IO Client | Real-time messaging and user presence |
| LiveKit Client SDK | SFU-based video call participation |
| Axios | HTTP client for REST API communication |
| date-fns | Date formatting for call history and timestamps |

### ⚙️ Backend

| Technology | Purpose |
|---|---|
| Node.js + Express.js | REST API and signaling server |
| MongoDB + Mongoose | NoSQL database for users, messages, and calls |
| Socket.IO Server | Real-time bidirectional communication |
| LiveKit Server SDK | SFU token generation and room management |
| JWT | Stateless, secure user authentication |
| Google OAuth 2.0 | Third-party authentication with profile and name sync |
| Cloudinary | Media upload and CDN delivery |
| Render | Production backend hosting |

---

## ⚙️ Installation

Follow these steps to run Ytalk locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/ytalk.git
cd ytalk
```

---

### 🖥️ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGODB_URI=
PORT=
JWT_SECRET=
CLIENT_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

LK_API_KEY=
LK_API_SECRET=
LK_WS_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

Start the backend server:

```bash
npm run dev
```

---

### 🌐 Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_BACKEND_URL=
```

Start the frontend:

```bash
npm run dev
```

---

## 🏗️ Architecture Note

Ytalk uses a **Selective Forwarding Unit (SFU)** model via LiveKit for all video calls — both personal and group. Unlike a mesh architecture where every participant sends to every other participant, SFU means each client sends a single stream to the LiveKit server, which then selectively forwards streams to the appropriate recipients. This drastically reduces client-side bandwidth and CPU usage, making group calls smooth even with multiple participants.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---


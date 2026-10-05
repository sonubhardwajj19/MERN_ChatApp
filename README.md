# 💬CodeRoom (MERN - Chat App)

A real-time chat application built using the **MERN stack**, with WebSockets for real-time communication.

Users can create an account, log in, log out,  see other users online, and exchange messages in real time.

---

## 🚀 Features

* 🔐 User authentication
* 🍪 Cookie-based authentication
* 🔒 JWT-based authorization
* 💬 Real-time messaging
* 🟢 Online users / online status
* ⚡ WebSocket communication
* 👥 User/contact list
* 📱 Responsive chat interface
* 🔄 Real-time connection handling
* 🛡️ Protected API routes

---

## 🛠️ Tech Stack

### Frontend

* React
* Tailwind CSS
* JavaScript
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Cookie-parser
* WebSocket

### Development Tools

* Git
* GitHub
* Yarn / npm

---

## 📁 Project Structure

```text
chat-app/
│
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── api/                 # Node.js + Express backend
│   ├── index.js
│   ├── models/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md


## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Configure environment variables

**`api/.env`**

```dotenv
MONGO_URL="your_mongodb_connection_string"
JWT_SECRET="your_random_secret"
CLIENT_URL="http://localhost:5173"
```

**`client/.env`**

```dotenv
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

### 3. Run the backend

```bash
cd api
npm i
node index.js
```

The API runs on `http://localhost:4000`

### 4. Run the frontend

Open a new terminal:

```bash
cd client
yarn i
yarn dev
```

The client runs on `http://localhost:5173`

## Scripts

| Location | Command | Description |
|----------|---------|-------------|
| `api` | `node index.js` | Starts the Express server |
| `client` | `yarn dev` | Starts the React dev server |
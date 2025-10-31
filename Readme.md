# Konichiwow – Full Stack Expense Tracker

Konichiwow is a **full-stack Expense Tracker** application built with **Express.js**, **MongoDB**, **Firebase Authentication**, and a **React (Vite + Tailwind)** frontend.  
It enables users to register/login securely, manage expenses, and view detailed reports.

---

## 🧱 Project Structure
```bash
Konichiwow/
│
├── frontend/ # React + Vite frontend
│ ├── src/
│ ├── package.json
│ └── .env
│
├── src/ # Express backend source
│ ├── firebase/
│ │ ├── firebaseConfig.js
│ │ └── serviceAccountKey.json # Ignored (private key)
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ └── server.js # Entry point
│
├── .gitignore
├── .env
├── package.json
└── README.md
```

## ⚙️ Tech Stack

### Backend
- **Language:** Node.js (JavaScript)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Firebase Admin SDK (Email/Password)
- **Testing:** Postman
- **Environment Variables:** dotenv

### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Auth Context:** Custom `useAuth()` using Firebase tokens
- **API Communication:** Axios/fetch with `VITE_API_URL` env

---

## 🔐 Backend Setup

### 1. Install Dependencies
Run this in the **root directory**:
```bash
npm install
```

### 2. Create .env File (in root)
```bash
MONGO_URI=mongodb+srv://<your-mongodb-connection-string>
PORT=8080
FIREBASE_API_KEY=<your-firebase-api-key>
```

### 3. Add Firebase Service Account

- 1. Go to your Firebase Console → Project Settings → Service Accounts

- 2. Click "Generate new private key"

- 3. Save the file as:

```bash
/src/firebase/serviceAccountKey.json
```
 - ⚠️ Add this path to .gitignore (to prevent exposing secrets).

### 4. Run the Backend

```bash
npm run dev
```
- Server runs at http://localhost:8080

### 5. Entry Point

- src/server.js

## 🔐 Frontend Setup

### 1. Go to the frontend directory

```bash
cd frontend
npm install
```

### 2. Create .env File inside frontend/

```bash
VITE_API_URL=http://localhost:8080/api
```
- Replace this with your deployed backend URL when hosting. 

### 3. Run Frontend

```bash
npm run dev
```
- Frontend runs at http://localhost:5173

## ⚡ Running Locally

# 1. Clone the repo

```bash
git clone https://github.com/<your-username>/Konichiwow.git
cd Konichiwow
```

# 2. Install backend dependencies

```bash
npm install
```

# 3. Setup backend environment

```bash
touch .env  # add MONGO_URI, PORT, FIREBASE_API_KEY
```

# 4. Start backend

```bash
npm run dev
```

# 5. Setup frontend

```bash
cd frontend
npm install
touch .env  # add VITE_API_URL=http://localhost:8080/api
npm run dev
```
Then open:

- Frontend → http://localhost:5173

- Backend → http://localhost:8080

## 💡 Features & Flow Overview:

### Register/Login — Firebase Email/Password authentication

### Protected Routes — JWT validation through ProtectedRoute in React

### Expense Management — Add, update, delete, and view categorized expenses

### Reports Dashboard — Monthly and category-wise breakdown using MongoDB aggregations

### Clean UI — Responsive Tailwind + Coffee brown theme Navbar

### Secure Storage — Firebase Admin + MongoDB Atlas
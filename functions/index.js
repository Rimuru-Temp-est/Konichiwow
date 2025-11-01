import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import admin from "./firebase/firebaseConfig.js";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const MONGO_URI_SECRET = defineSecret("MONGO_URI_SECRET");
const CLIENT_FIREBASE_API_KEY_SECRET = defineSecret("CLIENT_FIREBASE_API_KEY_SECRET");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/reports", reportRoutes);

app.get("/", (req, res) => {
  res.send("Server running successfully! 🚀");
});

app.get("/test-firebase", async (req, res) => {
  try {
    const userList = await admin.auth().listUsers(1);
    res.json({ message: "Firebase connected successfully", users: userList.users.length });
  } catch (err) {
    res.status(500).json({ message: "Firebase error", error: err.message });
  }
});

export const api = onRequest(
  { secrets: [MONGO_URI_SECRET, CLIENT_FIREBASE_API_KEY_SECRET] },
  async (req, res) => {
    try {
      const mongoURI = process.env.MONGO_URI || MONGO_URI_SECRET.value();
      await mongoose.connect(mongoURI);
      console.log("✅ MongoDB connected successfully");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
    }

    app(req, res);
  }
);

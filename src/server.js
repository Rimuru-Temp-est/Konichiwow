import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import admin from "./firebase/firebaseConfig.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reports", reportRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Server running successfully!");
});

app.get("/test-firebase", async (req, res) => {
  try {
    const userList = await admin.auth().listUsers(1);
    res.json({ message: "Firebase connected successfully", users: userList.users.length });
  } catch (err) {
    res.status(500).json({ message: "Firebase error", error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

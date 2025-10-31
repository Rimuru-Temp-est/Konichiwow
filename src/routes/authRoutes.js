import express from "express";
import admin from "../firebase/firebaseConfig.js";
import User from "../models/User.js";
import fetch from "node-fetch";
import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validate.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });

      const newUser = new User({
        uid: userRecord.uid,
        name,
        email,
      });

      await newUser.save();

      res.status(201).json({
        message: "User registered successfully",
        user: { uid: userRecord.uid, name, email },
      });
    } catch (error) {
      console.error("❌ Signup error:", error);
      res.status(500).json({ message: "Signup failed", error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return res.status(400).json({ message: "Login failed", error: data.error.message });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found in database" });
      }

      res.status(200).json({
        message: "Login successful",
        user: { uid: user.uid, name: user.name, email: user.email },
        idToken: data.idToken,
      });
    } catch (error) {
      console.error("❌ Login error:", error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    await admin.auth().revokeRefreshTokens(decoded.uid);
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
});

export default router;

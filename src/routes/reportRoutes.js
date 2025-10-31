import express from "express";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import Expense from "../models/Expense.js";
import { query, validationResult } from "express-validator";

const router = express.Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((err) => ({ field: err.path, msg: err.msg })),
    });
  }
  next();
};

router.get(
  "/monthly",
  verifyFirebaseToken,
  [
    query("month")
      .notEmpty()
      .withMessage("Month is required")
      .isInt({ min: 1, max: 12 })
      .withMessage("Month must be between 1 and 12"),
    query("year")
      .notEmpty()
      .withMessage("Year is required")
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be a valid number (2000–2100)"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { month, year } = req.query;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const expenses = await Expense.find({
        userId: req.user.uid,
        date: { $gte: startDate, $lte: endDate },
      });

      let total = 0;
      const categories = {};

      expenses.forEach((exp) => {
        total += exp.amount;
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      });

      res.status(200).json({ total, categories });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error generating report", error: err.message });
    }
  }
);

router.get(
  "/category",
  verifyFirebaseToken,
  [
    query("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isLength({ max: 50 })
      .withMessage("Category name too long"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { category } = req.query;

      const expenses = await Expense.find({
        userId: req.user.uid,
        category,
      }).select("title amount date category");

      res.status(200).json(expenses);
    } catch (err) {
      res.status(500).json({
        message: "Error fetching category report",
        error: err.message,
      });
    }
  }
);

export default router;

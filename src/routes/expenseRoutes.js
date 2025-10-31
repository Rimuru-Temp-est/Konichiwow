import express from "express";
import Expense from "../models/Expense.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { body, param, query, validationResult } from "express-validator";

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

router.post(
  "/",
  verifyFirebaseToken,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 100 })
      .withMessage("Title cannot exceed 100 characters"),
    body("amount")
      .notEmpty()
      .withMessage("Amount is required")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required")
      .isLength({ max: 50 })
      .withMessage("Category name too long"),
    body("date")
      .notEmpty()
      .withMessage("Date is required")
      .isISO8601()
      .withMessage("Date must be a valid ISO date (YYYY-MM-DD)"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { title, amount, category, date } = req.body;
      const newExpense = new Expense({
        userId: req.user.uid,
        title,
        amount,
        category,
        date,
      });
      await newExpense.save();
      res.status(201).json({
        message: "Expense added successfully",
        id: newExpense._id,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Failed to add expense", error: err.message });
    }
  }
);

router.get(
  "/",
  verifyFirebaseToken,
  [
    query("start").optional().isISO8601().withMessage("Invalid start date"),
    query("end").optional().isISO8601().withMessage("Invalid end date"),
    query("sort")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Sort must be 'asc' or 'desc'"),
    query("category")
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage("Invalid category"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { start, end, sort, category, page = 1, limit = 10 } = req.query;

      const query = { userId };

      if (category) query.category = category;
      if (start || end) {
        query.date = {};
        if (start) query.date.$gte = new Date(start);
        if (end) query.date.$lte = new Date(end);
      }

      const sortOrder = sort === "asc" ? 1 : -1;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [expenses, total] = await Promise.all([
        Expense.find(query)
          .sort({ date: sortOrder })
          .skip(skip)
          .limit(parseInt(limit))
          .select("_id title amount category date"),
        Expense.countDocuments(query),
      ]);

      res.status(200).json({
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        expenses,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch expenses",
        error: error.message,
      });
    }
  }
);

router.get(
  "/:id",
  verifyFirebaseToken,
  [param("id").isMongoId().withMessage("Invalid expense ID")],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      const expense = await Expense.findOne({ _id: id, userId });

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch expense",
        error: error.message,
      });
    }
  }
);

router.put(
  "/:id",
  verifyFirebaseToken,
  [
    param("id").isMongoId().withMessage("Invalid expense ID"),
    body("title").optional().isString().isLength({ max: 100 }),
    body("amount").optional().isFloat({ gt: 0 }),
    body("category").optional().isString().isLength({ max: 50 }),
    body("date").optional().isISO8601(),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;
      const { title, amount, category, date } = req.body;

      const expense = await Expense.findOneAndUpdate(
        { _id: id, userId },
        { title, amount, category, date },
        { new: true }
      );

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json({
        message: "Expense updated successfully",
        expense,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update expense",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  [param("id").isMongoId().withMessage("Invalid expense ID")],
  handleValidation,
  async (req, res) => {
    try {
      const userId = req.user.uid;
      const { id } = req.params;

      const expense = await Expense.findOneAndDelete({ _id: id, userId });

      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete expense",
        error: error.message,
      });
    }
  }
);

export default router;

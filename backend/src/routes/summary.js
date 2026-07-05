/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * FR3: roll a user's transactions up into totals and per-category spending
 * so the frontend has something to chart.
 */

const express = require('express');
const db = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/summary?userId=1 -> income/expense totals + spending by category
router.get('/', (req, res) => {
  const userId = Number(req.query.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'a valid userId is required.');
  }

  const totals = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?`
    )
    .get(userId);

  const byCategory = db
    .prepare(
      `SELECT COALESCE(c.name, 'Uncategorized') AS category,
              SUM(t.amount) AS total
         FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.user_id = ? AND t.type = 'expense'
     GROUP BY t.category_id
     ORDER BY total DESC`
    )
    .all(userId);

  res.json({
    total_income: totals.total_income,
    total_expense: totals.total_expense,
    balance: totals.total_income - totals.total_expense,
    spending_by_category: byCategory,
  });
});

module.exports = router;
/**
 * last updated: 2026-07-07
 * update author: Hoang
 */

'use strict';

/*
 * FR3: budget management (monthly spending limits)
 *
 * a budget is a monthly_limit for a given category + month + year. the
 * frontend rolls the per-category budgets up into an "overall" total, so
 * every budget is tied to a real category (no category-less/overall rows).
 * current_spending is NOT stored - it's rolled up from that month's expense
 * transactions on read. owner is identified by userId until real auth exists.
 */

const express = require('express');
const db = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// pull userId from query or body and make sure it looks like a real id
function requireUserId(source) {
  const userId = Number(source.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'a valid userId is required.');
  }
  return userId;
}

// month must be 1-12, year a sane 4-digit number
function validatePeriod(month, year) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'month must be an integer 1-12.');
  }
  if (!Number.isInteger(year) || year < 2000 || year > 9999) {
    throw new ApiError(400, 'year must be a valid 4-digit year.');
  }
}

// GET /api/budgets?userId=1&month=7&year=2026
// month/year optional -> defaults to the current month.
// each budget comes back with current_spending for its own period.
router.get('/', (req, res) => {
  const userId = requireUserId(req.query);
  const now = new Date();
  const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
  const year = req.query.year ? Number(req.query.year) : now.getFullYear();
  validatePeriod(month, year);

  const rows = db
    .prepare(
      `SELECT b.id, b.user_id, b.category_id, c.name AS category_name,
              b.monthly_limit, b.month, b.year, b.created_at,
              COALESCE((
                SELECT SUM(t.amount) FROM transactions t
                 WHERE t.user_id = b.user_id
                   AND t.type = 'expense'
                   AND strftime('%Y-%m', t.transaction_date)
                       = printf('%04d-%02d', b.year, b.month)
                   AND (b.category_id IS NULL OR t.category_id = b.category_id)
              ), 0) AS current_spending
         FROM budgets b
    LEFT JOIN categories c ON c.id = b.category_id
        WHERE b.user_id = ? AND b.month = ? AND b.year = ?
     ORDER BY b.category_id IS NOT NULL, c.name`
    )
    .all(userId, month, year);

  res.json(rows);
});

// POST /api/budgets -> create or update a per-category budget for a period.
// re-posting the same user+category+month+year overwrites the limit (upsert).
// a real category_id is required - there are no category-less "overall" budgets.
router.post('/', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  const { category_id, monthly_limit, month, year } = body;
  const cat = Number(category_id);
  const m = Number(month);
  const y = Number(year);

  if (!Number.isInteger(cat) || cat <= 0) {
    throw new ApiError(400, 'a valid category_id is required.');
  }
  if (typeof monthly_limit !== 'number' || monthly_limit < 0) {
    throw new ApiError(400, 'monthly_limit must be a number >= 0.');
  }
  validatePeriod(m, y);

  const upsert = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT id FROM budgets
          WHERE user_id = ? AND month = ? AND year = ? AND category_id IS ?`
      )
      .get(userId, m, y, cat);

    if (existing) {
      db.prepare('UPDATE budgets SET monthly_limit = ? WHERE id = ?')
        .run(monthly_limit, existing.id);
      return existing.id;
    }

    const info = db
      .prepare(
        `INSERT INTO budgets (user_id, category_id, monthly_limit, month, year)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(userId, cat, monthly_limit, m, y);
    return info.lastInsertRowid;
  });

  const id = upsert();

  const saved = db
    .prepare(
      `SELECT id, user_id, category_id, monthly_limit, month, year, created_at
         FROM budgets WHERE id = ?`
    )
    .get(id);

  res.status(201).json(saved);
});

// DELETE /api/budgets/:id?userId=1 -> remove a budget
router.delete('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const info = db
    .prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), userId);

  if (info.changes === 0) throw new ApiError(404, 'Budget not found.');
  res.status(204).end();
});

module.exports = router;

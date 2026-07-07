/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * FR2: transaction management (income & expenses)
 *
 * full crud for a user's transactions. until real auth exists the owner is
 * identified by a userId query param / body field - swap that for the
 * authenticated user id later.
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

// GET /api/transactions?userId=1 -> newest first, with the category name
router.get('/', (req, res) => {
  const userId = requireUserId(req.query);

  const rows = db
    .prepare(
      `SELECT t.id, t.type, t.amount, t.description, t.transaction_date,
              t.category_id, c.name AS category_name, t.created_at
         FROM transactions t
    LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.user_id = ?
     ORDER BY t.transaction_date DESC, t.id DESC`
    )
    .all(userId);

  res.json(rows);
});

// GET /api/transactions/:id?userId=1 -> a single transaction
router.get('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const row = db
    .prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), userId);

  if (!row) throw new ApiError(404, 'Transaction not found.');
  res.json(row);
});

// POST /api/transactions -> record an income or expense
router.post('/', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  const { type, amount, description, transaction_date, category_id } = body;

  if (type !== 'income' && type !== 'expense') {
    throw new ApiError(400, "type must be 'income' or 'expense'.");
  }
  if (typeof amount !== 'number' || amount < 0) {
    throw new ApiError(400, 'amount must be a number >= 0.');
  }
  if (!transaction_date) {
    throw new ApiError(400, 'transaction_date (YYYY-MM-DD) is required.');
  }

  const info = db
    .prepare(
      `INSERT INTO transactions
         (user_id, category_id, type, amount, description, transaction_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, category_id ?? null, type, amount, description ?? null, transaction_date);

  const created = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

// PUT /api/transactions/:id -> edit an existing income/expense
router.put('/:id', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  const { type, amount, description, transaction_date, category_id } = body;

  if (type !== 'income' && type !== 'expense') {
    throw new ApiError(400, "type must be 'income' or 'expense'.");
  }
  if (typeof amount !== 'number' || amount < 0) {
    throw new ApiError(400, 'amount must be a number >= 0.');
  }
  if (!transaction_date) {
    throw new ApiError(400, 'transaction_date (YYYY-MM-DD) is required.');
  }

  const info = db
    .prepare(
      `UPDATE transactions
          SET category_id = ?, type = ?, amount = ?, description = ?, transaction_date = ?
        WHERE id = ? AND user_id = ?`
    )
    .run(
      category_id ?? null,
      type,
      amount,
      description ?? null,
      transaction_date,
      Number(req.params.id),
      userId
    );

  if (info.changes === 0) throw new ApiError(404, 'Transaction not found.');

  const updated = db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(Number(req.params.id));

  res.json(updated);
});

// DELETE /api/transactions/:id?userId=1 -> remove a transaction
router.delete('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const info = db
    .prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), userId);

  if (info.changes === 0) throw new ApiError(404, 'Transaction not found.');
  res.status(204).end();
});

module.exports = router;
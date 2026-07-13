/**
 * last updated: 2026-07-12
 * update author: Taha
 */

'use strict';

/*
 * FR4: bill tracker (one-off / recurring bills with a due date)
 *
 * full crud for a user's bills. owner is identified by userId query param /
 * body field until real auth exists, same pattern as transactions.js.
 */

const express = require('express');
const db = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

const FREQUENCIES = ['one-time', 'weekly', 'monthly', 'quarterly', 'yearly'];

// pull userId from query or body and make sure it looks like a real id
function requireUserId(source) {
  const userId = Number(source.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'a valid userId is required.');
  }
  return userId;
}

function validateBillBody(body) {
  const { name, amount, due_date, frequency } = body;

  if (!name || typeof name !== 'string') {
    throw new ApiError(400, 'name is required.');
  }
  if (typeof amount !== 'number' || amount < 0) {
    throw new ApiError(400, 'amount must be a number >= 0.');
  }
  if (!due_date) {
    throw new ApiError(400, 'due_date (YYYY-MM-DD) is required.');
  }
  if (frequency !== undefined && !FREQUENCIES.includes(frequency)) {
    throw new ApiError(400, `frequency must be one of: ${FREQUENCIES.join(', ')}.`);
  }
}

// GET /api/bills?userId=1 -> soonest due date first
router.get('/', (req, res) => {
  const userId = requireUserId(req.query);

  const rows = db
    .prepare(
      `SELECT id, user_id, name, amount, due_date, frequency, is_paid, created_at
         FROM bills
        WHERE user_id = ?
     ORDER BY due_date ASC, id ASC`
    )
    .all(userId);

  res.json(rows);
});

// GET /api/bills/:id?userId=1 -> a single bill
router.get('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const row = db
    .prepare('SELECT * FROM bills WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), userId);

  if (!row) throw new ApiError(404, 'Bill not found.');
  res.json(row);
});

// POST /api/bills -> create a bill
router.post('/', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  validateBillBody(body);
  const { name, amount, due_date, frequency, is_paid } = body;

  const info = db
    .prepare(
      `INSERT INTO bills (user_id, name, amount, due_date, frequency, is_paid)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, name, amount, due_date, frequency ?? 'monthly', is_paid ? 1 : 0);

  const created = db.prepare('SELECT * FROM bills WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/bills/:id -> edit an existing bill (name, amount, due_date, frequency, is_paid)
router.put('/:id', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  validateBillBody(body);
  const { name, amount, due_date, frequency, is_paid } = body;

  const info = db
    .prepare(
      `UPDATE bills
          SET name = ?, amount = ?, due_date = ?, frequency = ?, is_paid = ?
        WHERE id = ? AND user_id = ?`
    )
    .run(
      name,
      amount,
      due_date,
      frequency ?? 'monthly',
      is_paid ? 1 : 0,
      Number(req.params.id),
      userId
    );

  if (info.changes === 0) throw new ApiError(404, 'Bill not found.');

  const updated = db.prepare('SELECT * FROM bills WHERE id = ?').get(Number(req.params.id));
  res.json(updated);
});

// DELETE /api/bills/:id?userId=1 -> remove a bill
router.delete('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const info = db
    .prepare('DELETE FROM bills WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), userId);

  if (info.changes === 0) throw new ApiError(404, 'Bill not found.');
  res.status(204).end();
});

module.exports = router;

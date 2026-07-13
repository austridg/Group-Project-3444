/**
 * last updated: 2026-07-12
 * update author: Taha
 */

'use strict';

/*
 * FR4: subscription tracker (recurring services on a billing cycle)
 *
 * full crud for a user's subscriptions. owner is identified by userId query
 * param / body field until real auth exists, same pattern as transactions.js.
 */

const express = require('express');
const db = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

const BILLING_CYCLES = ['weekly', 'monthly', 'quarterly', 'yearly'];

// pull userId from query or body and make sure it looks like a real id
function requireUserId(source) {
  const userId = Number(source.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'a valid userId is required.');
  }
  return userId;
}

function validateSubscriptionBody(body) {
  const { name, amount, billing_cycle } = body;

  if (!name || typeof name !== 'string') {
    throw new ApiError(400, 'name is required.');
  }
  if (typeof amount !== 'number' || amount < 0) {
    throw new ApiError(400, 'amount must be a number >= 0.');
  }
  if (billing_cycle !== undefined && !BILLING_CYCLES.includes(billing_cycle)) {
    throw new ApiError(400, `billing_cycle must be one of: ${BILLING_CYCLES.join(', ')}.`);
  }
}

// GET /api/subscriptions?userId=1 -> soonest renewal first
router.get('/', (req, res) => {
  const userId = requireUserId(req.query);

  const rows = db
    .prepare(
      `SELECT id, user_id, name, amount, billing_cycle, next_renewal_date, is_active, created_at
         FROM subscriptions
        WHERE user_id = ?
     ORDER BY next_renewal_date ASC, id ASC`
    )
    .all(userId);

  res.json(rows);
});

// GET /api/subscriptions/:id?userId=1 -> a single subscription
router.get('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const row = db
    .prepare('SELECT * FROM subscriptions WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), userId);

  if (!row) throw new ApiError(404, 'Subscription not found.');
  res.json(row);
});

// POST /api/subscriptions -> create a subscription
router.post('/', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  validateSubscriptionBody(body);
  const { name, amount, billing_cycle, next_renewal_date, is_active } = body;

  const info = db
    .prepare(
      `INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_renewal_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      name,
      amount,
      billing_cycle ?? 'monthly',
      next_renewal_date ?? null,
      is_active === undefined || is_active ? 1 : 0
    );

  const created = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/subscriptions/:id -> edit an existing subscription
router.put('/:id', (req, res) => {
  const body = req.body || {};
  const userId = requireUserId(body);
  validateSubscriptionBody(body);
  const { name, amount, billing_cycle, next_renewal_date, is_active } = body;

  const info = db
    .prepare(
      `UPDATE subscriptions
          SET name = ?, amount = ?, billing_cycle = ?, next_renewal_date = ?, is_active = ?
        WHERE id = ? AND user_id = ?`
    )
    .run(
      name,
      amount,
      billing_cycle ?? 'monthly',
      next_renewal_date ?? null,
      is_active === undefined || is_active ? 1 : 0,
      Number(req.params.id),
      userId
    );

  if (info.changes === 0) throw new ApiError(404, 'Subscription not found.');

  const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(Number(req.params.id));
  res.json(updated);
});

// DELETE /api/subscriptions/:id?userId=1 -> remove a subscription
router.delete('/:id', (req, res) => {
  const userId = requireUserId(req.query);

  const info = db
    .prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?')
    .run(Number(req.params.id), userId);

  if (info.changes === 0) throw new ApiError(404, 'Subscription not found.');
  res.status(204).end();
});

module.exports = router;

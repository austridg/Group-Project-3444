/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * categories organize transactions & budgets
 * returns the seeded defaults (user_id NULL) plus a user's custom ones
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/categories?userId=1 -> defaults + that user's custom categories
router.get('/', (req, res) => {
  const userId = req.query.userId ? Number(req.query.userId) : null;

  const categories = db
    .prepare(
      `SELECT id, user_id, name
         FROM categories
        WHERE user_id IS NULL OR user_id = ?
        ORDER BY name`
    )
    .all(userId);

  res.json(categories);
});

module.exports = router;
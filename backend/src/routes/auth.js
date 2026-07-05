/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * FR1: user registration & auth
 *
 * register hashes the password with bcrypt, login verifies it
 * no session/token layer yet - login just confirms the credentials and
 * returns the public user record. tokens come later once the frontend exists
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

// never send the password hash back to the client
const publicUser = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');

// POST /api/auth/register -> create an account
router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email and password are required.');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'password must be at least 8 characters.');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email.toLowerCase(), passwordHash);

  res.status(201).json(publicUser.get(info.lastInsertRowid));
});

// POST /api/auth/login -> verify credentials
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required.');
  }

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.toLowerCase());

  // same message either way so nobody can probe which emails exist
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  res.json(publicUser.get(user.id));
});

module.exports = router;
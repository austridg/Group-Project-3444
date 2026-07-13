/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * express app wiring (express 5)
 * kept separate from the server so tests can import the app without opening
 * a socket - server.js is the thing that actually listens
 */

const express = require('express');
const cors = require('cors');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const summaryRoutes = require('./routes/summary');
const budgetRoutes = require('./routes/budgets');
const billRoutes = require('./routes/bills');
const subscriptionRoutes = require('./routes/subscriptions');

const app = express();

app.use(cors()); // let the (future) frontend call the api
app.use(express.json()); // parse json request bodies into req.body

// quick "is it up?" check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// feature routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// unmatched routes -> 404, then everything runs through the error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
/**
 * last updated: 2026-07-04
 * update author: Austin
 */

'use strict';

/*
 * turns thrown errors into clean json responses
 * routes just throw an ApiError and express forwards it here
 */

// small typed error so routes can set the http status they want
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// runs only when no route matched the request
function notFound(req, res, next) {
  next(new ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

// final error handler - needs all four args so express treats it as one
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // fired when a UNIQUE constraint (like an email) is hit
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ error: 'That record already exists.' });
  }

  // fired when a referenced row is missing - usually a stale/unknown userId
  // (e.g. logged-in user was removed) or a category_id that doesn't exist
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({
      error: 'Unknown user or category. Try logging in again.',
    });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err); // unexpected - log full stack
  }

  res.status(status).json({ error: err.message || 'Internal Server Error' });
}

module.exports = { ApiError, notFound, errorHandler };
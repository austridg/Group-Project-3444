/**
 * last updated: 2026-07-02
 * update author: Austin
 */

'use strict';

/**
 * import this module anywhere db access is needed:
 *   const db = require('./db');
 *   const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// location of the db file - overridable via env var
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = process.env.CENTSIBLE_DB_PATH || path.join(DATA_DIR, 'centsible.db');

// ensure the data directory exists before opening the file
if (DB_PATH !== ':memory:') {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);

// enforce foreign key constraints
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

module.exports = db;
module.exports.DB_PATH = DB_PATH;
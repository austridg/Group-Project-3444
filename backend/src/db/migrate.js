/**
 * last updated: 2026-07-02
 * update author: Austin
 */

'use strict';

/*
 * usage:
 *   npm run db:migrate
 *   node src/db/migrate.js --reset
*/

const fs = require('fs');
const path = require('path');
const db = require('./index');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const reset = process.argv.includes('--reset');

if (reset) {
  console.log('Resetting database (dropping all tables)...');
  // drop in reverse dependency order so foreign keys never block a drop
  const dropOrder = ['budgets', 'subscriptions', 'bills', 'transactions', 'categories', 'users'];
  const dropAll = db.transaction(() => {
    for (const table of dropOrder) {
      db.exec(`DROP TABLE IF EXISTS ${table};`);
    }
  });
  dropAll();
}

console.log(`Applying schema to ${db.DB_PATH} ...`);
db.exec(schema);

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
  .all()
  .map((row) => row.name);

console.log('Migration complete. Tables:', tables.join(', '));
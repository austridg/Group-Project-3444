'use strict';

/*
 * Usage:  npm run db:seed
*/

const db = require('./index');

// personal finance categories
const DEFAULT_CATEGORIES = [
  'Income',
  'Housing',
  'Groceries',
  'Utilities',
  'Transportation',
  'Dining',
  'Entertainment',
  'Subscriptions',
  'Health',
  'Savings',
  'Other',
];

const insert = db.prepare('INSERT OR IGNORE INTO categories (user_id, name) VALUES (NULL, ?)');

const seed = db.transaction((names) => {
  let added = 0;
  for (const name of names) {
    const info = insert.run(name);
    added += info.changes;
  }
  return added;
});

const added = seed(DEFAULT_CATEGORIES);
console.log(`Seed complete. Added ${added} new default categories (${DEFAULT_CATEGORIES.length} total defined).`);
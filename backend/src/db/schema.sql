-- Centsible database schema (SQLite)

PRAGMA foreign_keys = ON;

-- FR1: user registration & authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, -- bcrypt hash (never store plaintext)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- categories organize transactions & budgets by type
-- user_id NULL  -> global default category (seeded), visible to everyone
-- user_id set   -> a custom category created by that user
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, name)
);

-- FR2: transaction management (income & expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount REAL NOT NULL CHECK (amount >= 0),
  description TEXT,
  transaction_date TEXT NOT NULL, -- date the money moved (YYYY-MM-DD)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FR4: bill tracker (one-off / recurring bills with a due date)
CREATE TABLE IF NOT EXISTS bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  due_date TEXT NOT NULL, -- next due date (YYYY-MM-DD)
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'quarterly', 'yearly')),
  is_paid INTEGER NOT NULL DEFAULT 0 CHECK (is_paid IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FR4: subscription tracker (recurring services on a billing cycle)
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_renewal_date TEXT, -- next charge date (YYYY-MM-DD)
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FR3: budget management (monthly spending limit)
-- category_id NULL -> overall monthly budget for the user
-- category_id set  -> budget limited to that spending category
-- current_spending is computed on the fly from transactions
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  monthly_limit REAL NOT NULL CHECK (monthly_limit >= 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, category_id, month, year)
);

-- indexes for the common lookups (everything is queried per-user)
CREATE INDEX IF NOT EXISTS idx_transactions_user  ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date  ON transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_bills_user         ON bills (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user       ON budgets (user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user    ON categories (user_id);
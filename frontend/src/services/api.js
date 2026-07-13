import axios from "axios";

// Matches the team backend: Express on port 3000, routes under /api
// (see backend/src/server.js and backend/src/app.js)
const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Current user helpers ----
// No token auth yet — the backend identifies the user by userId,
// so we remember the user returned by login/register in localStorage.

export function saveUser(user) {
  localStorage.setItem("centsibleUser", JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem("centsibleUser");
  return raw ? JSON.parse(raw) : null;
}

export function getUserId() {
  return getUser()?.id ?? null;
}

export function clearUser() {
  localStorage.removeItem("centsibleUser");
}

// ---- Auth ----
// POST /api/auth/register { name, email, password (min 8 chars) }
export const register = (data) => api.post("/auth/register", data);

// POST /api/auth/login { email, password } -> { id, name, email, created_at }
export const login = (data) => api.post("/auth/login", data);

// ---- Categories ----
// GET /api/categories?userId=1 -> [{ id, user_id, name }]
export const getCategories = () =>
  api.get("/categories", { params: { userId: getUserId() } });

// ---- Transactions ----
// GET /api/transactions?userId=1
// -> [{ id, type, amount, description, transaction_date, category_id, category_name, created_at }]
export const getTransactions = () =>
  api.get("/transactions", { params: { userId: getUserId() } });

// POST /api/transactions
// { userId, type: 'income'|'expense', amount (number), description,
//   transaction_date: 'YYYY-MM-DD', category_id (optional) }
export const createTransaction = (data) =>
  api.post("/transactions", { ...data, userId: getUserId() });

// PUT /api/transactions/:id
// { userId, type, amount (number), description, transaction_date, category_id }
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, { ...data, userId: getUserId() });

// DELETE /api/transactions/:id?userId=1
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`, { params: { userId: getUserId() } });

// ---- Summary ----
// GET /api/summary?userId=1
// -> { total_income, total_expense, balance, spending_by_category: [{ category, total }] }
export const getSummary = () =>
  api.get("/summary", { params: { userId: getUserId() } });

// ---- Budgets ----
// GET /api/budgets?userId=1&month=7&year=2026 (month/year optional -> current month)
// -> [{ id, category_id, category_name, monthly_limit, current_spending, month, year }]
export const getBudgets = (month, year) =>
  api.get("/budgets", { params: { userId: getUserId(), month, year } });

// POST /api/budgets { userId, category_id (null = overall), monthly_limit, month, year }
// re-posting the same category+period overwrites the limit (upsert).
export const saveBudget = (data) =>
  api.post("/budgets", { ...data, userId: getUserId() });

// DELETE /api/budgets/:id?userId=1
export const deleteBudget = (id) =>
  api.delete(`/budgets/${id}`, { params: { userId: getUserId() } });

// ---- Bills (FR4) ----
// GET /api/bills?userId=1
// -> [{ id, name, amount, due_date, frequency, is_paid, created_at }]
export const getBills = () =>
  api.get("/bills", { params: { userId: getUserId() } });

// POST /api/bills { userId, name, amount, due_date, frequency, is_paid }
export const createBill = (data) =>
  api.post("/bills", { ...data, userId: getUserId() });

// PUT /api/bills/:id { userId, name, amount, due_date, frequency, is_paid }
export const updateBill = (id, data) =>
  api.put(`/bills/${id}`, { ...data, userId: getUserId() });

// DELETE /api/bills/:id?userId=1
export const deleteBill = (id) =>
  api.delete(`/bills/${id}`, { params: { userId: getUserId() } });

// ---- Subscriptions (FR4) ----
// GET /api/subscriptions?userId=1
// -> [{ id, name, amount, billing_cycle, next_renewal_date, is_active, created_at }]
export const getSubscriptions = () =>
  api.get("/subscriptions", { params: { userId: getUserId() } });

// POST /api/subscriptions { userId, name, amount, billing_cycle, next_renewal_date, is_active }
export const createSubscription = (data) =>
  api.post("/subscriptions", { ...data, userId: getUserId() });

// PUT /api/subscriptions/:id
export const updateSubscription = (id, data) =>
  api.put(`/subscriptions/${id}`, { ...data, userId: getUserId() });

// DELETE /api/subscriptions/:id?userId=1
export const deleteSubscription = (id) =>
  api.delete(`/subscriptions/${id}`, { params: { userId: getUserId() } });

export default api;

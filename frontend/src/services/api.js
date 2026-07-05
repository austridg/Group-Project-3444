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

// DELETE /api/transactions/:id?userId=1
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`, { params: { userId: getUserId() } });

// ---- Summary ----
// GET /api/summary?userId=1
// -> { total_income, total_expense, balance, spending_by_category: [{ category, total }] }
export const getSummary = () =>
  api.get("/summary", { params: { userId: getUserId() } });

// ---- Not built in the backend yet ----
// Bills, subscriptions, and budgets have database tables but no routes.
// The Bills and Budget pages use mock data until these exist:
// export const getBills = () => api.get("/bills", { params: { userId: getUserId() } });
// export const createBill = (data) => api.post("/bills", { ...data, userId: getUserId() });
// export const getBudgets = () => api.get("/budgets", { params: { userId: getUserId() } });

export default api;

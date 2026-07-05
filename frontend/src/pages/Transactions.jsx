import { useState, useEffect } from "react";
import TransactionTable from "../components/TransactionTable.jsx";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getCategories,
} from "../services/api";

const emptyForm = {
  description: "",
  amount: "",
  category_id: "",
  type: "expense",
  transaction_date: "",
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load transactions and categories from the backend on mount
  useEffect(() => {
    Promise.all([getTransactions(), getCategories()])
      .then(([txRes, catRes]) => {
        setTransactions(txRes.data);
        setCategories(catRes.data);
      })
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await createTransaction({
        description: form.description,
        amount: Number(form.amount), // backend requires a number
        type: form.type,
        transaction_date: form.transaction_date, // YYYY-MM-DD from the date input
        category_id: form.category_id ? Number(form.category_id) : null,
      });
      // Backend returns the saved row but without category_name (it's a JOIN),
      // so attach the name from our categories list for display.
      const cat = categories.find((c) => c.id === Number(form.category_id));
      const saved = { ...res.data, category_name: cat?.name ?? null };
      setTransactions([saved, ...transactions]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the transaction.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch {
      setError("Could not delete the transaction.");
    }
  };

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-semibold mb-6">Transactions</h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Transaction table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-base font-semibold mb-4">All Transactions</h3>
        {loading ? (
          <p className="text-sm text-zinc-500 py-6 text-center">Loading…</p>
        ) : (
          <TransactionTable
            transactions={transactions}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Add transaction form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4">Add Transaction</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Description
            </label>
            <input
              name="description"
              type="text"
              required
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Coffee"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Amount</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Category
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Date</label>
            <input
              name="transaction_date"
              type="date"
              required
              value={form.transaction_date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
            >
              Add transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard.jsx";
import BudgetProgress from "../components/BudgetProgress.jsx";
import {
  getBudgets,
  getCategories,
  getTransactions,
  saveBudget,
  deleteBudget,
} from "../services/api";

// The budget page works one month at a time. Default to the current month.
const NOW = new Date();
const MONTH = NOW.getMonth() + 1; // JS months are 0-based
const YEAR = NOW.getFullYear();
const MONTH_LABEL = NOW.toLocaleString(undefined, { month: "long", year: "numeric" });
const MONTH_KEY = `${YEAR}-${String(MONTH).padStart(2, "0")}`; // e.g. "2026-07"

// format as money; negatives read "-$50" rather than "$-50"
const money = (n) =>
  (n < 0 ? "-$" : "$") +
  Math.abs(Number(n)).toLocaleString(undefined, { maximumFractionDigits: 2 });

const emptyForm = { category_id: "", monthly_limit: "" };

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthExpense, setMonthExpense] = useState(0); // all expenses this month
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // (re)load this month's budgets from the backend
  const loadBudgets = () =>
    getBudgets(MONTH, YEAR)
      .then((res) => setBudgets(res.data))
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      );

  useEffect(() => {
    Promise.all([getBudgets(MONTH, YEAR), getCategories(), getTransactions()])
      .then(([budgetRes, catRes, txRes]) => {
        setBudgets(budgetRes.data);
        setCategories(catRes.data);
        // total spent this month across ALL categories (drives the overall total)
        setMonthExpense(
          txRes.data
            .filter(
              (t) =>
                t.type === "expense" &&
                String(t.transaction_date).startsWith(MONTH_KEY)
            )
            .reduce((s, t) => s + t.amount, 0)
        );
      })
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      )
      .finally(() => setLoading(false));
  }, []);

  // Budgets are per-category; "Overall" sums their limits, but spending counts
  // EVERY expense this month (even in categories without a budget).
  const categoryBudgets = budgets.filter((b) => b.category_id !== null);
  const hasBudgets = categoryBudgets.length > 0;

  const totalLimit = categoryBudgets.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = monthExpense; // all month expenses, not just budgeted ones
  const totalRemaining = totalLimit - totalSpent;
  const percentUsed = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await saveBudget({
        category_id: Number(form.category_id), // a category is always chosen now
        monthly_limit: Number(form.monthly_limit), // backend requires a number
        month: MONTH,
        year: YEAR,
      });
      await loadBudgets(); // refetch so current_spending is recomputed
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the budget.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      await loadBudgets();
    } catch {
      setError("Could not delete the budget.");
    }
  };

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

  // mark categories that already have a budget (re-saving updates the limit)
  const budgetedCategoryIds = new Set(categoryBudgets.map((b) => b.category_id));

  return (
    <div className="max-w-4xl">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-2xl font-semibold">Budget</h2>
        <span className="text-sm text-zinc-500">{MONTH_LABEL}</span>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 py-6 text-center">Loading…</p>
      ) : (
        <>
          {/* Headline totals (the "overall" = sum of all category budgets) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <SummaryCard
              label="Total Budget"
              value={hasBudgets ? money(totalLimit) : "—"}
            />
            <SummaryCard
              label="Spent"
              value={"-" + money(totalSpent)}
              tone="negative"
            />
            <SummaryCard
              label="Remaining"
              value={hasBudgets ? money(totalRemaining) : "—"}
              tone={totalRemaining >= 0 ? "positive" : "negative"}
            />
          </div>

          {/* One combined card: overall roll-up + categories + the form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold mb-4">Budgets</h3>

            {hasBudgets ? (
              <>
                {/* Overall roll-up (derived from the categories below) */}
                <BudgetProgress
                  label="Overall (all categories)"
                  spent={totalSpent}
                  limit={totalLimit}
                />
                <p className="text-xs text-zinc-500 mt-1.5">
                  {percentUsed}% of your total budget used ·{" "}
                  <span
                    className={
                      totalRemaining >= 0 ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {money(totalRemaining)}
                  </span>{" "}
                  remaining
                </p>

                {/* Per-category breakdown */}
                <div className="border-t border-zinc-800 mt-5 pt-5 space-y-5">
                  {categoryBudgets.map((b) => (
                    <div key={b.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <BudgetProgress
                          label={b.category_name}
                          spent={b.current_spending}
                          limit={b.monthly_limit}
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                        title={`Remove ${b.category_name} budget`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500 py-2">
                No budgets yet — add one below to get started.
              </p>
            )}

            {/* Set / update a budget (part of the same card now) */}
            <div className="border-t border-zinc-800 mt-5 pt-5">
              <h4 className="text-sm font-semibold mb-4">Set a Budget</h4>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Category
                  </label>
                  <select
                    name="category_id"
                    required
                    value={form.category_id}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select a category…
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {budgetedCategoryIds.has(c.id) ? " (update)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">
                    Monthly Limit
                  </label>
                  <input
                    name="monthly_limit"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.monthly_limit}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                  >
                    Save budget
                  </button>
                </div>
              </form>
              <p className="text-xs text-zinc-500 mt-3">
                Saving a category that already has a budget updates its limit.
                The overall total updates automatically.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

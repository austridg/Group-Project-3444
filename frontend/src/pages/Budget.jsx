import { useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard.jsx";
import BudgetProgress from "../components/BudgetProgress.jsx";
import { getSummary } from "../services/api";

// TODO: replace with GET /api/budgets once the backend adds budget routes.
// The budgets table already exists in the database schema.
const MONTHLY_LIMIT = 1500;
const CATEGORY_LIMITS = {
  Housing: 900,
  Food: 400,
  Subscriptions: 100,
};
const DEFAULT_CATEGORY_LIMIT = 200; // for categories without a set limit

const money = (n) =>
  "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Budget() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSummary()
      .then((res) => setSummary(res.data))
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      );
  }, []);

  const spent = summary?.total_expense ?? 0;
  const remaining = MONTHLY_LIMIT - spent;
  const byCategory = summary?.spending_by_category ?? [];

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Budget</h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Top numbers (spent is live) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Monthly Limit" value={money(MONTHLY_LIMIT)} />
        <SummaryCard label="Spent" value={"-" + money(spent)} tone="negative" />
        <SummaryCard
          label="Remaining"
          value={money(remaining)}
          tone={remaining >= 0 ? "positive" : "negative"}
        />
      </div>

      {/* Overall progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-base font-semibold mb-4">Overall Progress</h3>
        <BudgetProgress label="This month" spent={spent} limit={MONTHLY_LIMIT} />
        <p className="text-xs text-zinc-500 mt-3">
          {Math.round((spent / MONTHLY_LIMIT) * 100)}% of your monthly budget
          used.
        </p>
      </div>

      {/* Category breakdown (spending is live; limits are local for now) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4">Spending by Category</h3>
        {byCategory.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">
            No expenses yet — add some transactions first.
          </p>
        ) : (
          <div className="space-y-5">
            {byCategory.map((c) => (
              <BudgetProgress
                key={c.category}
                label={c.category}
                spent={c.total}
                limit={CATEGORY_LIMITS[c.category] ?? DEFAULT_CATEGORY_LIMIT}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

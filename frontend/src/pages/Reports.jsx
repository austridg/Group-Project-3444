import { useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard.jsx";
import BudgetProgress from "../components/BudgetProgress.jsx";
import { getSummary, getTransactions } from "../services/api";

const money = (n) =>
  "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), getTransactions()])
      .then(([sumRes, txRes]) => {
        setSummary(sumRes.data);
        setTransactions(txRes.data);
      })
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      );
  }, []);

  const totalSpent = summary?.total_expense ?? 0;
  const byCategory = summary?.spending_by_category ?? [];
  const largestCategory = byCategory[0]?.category ?? "—";

  // Average per day: spread total spending across the days seen in the data
  const expenseTxs = transactions.filter((t) => t.type === "expense");
  const uniqueDays = new Set(expenseTxs.map((t) => t.transaction_date)).size;
  const averagePerDay = uniqueDays > 0 ? totalSpent / uniqueDays : 0;

  // Top 5 expenses by amount
  const topTransactions = [...expenseTxs]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Reports</h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total Spent"
          value={"-" + money(totalSpent)}
          tone="negative"
        />
        <SummaryCard label="Largest Category" value={largestCategory} />
        <SummaryCard label="Transactions" value={transactions.length} />
        <SummaryCard label="Average / Day" value={money(averagePerDay)} />
      </div>

      {/* Spending by category (live from GET /api/summary) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
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
                limit={totalSpent || 1}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-zinc-500 mt-4">
          Bars show each category's share of total spending.
        </p>
      </div>

      {/* Top transactions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4">Top Transactions</h3>
        {topTransactions.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">
            Nothing to show yet.
          </p>
        ) : (
          <div className="space-y-2.5">
            {topTransactions.map((t, index) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-4">{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {t.description || "—"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {t.category_name || "Uncategorized"} ·{" "}
                      {t.transaction_date}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-red-400">
                  -{money(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

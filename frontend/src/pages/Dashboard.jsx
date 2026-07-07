import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SummaryCard from "../components/SummaryCard.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import BudgetProgress from "../components/BudgetProgress.jsx";
import BillCard from "../components/BillCard.jsx";
import { getSummary, getTransactions, getBudgets } from "../services/api";

// TODO: replace with GET /api/bills once the backend adds bill routes
const billsDueSoon = [
  { id: 1, name: "Electricity", amount: 85, dueDate: "Jul 10", frequency: "Monthly" },
  { id: 2, name: "Internet", amount: 60, dueDate: "Jul 12", frequency: "Monthly" },
  { id: 3, name: "Spotify", amount: 11, dueDate: "Jul 15", frequency: "Monthly" },
];

// budget progress is scoped to the current month
const NOW = new Date();
const MONTH = NOW.getMonth() + 1; // JS months are 0-based
const YEAR = NOW.getFullYear();
const MONTH_KEY = `${YEAR}-${String(MONTH).padStart(2, "0")}`; // e.g. "2026-07"

// format as money; negatives read "-$50" rather than "$-50"
const money = (n) =>
  (n < 0 ? "-$" : "$") +
  Math.abs(Number(n)).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]); // this month's per-category budgets
  const [monthExpense, setMonthExpense] = useState(0); // all expenses this month
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), getTransactions(), getBudgets(MONTH, YEAR)])
      .then(([sumRes, txRes, budgetRes]) => {
        setSummary(sumRes.data);
        setRecent(txRes.data.slice(0, 5)); // newest 5 (backend sorts newest first)
        setBudgets(budgetRes.data);
        // total spent this month across ALL categories (drives the overall budget)
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
      );
  }, []);

  const income = summary?.total_income ?? 0;
  const expenses = summary?.total_expense ?? 0;
  const balance = summary?.balance ?? 0;

  // Budgets are per-category; "Overall" sums their limits, but spending counts
  // EVERY expense this month (even in categories without a budget).
  const categoryBudgets = budgets.filter((b) => b.category_id !== null);
  const hasBudget = categoryBudgets.length > 0;

  const totalBudgeted = categoryBudgets.reduce((s, b) => s + b.monthly_limit, 0);
  const totalSpent = monthExpense; // all month expenses, not just budgeted ones
  const totalAvailable = totalBudgeted - totalSpent;

  const available = (b) => b.monthly_limit - b.current_spending;
  const availableClass = (n) =>
    n >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Summary cards (live from GET /api/summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Balance" value={money(balance)} />
        <SummaryCard label="Income" value={"+" + money(income)} tone="positive" />
        <SummaryCard label="Expenses" value={"-" + money(expenses)} tone="negative" />
        <SummaryCard
          label="Budget Left"
          value={hasBudget ? money(totalAvailable) : "N/A"}
          tone={hasBudget ? (totalAvailable >= 0 ? "positive" : "negative") : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions (live) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4">Recent Transactions</h3>
          <TransactionTable transactions={recent} />
        </div>

        <div className="space-y-4">
          {/* Budgets (live from GET /api/budgets: overall + per-category) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Budgets</h3>
              <Link
                to="/budget"
                className="text-xs text-emerald-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            {!hasBudget ? (
              <p className="text-sm text-zinc-500">
                No budget set yet.{" "}
                <Link to="/budget" className="text-emerald-400 hover:underline">
                  Set one on the Budget page.
                </Link>
              </p>
            ) : (
              <div className="space-y-5">
                {/* Overall roll-up (sum of all category budgets) */}
                <div>
                  <BudgetProgress
                    label="Overall"
                    spent={totalSpent}
                    limit={totalBudgeted}
                  />
                  <p className="text-xs text-zinc-500 mt-1.5 text-right">
                    <span className={availableClass(totalAvailable)}>
                      {money(totalAvailable)}
                    </span>{" "}
                    available
                  </p>
                </div>

                {/* Per-category breakdown */}
                <div className="border-t border-zinc-800 pt-5 space-y-5">
                  {categoryBudgets.map((b) => (
                    <div key={b.id}>
                      <BudgetProgress
                        label={b.category_name}
                        spent={b.current_spending}
                        limit={b.monthly_limit}
                      />
                      <p className="text-xs text-zinc-500 mt-1.5 text-right">
                        <span className={availableClass(available(b))}>
                          {money(available(b))}
                        </span>{" "}
                        available
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bills due soon (mock until backend adds bill routes) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold mb-4">Bills Due Soon</h3>
            <div className="space-y-2.5">
              {billsDueSoon.map((bill) => (
                <BillCard key={bill.id} {...bill} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

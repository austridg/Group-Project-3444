import { useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard.jsx";
import TransactionTable from "../components/TransactionTable.jsx";
import BudgetProgress from "../components/BudgetProgress.jsx";
import BillCard from "../components/BillCard.jsx";
import { getSummary, getTransactions } from "../services/api";

// TODO: replace with GET /api/bills once the backend adds bill routes
const billsDueSoon = [
  { id: 1, name: "Electricity", amount: 85, dueDate: "Jul 10", frequency: "Monthly" },
  { id: 2, name: "Internet", amount: 60, dueDate: "Jul 12", frequency: "Monthly" },
  { id: 3, name: "Spotify", amount: 11, dueDate: "Jul 15", frequency: "Monthly" },
];

// TODO: replace with GET /api/budgets once the backend adds budget routes
const MONTHLY_BUDGET = 1500;

const money = (n) =>
  "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSummary(), getTransactions()])
      .then(([sumRes, txRes]) => {
        setSummary(sumRes.data);
        setRecent(txRes.data.slice(0, 5)); // newest 5 (backend sorts newest first)
      })
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      );
  }, []);

  const income = summary?.total_income ?? 0;
  const expenses = summary?.total_expense ?? 0;
  const balance = summary?.balance ?? 0;
  const budgetLeft = MONTHLY_BUDGET - expenses;

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
          value={money(budgetLeft)}
          tone={budgetLeft >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent transactions (live) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4">Recent Transactions</h3>
          <TransactionTable transactions={recent} />
        </div>

        <div className="space-y-4">
          {/* Budget progress (spent is live, limit is local for now) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold mb-4">Budget Progress</h3>
            <BudgetProgress
              label="This month"
              spent={expenses}
              limit={MONTHLY_BUDGET}
            />
            <p className="text-xs text-zinc-500 mt-3">
              {Math.round((expenses / MONTHLY_BUDGET) * 100)}% of this month's
              budget used.
            </p>
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

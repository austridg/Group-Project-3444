// A labeled progress bar: shows spent vs limit with a colored fill.
// Turns amber past 75% and red past 100%.
export default function BudgetProgress({ label, spent, limit }) {
  const percent = Math.min((spent / limit) * 100, 100);
  const barColor =
    spent > limit
      ? "bg-red-500"
      : percent > 75
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">
          ${spent.toLocaleString()} / ${limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

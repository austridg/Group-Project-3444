// A small stat card used on the Dashboard.
// `tone` controls the value color: "positive" (green), "negative" (red), or default (white).
export default function SummaryCard({ label, value, tone }) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
      ? "text-red-400"
      : "text-zinc-100";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className={`text-2xl font-semibold mt-2 ${toneClass}`}>{value}</p>
    </div>
  );
}

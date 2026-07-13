// A single bill or subscription row shown inside a card list.
// - name, amount: required
// - meta: subtitle line (e.g. "Due 2026-07-20 · Monthly")
// - badge/badgeTone: optional status pill ("Paid", "Active", …)
// - onToggleStatus: if given, the badge becomes a button (mark paid / cancel)
// - onEdit/onDelete: optional row actions
export default function BillCard({
  name,
  amount,
  meta,
  badge,
  badgeTone = "zinc",
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  const toneClass = {
    green: "bg-emerald-500/15 text-emerald-400",
    zinc: "bg-zinc-700/50 text-zinc-400",
    amber: "bg-amber-500/15 text-amber-400",
  }[badgeTone];

  return (
    <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-zinc-100 flex items-center gap-2">
          <span className="truncate">{name}</span>
          {badge &&
            (onToggleStatus ? (
              <button
                onClick={onToggleStatus}
                title="Toggle status"
                className={`text-[10px] px-1.5 py-0.5 rounded ${toneClass} hover:opacity-80 transition-opacity`}
              >
                {badge}
              </button>
            ) : (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${toneClass}`}>
                {badge}
              </span>
            ))}
        </p>
        <p className="text-xs text-zinc-500 mt-0.5">{meta}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <p className="text-sm font-semibold text-red-400">
          -${Number(amount).toLocaleString()}
        </p>
        {onEdit && (
          <button
            onClick={onEdit}
            title="Edit"
            className="text-zinc-600 hover:text-emerald-400 transition-colors"
          >
            ✎
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            title="Delete"
            className="text-zinc-600 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

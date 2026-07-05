// A single bill or subscription row shown inside a card list.
export default function BillCard({ name, amount, dueDate, frequency }) {
  return (
    <div className="flex items-center justify-between bg-zinc-800/50 border border-zinc-800 rounded-lg px-4 py-3">
      <div>
        <p className="text-sm font-medium text-zinc-100">{name}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          Due {dueDate} · {frequency}
        </p>
      </div>
      <p className="text-sm font-semibold text-red-400">
        -${Number(amount).toLocaleString()}
      </p>
    </div>
  );
}

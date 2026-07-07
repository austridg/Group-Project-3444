// Renders transactions using the backend's field names:
// { id, description, category_name, type: "income" | "expense", amount, transaction_date }
// Pass an optional onDelete(id) and/or onEdit(transaction) to show row actions.
export default function TransactionTable({ transactions, onDelete, onEdit }) {
  const showActions = onEdit || onDelete;
  if (!transactions.length) {
    return (
      <p className="text-sm text-zinc-500 py-6 text-center">
        No transactions yet. Add one below to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500 border-b border-zinc-800">
            <th className="py-3 pr-4 font-medium">Description</th>
            <th className="py-3 pr-4 font-medium">Category</th>
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 text-right font-medium">Amount</th>
            {showActions && <th className="py-3 pl-4 w-20"></th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30"
            >
              <td className="py-3 pr-4">{t.description || "—"}</td>
              <td className="py-3 pr-4 text-zinc-400">
                {t.category_name || "Uncategorized"}
              </td>
              <td className="py-3 pr-4 text-zinc-400">{t.transaction_date}</td>
              <td
                className={`py-3 text-right font-medium ${
                  t.type === "income" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {t.type === "income" ? "+" : "-"}$
                {Math.abs(t.amount).toLocaleString()}
              </td>
              {showActions && (
                <td className="py-3 pl-4 text-right whitespace-nowrap">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      title="Edit transaction"
                      className="text-zinc-600 hover:text-emerald-400 transition-colors mr-3"
                    >
                      ✎
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t.id)}
                      title="Delete transaction"
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";
import BillCard from "../components/BillCard.jsx";

const initialBills = [
  { id: 1, name: "Electricity", amount: 85, dueDate: "Jul 10", frequency: "Monthly" },
  { id: 2, name: "Internet", amount: 60, dueDate: "Jul 12", frequency: "Monthly" },
  { id: 3, name: "Water", amount: 35, dueDate: "Jul 18", frequency: "Monthly" },
];

const subscriptions = [
  { id: 1, name: "Netflix", amount: 18, dueDate: "Jul 04", frequency: "Monthly" },
  { id: 2, name: "Spotify", amount: 11, dueDate: "Jul 15", frequency: "Monthly" },
  { id: 3, name: "iCloud", amount: 3, dueDate: "Jul 20", frequency: "Monthly" },
];

const emptyForm = { name: "", amount: "", dueDate: "", frequency: "Monthly" };

export default function Bills() {
  const [bills, setBills] = useState(initialBills);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update local state only — later this will call createBill() in services/api.js
    setBills([...bills, { id: Date.now(), ...form, amount: Number(form.amount) }]);
    setForm(emptyForm);
  };

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6">Bills & Subscriptions</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Upcoming bills */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4">Upcoming Bills</h3>
          <div className="space-y-2.5">
            {bills.map((bill) => (
              <BillCard key={bill.id} {...bill} />
            ))}
          </div>
        </div>

        {/* Subscriptions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4">Subscriptions</h3>
          <div className="space-y-2.5">
            {subscriptions.map((sub) => (
              <BillCard key={sub.id} {...sub} />
            ))}
          </div>
        </div>
      </div>

      {/* Add bill form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-semibold mb-4">Add Bill</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Name</label>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Gym"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Amount</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Due date
            </label>
            <input
              name="dueDate"
              type="text"
              required
              value={form.dueDate}
              onChange={handleChange}
              placeholder="e.g. Jul 25"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">
              Frequency
            </label>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors"
            >
              Add bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

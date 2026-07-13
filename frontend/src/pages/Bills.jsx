import { useState, useEffect } from "react";
import BillCard from "../components/BillCard.jsx";
import {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../services/api";

const BILL_FREQUENCIES = ["one-time", "weekly", "monthly", "quarterly", "yearly"];
const SUB_CYCLES = ["weekly", "monthly", "quarterly", "yearly"];
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const emptyBill = { name: "", amount: "", due_date: "", frequency: "monthly", is_paid: false };
const emptySub = { name: "", amount: "", billing_cycle: "monthly", next_renewal_date: "", is_active: true };

const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [subs, setSubs] = useState([]);
  const [billForm, setBillForm] = useState(emptyBill);
  const [subForm, setSubForm] = useState(emptySub);
  const [editingBillId, setEditingBillId] = useState(null);
  const [editingSubId, setEditingSubId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAll = () =>
    Promise.all([getBills(), getSubscriptions()])
      .then(([bRes, sRes]) => {
        setBills(bRes.data);
        setSubs(sRes.data);
      })
      .catch(() =>
        setError("Could not load data. Is the backend running on port 3000?")
      );

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, []);

  // ---- Bills ----
  const submitBill = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: billForm.name,
      amount: Number(billForm.amount),
      due_date: billForm.due_date,
      frequency: billForm.frequency,
      is_paid: billForm.is_paid,
    };
    try {
      if (editingBillId) await updateBill(editingBillId, payload);
      else await createBill(payload);
      await loadAll();
      setBillForm(emptyBill);
      setEditingBillId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the bill.");
    }
  };

  const editBill = (b) => {
    setEditingBillId(b.id);
    setBillForm({
      name: b.name,
      amount: String(b.amount),
      due_date: b.due_date,
      frequency: b.frequency,
      is_paid: !!b.is_paid,
    });
    setError("");
  };

  const cancelBillEdit = () => {
    setEditingBillId(null);
    setBillForm(emptyBill);
  };

  const removeBill = async (id) => {
    try {
      await deleteBill(id);
      await loadAll();
      if (editingBillId === id) cancelBillEdit();
    } catch {
      setError("Could not delete the bill.");
    }
  };

  const togglePaid = async (b) => {
    try {
      await updateBill(b.id, {
        name: b.name,
        amount: b.amount,
        due_date: b.due_date,
        frequency: b.frequency,
        is_paid: !b.is_paid,
      });
      await loadAll();
    } catch {
      setError("Could not update the bill.");
    }
  };

  // ---- Subscriptions ----
  const submitSub = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: subForm.name,
      amount: Number(subForm.amount),
      billing_cycle: subForm.billing_cycle,
      next_renewal_date: subForm.next_renewal_date || null,
      is_active: subForm.is_active,
    };
    try {
      if (editingSubId) await updateSubscription(editingSubId, payload);
      else await createSubscription(payload);
      await loadAll();
      setSubForm(emptySub);
      setEditingSubId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save the subscription.");
    }
  };

  const editSub = (s) => {
    setEditingSubId(s.id);
    setSubForm({
      name: s.name,
      amount: String(s.amount),
      billing_cycle: s.billing_cycle,
      next_renewal_date: s.next_renewal_date ?? "",
      is_active: !!s.is_active,
    });
    setError("");
  };

  const cancelSubEdit = () => {
    setEditingSubId(null);
    setSubForm(emptySub);
  };

  const removeSub = async (id) => {
    try {
      await deleteSubscription(id);
      await loadAll();
      if (editingSubId === id) cancelSubEdit();
    } catch {
      setError("Could not delete the subscription.");
    }
  };

  const toggleActive = async (s) => {
    try {
      await updateSubscription(s.id, {
        name: s.name,
        amount: s.amount,
        billing_cycle: s.billing_cycle,
        next_renewal_date: s.next_renewal_date,
        is_active: !s.is_active,
      });
      await loadAll();
    } catch {
      setError("Could not update the subscription.");
    }
  };

  const handleBillChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBillForm({ ...billForm, [name]: type === "checkbox" ? checked : value });
  };
  const handleSubChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSubForm({ ...subForm, [name]: type === "checkbox" ? checked : value });
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-semibold mb-6">Bills &amp; Subscriptions</h2>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 py-6 text-center">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ---------------- Bills ---------------- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold mb-4">Upcoming Bills</h3>

            {bills.length === 0 ? (
              <p className="text-sm text-zinc-500 py-2">No bills yet — add one below.</p>
            ) : (
              <div className="space-y-2.5">
                {bills.map((b) => (
                  <BillCard
                    key={b.id}
                    name={b.name}
                    amount={b.amount}
                    meta={`Due ${b.due_date} · ${cap(b.frequency)}`}
                    badge={b.is_paid ? "Paid" : "Due"}
                    badgeTone={b.is_paid ? "green" : "amber"}
                    onToggleStatus={() => togglePaid(b)}
                    onEdit={() => editBill(b)}
                    onDelete={() => removeBill(b.id)}
                  />
                ))}
              </div>
            )}

            {/* Add / edit bill */}
            <div className="border-t border-zinc-800 mt-5 pt-5">
              <h4 className="text-sm font-semibold mb-4">
                {editingBillId ? "Edit Bill" : "Add Bill"}
              </h4>
              <form onSubmit={submitBill} className="space-y-3">
                <input
                  name="name"
                  type="text"
                  required
                  value={billForm.name}
                  onChange={handleBillChange}
                  placeholder="Name (e.g. Electricity)"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={billForm.amount}
                    onChange={handleBillChange}
                    placeholder="Amount"
                    className={inputClass}
                  />
                  <input
                    name="due_date"
                    type="date"
                    required
                    value={billForm.due_date}
                    onChange={handleBillChange}
                    className={inputClass}
                  />
                </div>
                <select
                  name="frequency"
                  value={billForm.frequency}
                  onChange={handleBillChange}
                  className={inputClass}
                >
                  {BILL_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {cap(f)}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    name="is_paid"
                    type="checkbox"
                    checked={billForm.is_paid}
                    onChange={handleBillChange}
                    className="accent-emerald-500"
                  />
                  Already paid
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                  >
                    {editingBillId ? "Update bill" : "Add bill"}
                  </button>
                  {editingBillId && (
                    <button
                      type="button"
                      onClick={cancelBillEdit}
                      className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* ------------- Subscriptions ------------- */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-base font-semibold mb-4">Subscriptions</h3>

            {subs.length === 0 ? (
              <p className="text-sm text-zinc-500 py-2">
                No subscriptions yet — add one below.
              </p>
            ) : (
              <div className="space-y-2.5">
                {subs.map((s) => (
                  <BillCard
                    key={s.id}
                    name={s.name}
                    amount={s.amount}
                    meta={`${
                      s.next_renewal_date ? `Renews ${s.next_renewal_date} · ` : ""
                    }${cap(s.billing_cycle)}`}
                    badge={s.is_active ? "Active" : "Canceled"}
                    badgeTone={s.is_active ? "green" : "zinc"}
                    onToggleStatus={() => toggleActive(s)}
                    onEdit={() => editSub(s)}
                    onDelete={() => removeSub(s.id)}
                  />
                ))}
              </div>
            )}

            {/* Add / edit subscription */}
            <div className="border-t border-zinc-800 mt-5 pt-5">
              <h4 className="text-sm font-semibold mb-4">
                {editingSubId ? "Edit Subscription" : "Add Subscription"}
              </h4>
              <form onSubmit={submitSub} className="space-y-3">
                <input
                  name="name"
                  type="text"
                  required
                  value={subForm.name}
                  onChange={handleSubChange}
                  placeholder="Name (e.g. Netflix)"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={subForm.amount}
                    onChange={handleSubChange}
                    placeholder="Amount"
                    className={inputClass}
                  />
                  <input
                    name="next_renewal_date"
                    type="date"
                    value={subForm.next_renewal_date}
                    onChange={handleSubChange}
                    className={inputClass}
                  />
                </div>
                <select
                  name="billing_cycle"
                  value={subForm.billing_cycle}
                  onChange={handleSubChange}
                  className={inputClass}
                >
                  {SUB_CYCLES.map((c) => (
                    <option key={c} value={c}>
                      {cap(c)}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input
                    name="is_active"
                    type="checkbox"
                    checked={subForm.is_active}
                    onChange={handleSubChange}
                    className="accent-emerald-500"
                  />
                  Active
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                  >
                    {editingSubId ? "Update subscription" : "Add subscription"}
                  </button>
                  {editingSubId && (
                    <button
                      type="button"
                      onClick={cancelSubEdit}
                      className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg py-2 text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

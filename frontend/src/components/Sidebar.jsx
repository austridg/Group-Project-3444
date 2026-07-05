import { NavLink, useNavigate } from "react-router-dom";
import { clearUser, getUser } from "../services/api";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/transactions", label: "Transactions", icon: "💳" },
  { to: "/budget", label: "Budget", icon: "🎯" },
  { to: "/bills", label: "Bills & Subscriptions", icon: "🧾" },
  { to: "/reports", label: "Reports", icon: "📈" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearUser(); // forget the saved user
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* App name */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-emerald-400">Centsible</h1>
        <p className="text-xs text-zinc-500 mt-1">
          {user ? `Hi, ${user.name}` : "Personal finance tracker"}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 font-medium"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Log out */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition-colors"
        >
          <span>🚪</span>
          Log out
        </button>
      </div>
    </aside>
  );
}

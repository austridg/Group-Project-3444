import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Budget from "./pages/Budget.jsx";
import Bills from "./pages/Bills.jsx";
import Reports from "./pages/Reports.jsx";

// Layout for the main app: sidebar on the left, page content on the right
function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages (no sidebar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Main app pages (with sidebar) */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      {/* Default: send everyone to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

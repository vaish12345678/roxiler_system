
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminLayout({ active, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "▦" },
    { name: "Users", path: "/admin/users", icon: "♙" },
    { name: "Stores", path: "/admin/stores", icon: "▤" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed left-0 top-0 h-screen z-40">
        <div className="px-7 py-8 border-b border-slate-700">
          <h2 className="text-2xl font-bold tracking-wide">
            Roxiler<span className="text-indigo-400">.</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Admin Dashboard
          </p>
        </div>

        <div className="px-4 py-7 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition ${
                  active === item.name
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-red-300 hover:bg-slate-800 transition"
          >
            <span className="text-lg">↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* PAGE CONTENT */}
      <main className="min-h-screen ml-72 p-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;

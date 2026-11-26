
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/users", {
        params: { search, role, sortBy, sortOrder },
      });

      const data = response.data;
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, sortBy, sortOrder]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/admin/users", form);

      setMessage("User created successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const userCount = users.filter((u) => u.role === "USER").length;
  const ownerCount = users.filter((u) => u.role === "STORE_OWNER").length;

  const getRoleStyle = (userRole) => {
    if (userRole === "ADMIN") return "bg-purple-100 text-purple-700";
    if (userRole === "STORE_OWNER") return "bg-blue-100 text-blue-700";
    return "bg-green-100 text-green-700";
  };

  const inputStyle =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0">
        <div className="px-6 py-7 border-b border-slate-700">
          <h2 className="text-xl font-bold tracking-wide">
            Roxiler<span className="text-indigo-400">.</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
        </div>

        <div className="px-4 py-6 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">
            <button
              onClick={() => navigate("/admin")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span>▦</span> Dashboard
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium">
              <span>♙</span> Users
            </button>

            <button
              onClick={() => navigate("/admin/stores")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span>▤</span> Stores
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-slate-800 transition"
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">Admin / Users</p>
            <h1 className="text-3xl font-bold text-slate-800">
              Manage Users
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              Manage all registered users and their roles.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium shadow-sm transition"
          >
            {showForm ? "Close Form" : "+ Add New User"}
          </button>
        </header>

        {/* MESSAGES */}
        {message && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Users</p>
            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {users.length}
            </h2>
            <p className="text-xs text-gray-400 mt-2">Currently displayed</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Administrators</p>
            <h2 className="text-3xl font-bold text-purple-600 mt-2">
              {adminCount}
            </h2>
            <p className="text-xs text-gray-400 mt-2">Admin accounts</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Normal Users</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {userCount}
            </h2>
            <p className="text-xs text-gray-400 mt-2">User accounts</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Store Owners</p>
            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {ownerCount}
            </h2>
            <p className="text-xs text-gray-400 mt-2">Owner accounts</p>
          </div>
        </section>

        {/* CREATE USER FORM */}
        {showForm && (
          <form
            onSubmit={handleCreateUser}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-1">
              Create New User
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter the details below to create an account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  minLength="20"
                  maxLength="60"
                  required
                  className={inputStyle}
                />
                <p className="text-xs text-gray-400 mt-1">20–60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  minLength="8"
                  maxLength="16"
                  required
                  className={inputStyle}
                />
                <p className="text-xs text-gray-400 mt-1">
                  8–16 characters, uppercase and special character required
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={inputStyle}
                >
                  <option value="USER">Normal User</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  maxLength="400"
                  required
                  rows="3"
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition"
              >
                Create User
              </button>
            </div>
          </form>
        )}

        {/* SEARCH AND FILTER */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                Search Users
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or address..."
                className={inputStyle}
              />
            </div>

            <div className="w-full lg:w-52">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                Filter by Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputStyle}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={inputStyle}
              >
                <option value="created_at">Date Created</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="role">Role</option>
              </select>
            </div>

            <div className="w-full lg:w-40">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputStyle}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </section>

        {/* USERS TABLE */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-slate-800">All Users</h2>
              <p className="text-xs text-gray-500 mt-1">
                User account directory
              </p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
              {users.length} displayed
            </span>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-700 font-medium">No users found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try changing your search or filter.
                </p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">
                        #{user.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {user.address || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getRoleStyle(user.role)}`}>
                          {user.role?.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 mt-8">
          Roxiler Store Rating System · Admin Panel
        </p>
      </main>
    </div>
  );
}

export default AdminUsers;

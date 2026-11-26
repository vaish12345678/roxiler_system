
import { useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      setStats(response.data.stats || {
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0,
        averageRating: 0,
      });

    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered accounts",
      color: "text-indigo-600",
      icon: "♙",
      iconBg: "bg-indigo-50",
    },
    {
      title: "Total Stores",
      value: stats.totalStores,
      description: "Stores on platform",
      color: "text-blue-600",
      icon: "▤",
      iconBg: "bg-blue-50",
    },
    {
      title: "Average Store Rating",
      value: `${Number(stats.averageRating || 0).toFixed(2)} / 5`,
      description: "Overall customer rating",
      color: "text-green-600",
      icon: "★",
      iconBg: "bg-green-50",
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      description: "Ratings submitted",
      color: "text-purple-600",
      icon: "☆",
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <AdminLayout active="Dashboard">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            Admin / Dashboard
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Overview of your Roxiler Store Rating platform.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* STATISTICS CARDS */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          Loading dashboard statistics...
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center text-xl ${card.color}`}>
                  {card.icon}
                </div>
              </div>

              <h2 className={`text-3xl font-bold mt-4 ${card.color}`}>
                {card.value}
              </h2>

              <p className="text-xs text-gray-400 mt-2">
                {card.description}
              </p>
            </div>
          ))}

        </section>
      )}

      {/* PLATFORM OVERVIEW */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800">
          Platform Overview
        </h2>

        <p className="text-sm text-gray-500 mt-1 mb-6">
          Monitor and manage your store rating platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-medium text-slate-800">
              User Management
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              View registered users and manage their account roles.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-medium text-slate-800">
              Store Management
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Create stores and manage store owner information.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-medium text-slate-800">
              Rating Monitoring
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Monitor customer ratings and overall store performance.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Roxiler Store Rating System · Admin Panel
      </p>

    </AdminLayout>
  );
}

export default AdminDashboard;

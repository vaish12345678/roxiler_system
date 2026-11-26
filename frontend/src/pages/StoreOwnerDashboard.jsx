
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const inputStyle =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";

const StoreOwnerDashboard = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [ratings, setRatings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState("");

  // FETCH STORE OWNER DASHBOARD
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/store-owner/dashboard");
        const storeList = response.data.stores || [];

        setStores(storeList);

        if (storeList.length > 0) {
          setSelectedStore(String(storeList[0].storeId));
        }
      } catch (err) {
        console.error("Dashboard API error:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // FETCH RATINGS WHEN STORE CHANGES
  useEffect(() => {
    const fetchRatings = async () => {
      if (!selectedStore) {
        setRatings([]);
        return;
      }

      try {
        setRatingsLoading(true);
        setError("");

        const response = await api.get(
          `/store-owner/stores/${selectedStore}/ratings`
        );

        setRatings(response.data.ratings || []);
      } catch (err) {
        console.error("Ratings API error:", err);
        setRatings([]);
        setError(
          err.response?.data?.message || "Failed to load customer ratings"
        );
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchRatings();
  }, [selectedStore]);

  // LOGOUT
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // SELECTED STORE
  const selectedStoreData = stores.find(
    (store) => String(store.storeId) === selectedStore
  );

  // NAVIGATION
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed left-0 top-0 h-screen z-40">

        <div className="px-7 py-8 border-b border-slate-700">
          <h2 className="text-2xl font-bold tracking-wide">
            Roxiler<span className="text-indigo-400">.</span>
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Store Owner Panel
          </p>
        </div>

        <div className="px-4 py-7 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-indigo-600 text-white font-semibold"
            >
              <span className="text-lg">▦</span>
              Dashboard
            </button>

            <button
              onClick={() => scrollToSection("store-overview")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span className="text-lg">▤</span>
              My Store
            </button>

            <button
              onClick={() => scrollToSection("customer-ratings")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span className="text-lg">★</span>
              Customer Ratings
            </button>

            {/* CHANGE PASSWORD */}
            <button
              onClick={() => navigate("/change-password")}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <span className="text-lg">🔒</span>
              Change Password
            </button>

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

      {/* MAIN CONTENT */}
      <main className="min-h-screen ml-72 p-8">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm text-gray-500 mb-1">
              Store Owner / Dashboard
            </p>

            <h1 className="text-3xl font-bold text-slate-800">
              Store Owner Dashboard
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Monitor your store performance and customer ratings.
            </p>
          </div>

          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
            Store Owner
          </div>

        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* NO STORES */}
        {stores.length === 0 ? (

          <section className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-4">▤</div>

            <h2 className="text-xl font-semibold text-slate-800">
              No Stores Found
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              No stores have been assigned to your account yet.
              Please contact your administrator.
            </p>
          </section>

        ) : (

          <>

            {/* STORE SELECTOR */}
            <section
              id="store-overview"
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 scroll-mt-6"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    My Store
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Select a store to view its performance.
                  </p>
                </div>

                <div className="w-full md:w-80">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                    Select Store
                  </label>

                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className={inputStyle}
                  >
                    {stores.map((store) => (
                      <option
                        key={store.storeId}
                        value={String(store.storeId)}
                      >
                        {store.storeName}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </section>

            {/* STATISTICS CARDS */}
            {selectedStoreData && (

              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500">
                    Store Name
                  </p>

                  <h2 className="text-xl font-bold text-slate-800 mt-3">
                    {selectedStoreData.storeName}
                  </h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Your registered store
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500">
                    Average Rating
                  </p>

                  <h2 className="text-3xl font-bold text-green-600 mt-3">
                    {Number(selectedStoreData.averageRating || 0).toFixed(2)}
                    <span className="text-lg text-gray-400"> / 5</span>
                  </h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Overall customer rating
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500">
                    Total Ratings
                  </p>

                  <h2 className="text-3xl font-bold text-blue-600 mt-3">
                    {selectedStoreData.totalRatings || 0}
                  </h2>

                  <p className="text-xs text-gray-400 mt-2">
                    Customer ratings received
                  </p>
                </div>

              </section>
            )}

            {/* CUSTOMER RATINGS */}
            <section
              id="customer-ratings"
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden scroll-mt-6"
            >

              <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                <div>
                  <h2 className="font-semibold text-slate-800">
                    Customer Ratings
                  </h2>

                  <p className="text-xs text-gray-500 mt-1">
                    Customers who rated your selected store.
                  </p>
                </div>

                <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                  {ratings.length} ratings
                </span>

              </div>

              <div className="overflow-x-auto">

                {ratingsLoading ? (

                  <div className="p-12 text-center text-gray-500">
                    Loading customer ratings...
                  </div>

                ) : ratings.length === 0 ? (

                  <div className="p-12 text-center">
                    <p className="text-gray-700 font-medium">
                      No Ratings Yet
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Customer ratings will appear here when users rate your store.
                    </p>
                  </div>

                ) : (

                  <table className="w-full text-left">

                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                          Customer
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                          Email
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                          Rating
                        </th>

                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                          Submitted Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {ratings.map((rating) => (

                        <tr
                          key={rating.userId}
                          className="hover:bg-slate-50 transition"
                        >

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">

                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                                {rating.userName?.charAt(0)?.toUpperCase()}
                              </div>

                              <span className="text-sm font-medium text-slate-800">
                                {rating.userName}
                              </span>

                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {rating.email}
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-800">
                              {rating.rating} / 5
                            </span>

                            <span className="text-yellow-500 ml-1">
                              ★
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {rating.submittedAt
                              ? new Date(rating.submittedAt).toLocaleDateString()
                              : "—"}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

              <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
                Showing {ratings.length} customer rating(s)
              </div>

            </section>

          </>

        )}

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Roxiler Store Rating System · Store Owner Panel
        </p>

      </main>
    </div>
  );
};

export default StoreOwnerDashboard;

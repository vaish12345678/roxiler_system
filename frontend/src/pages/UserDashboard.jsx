
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [ratings, setRatings] = useState({});

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const inputStyle =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";

  // FETCH STORES
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/user/stores", {
        params: { search, sortBy, sortOrder },
      });

      const fetchedStores = response.data.stores || [];
      setStores(fetchedStores);

      const initialRatings = {};

      fetchedStores.forEach((store) => {
        initialRatings[store.id] = store.myRating || 0;
      });

      setRatings(initialRatings);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // SELECT RATING
  const handleRatingChange = (storeId, rating) => {
    setRatings((prev) => ({
      ...prev,
      [storeId]: rating,
    }));

    setMessage("");
    setError("");
  };

  // SUBMIT OR UPDATE RATING
  const handleSubmitRating = async (storeId) => {
    const rating = ratings[storeId];

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.");
      return;
    }

    setSubmittingId(storeId);
    setError("");
    setMessage("");

    try {
      await api.post(`/user/stores/${storeId}/rating`, { rating });

      setMessage("Your rating has been saved successfully.");
      await fetchStores();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit rating");
    } finally {
      setSubmittingId(null);
    }
  };

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

  const totalStores = stores.length;

  const ratedStores = stores.filter(
    (store) => Number(store.myRating) > 0
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen fixed left-0 top-0 z-20">

        <div className="px-6 py-7 border-b border-slate-700">
          <h2 className="text-xl font-bold tracking-wide">
            Roxiler<span className="text-indigo-400">.</span>
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            User Dashboard
          </p>
        </div>

        <div className="px-4 py-6 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">

            <button
              onClick={() => navigate("/user")}
              className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Dashboard
            </button>

            <button
              onClick={() => navigate("/user")}
              className="w-full text-left px-4 py-3 rounded-lg bg-indigo-600 text-white font-medium"
            >
              Explore Stores
            </button>

            <button
              onClick={() => navigate("/change-password")}
              className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Change Password
            </button>

          </nav>
        </div>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-red-300 hover:bg-slate-800 transition"
          >
            Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 min-w-0">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <p className="text-sm text-gray-500 mb-1">
              User / Explore Stores
            </p>

            <h1 className="text-3xl font-bold text-slate-800">
              Explore Stores
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Welcome, {user.name || "User"}. Discover stores and share your experience.
            </p>
          </div>

        </header>

        {/* ALERTS */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Available Stores
            </p>

            <h2 className="text-3xl font-bold text-slate-800 mt-2">
              {totalStores}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Stores currently displayed
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Stores You Have Rated
            </p>

            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              {ratedStores}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              Your submitted ratings
            </p>
          </div>

        </section>

        {/* SEARCH AND SORT */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">

          <div className="flex flex-col lg:flex-row gap-4">

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">
                Search Stores
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by store name or address..."
                className={inputStyle}
              />
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
                <option value="name">Store Name</option>
                <option value="email">Email</option>
                <option value="created_at">Recently Added</option>
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
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchStores}
                disabled={loading}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

          </div>
        </section>

        {/* STORE LIST */}
        <section>

          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Available Stores
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Browse stores and submit your ratings.
              </p>
            </div>

            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
              {stores.length} displayed
            </span>
          </div>

          {loading ? (

            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
              Loading stores...
            </div>

          ) : stores.length === 0 ? (

            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No stores found
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Try searching with another name or address.
              </p>
            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {stores.map((store) => (

                <div
                  key={store.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex justify-between items-start gap-3">

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {store.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2 break-words">
                        {store.address || "Address not available"}
                      </p>
                    </div>

                    <span className="text-yellow-500 font-semibold whitespace-nowrap">
                      ★ {Number(store.averageRating || 0).toFixed(1)}
                    </span>

                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {store.totalRatings || 0} rating(s)
                  </p>

                  <div className="border-t border-gray-100 mt-5 pt-4">

                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Your Rating
                    </p>

                    <div className="flex items-center gap-1 mb-4">

                      {[1, 2, 3, 4, 5].map((star) => (

                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(store.id, star)}
                          aria-label={`Rate ${star} out of 5`}
                          className={`text-3xl transition ${
                            star <= (ratings[store.id] || 0)
                              ? "text-yellow-400"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        >
                          ★
                        </button>

                      ))}

                      <span className="text-sm text-gray-500 ml-2">
                        {ratings[store.id]
                          ? `${ratings[store.id]}/5`
                          : "Select"}
                      </span>

                    </div>

                    <button
                      onClick={() => handleSubmitRating(store.id)}
                      disabled={!ratings[store.id] || submittingId === store.id}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submittingId === store.id
                        ? "Saving..."
                        : store.myRating
                        ? "Update Rating"
                        : "Submit Rating"}
                    </button>

                    {store.myRating > 0 && (
                      <p className="text-xs text-green-700 mt-2 text-center">
                        Your current rating: {store.myRating}/5
                      </p>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <p className="text-center text-xs text-gray-400 mt-8">
          Roxiler Store Rating System - User Panel
        </p>

      </main>
    </div>
  );
};

export default UserDashboard;

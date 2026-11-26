
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const inputStyle =
  "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ownersLoading, setOwnersLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/stores", {
        params: {
          search,
          sortBy,
          sortOrder,
        },
      });

      setStores(response.data.stores || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch stores"
      );
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const fetchOwners = async () => {
    setOwnersLoading(true);
    setError("");

    try {
      const response = await api.get("/admin/store-owners");
      setOwners(response.data.owners || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load store owners"
      );
    } finally {
      setOwnersLoading(false);
    }
  };
  const handleToggleForm = async () => {
    const opening = !showForm;

    setShowForm(opening);
    setMessage("");
    setError("");

    if (opening) {
      await fetchOwners();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.name.trim() ||
      form.name.trim().length < 20 ||
      form.name.trim().length > 60
    ) {
      setError("Store name must be between 20 and 60 characters.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.address.trim().length > 400) {
      setError("Address cannot exceed 400 characters.");
      return;
    }

    if (!form.owner_id) {
      setError("Please select a store owner.");
      return;
    }

    setCreating(true);

    try {
      await api.post("/admin/stores", {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        owner_id: Number(form.owner_id),
      });

      setMessage("Store created successfully!");

      setForm({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });

      setShowForm(false);

      await fetchStores();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create store"
      );
    } finally {
      setCreating(false);
    }
  };

  // CALCULATE STATISTICS
  const totalRatings = stores.reduce(
    (total, store) => total + Number(store.totalRatings || 0),
    0
  );

  const averageRating =
    stores.length > 0
      ? (
          stores.reduce(
            (total, store) =>
              total + Number(store.averageRating || 0),
            0
          ) / stores.length
        ).toFixed(1)
      : "0.0";

  const statCards = [
    {
      title: "Total Stores",
      value: stores.length,
      description: "Currently displayed",
      color: "text-slate-800",
    },
    {
      title: "Average Store Rating",
      value: `${averageRating} / 5`,
      description: "Average across displayed stores",
      color: "text-green-600",
    },
    {
      title: "Total Ratings",
      value: totalRatings,
      description: "Customer ratings received",
      color: "text-blue-600",
    },
  ];

  return (
    <AdminLayout active="Stores">

      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            Admin / Stores
          </p>

          <h1 className="text-3xl font-bold text-slate-800">
            Manage Stores
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Manage registered stores and their owners.
          </p>
        </div>

        <button
          onClick={handleToggleForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium shadow-sm transition"
        >
          {showForm ? "Close Form" : "+ Add New Store"}
        </button>
      </header>

      {/* ALERT MESSAGES */}
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

      {/* STATISTICS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {card.title}
            </p>

            <h2 className={`text-3xl font-bold mt-3 ${card.color}`}>
              {card.value}
            </h2>

            <p className="text-xs text-gray-400 mt-2">
              {card.description}
            </p>
          </div>
        ))}
      </section>

      {/* CREATE STORE FORM */}
      {showForm && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">
            Create New Store
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Enter store information and assign a store owner.
          </p>

          <form onSubmit={handleCreateStore}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  minLength={20}
                  maxLength={60}
                  placeholder="Enter store name"
                  className={inputStyle}
                  required
                />

                <p className="text-xs text-gray-400 mt-1">
                  {form.name.length}/60 characters (20–60 required)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="store@example.com"
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={400}
                  placeholder="Enter store address"
                  className={inputStyle}
                />

                <p className="text-xs text-gray-400 mt-1">
                  {form.address.length}/400 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Owner
                </label>

                <select
                  name="owner_id"
                  value={form.owner_id}
                  onChange={handleChange}
                  className={inputStyle}
                  required
                  disabled={ownersLoading}
                >
                  <option value="">
                    {ownersLoading
                      ? "Loading owners..."
                      : "Select a store owner"}
                  </option>

                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} — {owner.email}
                    </option>
                  ))}
                </select>

                {!ownersLoading && owners.length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No store owners found. Create a STORE_OWNER account first.
                  </p>
                )}
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleToggleForm}
                className="px-5 py-3 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={creating || ownersLoading || owners.length === 0}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Store"}
              </button>
            </div>
          </form>
        </section>
      )}

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
              placeholder="Search by store name, email or address..."
              className={inputStyle}
            />
          </div>

          <div className="w-full lg:w-52">
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
              <option value="averageRating">Average Rating</option>
            </select>
          </div>

          <div className="w-full lg:w-48">
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

        </div>
      </section>

      {/* STORES TABLE */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h2 className="font-semibold text-slate-800">
              All Stores
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Store directory and rating information
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
              {stores.length} displayed
            </span>

            <button
              onClick={fetchStores}
              disabled={loading}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  ID
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Store
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Email
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Address
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Store Owner
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Rating
                </th>

                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Total Ratings
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    Loading stores...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <p className="text-gray-700 font-medium">
                      No stores found
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Try changing your search.
                    </p>
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr
                    key={store.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-500">
                      #{store.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-sm">
                          {store.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <span className="text-sm font-medium text-slate-800">
                          {store.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {store.email}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {store.address || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {store.owner?.name || "—"}

                      {store.owner?.email && (
                        <p className="text-xs text-gray-400 mt-1">
                          {store.owner.email}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">
                        {Number(store.averageRating || 0).toFixed(1)}
                      </span>

                      <span className="text-yellow-500 ml-1">
                        ★
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {store.totalRatings || 0}
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
          Showing {stores.length} store(s)
        </div>

      </section>

      {/* FOOTER */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Roxiler Store Rating System · Admin Panel
      </p>

    </AdminLayout>
  );
};

export default AdminStores;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PasswordField({
  label,
  name,
  field,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

function ChangePassword() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const dashboardPath =
    user.role === "STORE_OWNER" ? "/store-owner" : "/user";

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      newPassword.length < 8 ||
      newPassword.length > 16 ||
      !/[A-Z]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setError(
        "Password must be 8–16 characters and contain an uppercase letter and a special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setSuccess(
        response.data.message || "Password changed successfully!"
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to change password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-900 text-white min-h-screen p-6 hidden md:flex flex-col">
        <h1 className="text-2xl font-bold tracking-wide mb-2">
          Roxiler
        </h1>

        <p className="text-slate-400 text-sm mb-10">
          Store Rating System
        </p>

        <nav className="space-y-3">
          <button
            onClick={() => navigate(dashboardPath)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
          Dashboard
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium">
             Change Password
          </button>
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => navigate(dashboardPath)}
            className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600 mb-2">
              ACCOUNT SETTINGS
            </p>

            <h2 className="text-3xl font-bold text-slate-800">
              Change Password
            </h2>

            <p className="text-slate-500 mt-2">
              Keep your account secure by updating your password regularly.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-9">
            <div className="mb-7">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl mb-4">
                
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Update your password
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Enter your current password and choose a new one.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordField
                label="Current Password"
                name="currentPassword"
                field="current"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                visible={showPasswords.current}
                onToggle={() => togglePassword("current")}
              />

              <PasswordField
                label="New Password"
                name="newPassword"
                field="new"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
                visible={showPasswords.new}
                onToggle={() => togglePassword("new")}
              />

              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                field="confirm"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                visible={showPasswords.confirm}
                onToggle={() => togglePassword("confirm")}
              />

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Password requirements
                </p>

                <ul className="text-sm text-slate-500 space-y-1">
                  <li>• 8 to 16 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one special character</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Roxiler Store Rating System
          </p>
        </div>
      </main>
    </div>
  );
}

export default ChangePassword;

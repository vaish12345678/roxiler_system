
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 20 || form.name.trim().length > 60) {
      setError("Name must contain between 20 and 60 characters.");
      return;
    }

    if (
      form.password.length < 8 ||
      form.password.length > 16 ||
      !/[A-Z]/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    ) {
      setError(
        "Password must be 8-16 characters and contain an uppercase letter and a special character."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim()
      });

      navigate("/login", {
        state: { message: "Registration successful! Please log in." }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        {/* Left section */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-900 p-12 text-white md:flex">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-xl font-bold">
                R
              </div>
              <span className="text-xl font-bold">Roxiler</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Join our store rating community.
            </h1>

            <p className="mt-6 text-base leading-7 text-blue-100">
              Create your account to explore stores, share ratings, and
              discover what other customers think.
            </p>
          </div>

          <p className="text-sm text-blue-200">
            © 2026 Roxiler. All rights reserved.
          </p>
        </div>

        {/* Register form */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
                Get started
              </p>
              <h2 className="text-3xl font-bold text-slate-900">
                Create an account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Fill in your details to register.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  minLength={20}
                  maxLength={60}
                  className={inputClass}
                  required
                />
                <p className="mt-1 text-xs text-slate-400">
                  20–60 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    minLength={8}
                    maxLength={16}
                    className={`${inputClass} pr-16`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  8–16 characters, uppercase letter and special character
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  maxLength={400}
                  rows={3}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

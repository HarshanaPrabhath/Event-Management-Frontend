import { useState } from "react";
import { Link } from "react-router-dom";
import { register } from "../../../shared/api/authService";

function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    regNumber: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(
        form.username,
        form.email,
        form.password,
        form.regNumber
      );
      
      alert("User registered successfully!");

      setForm({
        username: "",
        email: "",
        password: "",
        regNumber: "",
      });
    } catch (err) {
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center theme-bg-page p-6 overflow-hidden">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full theme-bg-tint-strong blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full theme-bg-tint blur-[100px]" />

      <div className="relative z-10 w-full max-w-2xl theme-bg-surface-muted border theme-border backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-5 theme-text">
          <div className="mb-8">
            <h2 className="text-3xl font-bold theme-gradient-text">
              Create Account
            </h2>
            <p className="theme-text-muted text-sm mt-2">
              Join the university management system as a user account.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted ml-1 uppercase tracking-wider">
                Username
              </label>
              <input
                name="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className="w-full theme-bg-surface-muted border theme-border p-3 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all theme-placeholder"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold theme-text-muted ml-1 uppercase tracking-wider">
                Reg Number
              </label>
              <input
                name="regNumber"
                placeholder="TG/2023/2222"
                value={form.regNumber}
                onChange={handleChange}
                className="w-full theme-bg-surface-muted border theme-border p-3 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all theme-placeholder"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold theme-text-muted ml-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@university.com"
              value={form.email}
              onChange={handleChange}
              className="w-full theme-bg-surface-muted border theme-border p-3 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all theme-placeholder"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold theme-text-muted ml-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full theme-bg-surface-muted border theme-border p-3 rounded-xl focus:ring-2 theme-focus-ring outline-none transition-all theme-placeholder"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full theme-bg-primary theme-hover-bg-primary theme-text-on-primary font-bold p-4 rounded-xl shadow-lg theme-shadow transition-all active:scale-[0.98] theme-disabled-bg theme-disabled-text mt-4"
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>

          <p className="text-center text-sm theme-text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="theme-text-primary font-bold theme-hover-text-primary transition-colors"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

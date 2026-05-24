import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { registerByAdmin } from "../../../shared/api/authService";
import { hasRole } from "../../../shared/utils/roles";

const ROLE_OPTIONS = ["user", "lecturer", "dean", "secretary", "admin"];

function AdminCreateUserPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    regNumber: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const isAdmin = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw);
      const roles = parsed?.roles || [];
      return hasRole(roles, "ROLE_ADMIN");
    } catch {
      return false;
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      regNumber: "",
      role: "user",
    });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await registerByAdmin(
        form.username.trim(),
        form.email.trim(),
        form.password,
        form.regNumber.trim(),
        form.role
      );
      setMessage("User account created successfully.");
      resetForm();
    } catch (err) {
      setError(err?.message || "Failed to create user account.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen theme-bg-page p-8 theme-text">
        <div className="mx-auto max-w-3xl rounded-2xl border theme-border-danger theme-bg-danger-soft p-6 text-sm theme-text-danger">
          Access denied. Only admins can create user accounts.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page p-8">
      <div className="mx-auto max-w-2xl rounded-2xl border theme-border theme-bg-surface overflow-hidden">
        <div className="border-b theme-border theme-bg-surface px-6 py-4">
          <h1 className="text-xl font-black theme-text tracking-tight">Create User</h1>
          <p className="mt-1 text-xs theme-text-muted">Create any system account with an explicit role.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 theme-text">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Username">
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full rounded-xl border theme-border theme-bg-surface-muted px-4 py-2.5 text-sm focus:outline-none theme-focus-border"
              />
            </Field>
            <Field label="Reg Number">
              <input
                name="regNumber"
                value={form.regNumber}
                onChange={handleChange}
                required
                className="w-full rounded-xl border theme-border theme-bg-surface-muted px-4 py-2.5 text-sm focus:outline-none theme-focus-border"
              />
            </Field>
          </div>

          <Field label="Email">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border theme-border theme-bg-surface-muted px-4 py-2.5 text-sm focus:outline-none theme-focus-border"
            />
          </Field>

          <Field label="Password">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border theme-border theme-bg-surface-muted px-4 py-2.5 text-sm focus:outline-none theme-focus-border"
            />
          </Field>

          <Field label="Role">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border theme-border theme-bg-surface-muted px-4 py-2.5 text-sm focus:outline-none theme-focus-border"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </Field>

          {error && (
            <div className="rounded-xl border theme-border-danger theme-bg-danger-soft px-4 py-3 text-sm theme-text-danger">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border theme-border-primary theme-bg-tint px-4 py-3 text-sm theme-text-primary">
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl theme-bg-primary px-5 py-2.5 text-sm font-bold theme-text-on-primary transition-colors theme-hover-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={16} />
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-black uppercase tracking-widest theme-text-muted">{label}</span>
      {children}
    </label>
  );
}

export default AdminCreateUserPage;

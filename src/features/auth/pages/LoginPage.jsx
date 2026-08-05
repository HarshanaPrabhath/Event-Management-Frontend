import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";
import { checkApi, login } from "../api/authService";

function LoginPage() {
  const navigate = useNavigate();
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const callCheckApi = async () => {
    try {
      await checkApi();
    } catch (err) {
      console.error("System check failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(regNumber, password);
      const userData = data.user ? data : data;

      localStorage.setItem("user", JSON.stringify(userData));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      await callCheckApi();
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      alert(err.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-page relative overflow-hidden font-sans">
      <Link
        to="/"
        className="fixed right-5 top-20 z-50 inline-flex items-center gap-2 rounded-xl border theme-border theme-bg-surface-muted px-4 py-2 text-sm font-bold theme-text theme-card-shadow theme-hover-bg theme-hover-text transition-colors"
      >
        Landing Page
        <ArrowRight size={16} />
      </Link>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] theme-bg-tint blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] theme-bg-tint blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 theme-bg-surface-muted border theme-border rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
            <ShieldCheck className="theme-text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-black theme-text tracking-tighter">
            SYSTEM<span className="theme-text-primary">ACCESS</span>
          </h1>
        </div>

        <div className="theme-bg-surface-muted backdrop-blur-2xl p-8 rounded-[2.5rem] border theme-border theme-card-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
                Registration ID
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted theme-group-hover-text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder="TG/2023/001"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl theme-bg-surface border theme-border theme-text theme-placeholder focus:outline-none theme-focus-border focus:ring-4 theme-focus-ring transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
                Secure Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted theme-group-hover-text-primary transition-colors"
                  size={18}
                />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl theme-bg-surface border theme-border theme-text theme-placeholder focus:outline-none theme-focus-border focus:ring-4 theme-focus-ring transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="group relative w-full overflow-hidden theme-bg-primary theme-hover-bg-primary theme-text-on-primary font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 theme-border border-t-transparent rounded-full animate-spin" />
                  <span>AUTHORIZING...</span>
                </div>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t theme-border text-center">
            <p className="theme-text-muted text-sm">Don't have a account?</p>
            <Link
              to="/register"
              className="theme-text-primary font-bold text-sm theme-hover-text-primary transition-colors mt-1 inline-block"
            >
              Create New Identity
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

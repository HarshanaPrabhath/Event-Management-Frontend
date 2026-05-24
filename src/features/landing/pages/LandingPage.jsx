import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Search } from "lucide-react";
import { getClubs } from "../../../shared/api/endpoints";
import { ClubCard } from "../components";
import CalendarPage from "../../events/pages/CalendarPage";

function LandingPage() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await getClubs();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setClubs(list);
        setFiltered(list);
      } catch (err) {
        console.error("Failed to fetch clubs:", err);
        setError("Could not load clubs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    const source = Array.isArray(clubs) ? clubs : [];
    setFiltered(
      q
        ? source.filter((c) => (c?.clubName || "").toLowerCase().includes(q))
        : source
    );
  }, [search, clubs]);

  return (
    <div className="min-h-screen theme-bg-page theme-text">
      <header className="border-b theme-border theme-bg-surface backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xl font-black tracking-tight theme-text"
          >
            EventFlow
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-xl theme-bg-primary px-4 py-2 text-sm font-bold theme-text-on-primary theme-hover-bg-primary transition-colors"
          >
            <LogIn size={16} />
            Login
          </button>
        </div>
      </header>


      <section className="border-t theme-border">
        <CalendarPage source="public" />
      </section>

      <section className="">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight theme-text">
            University Clubs
          </h1>
          <p className="mt-4 theme-text-muted max-w-2xl">
            Discover active clubs, check their details, and sign in to submit and manage event requests.
          </p>

          <div className="mt-8 max-w-2xl">
            <div className="flex items-center theme-bg-surface-muted border theme-border rounded-xl overflow-hidden">
              <div className="pl-4 theme-text-muted">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-4 outline-none bg-transparent theme-text theme-placeholder"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black theme-text tracking-tight">Active Clubs</h2>
          <div className="px-3 py-1 rounded-full theme-bg-surface-muted border theme-border text-xs font-black theme-text-muted uppercase tracking-widest">
            {filtered.length} Clubs
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 theme-bg-surface-muted animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 theme-bg-surface-muted border border-dashed theme-border rounded-3xl">
            <p className="theme-text font-semibold">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((club, index) => (
              <ClubCard
                key={(club?.clubId ?? club?.id) ?? `${club?.clubName}-${index}`}
                club={club}
                index={index}
                onOpen={(clubId) => navigate(`/club/${clubId}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 theme-bg-surface-muted border theme-border rounded-3xl">
            <h3 className="text-lg font-bold theme-text">No clubs match your search</h3>
            <p className="theme-text-muted mt-2">Try a broader keyword.</p>
          </div>
        )}
      </main>
      <footer className="border-t theme-border theme-bg-page">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-black theme-text tracking-tight">EventFlow</h3>
            <p className="mt-2 text-sm theme-text-muted max-w-sm">
              University event and approval workspace for students, secretaries, and reviewers.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-black uppercase tracking-widest theme-text-muted">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-left theme-text theme-hover-text transition-colors"
              >
                Back to top
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-left theme-text theme-hover-text transition-colors"
              >
                Login to dashboard
              </button>
            </div>
          </div>

          <div className="md:text-right">
            <p className="text-[11px] font-black uppercase tracking-widest theme-text-muted">Access</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-3 inline-flex items-center gap-2 rounded-xl theme-bg-primary px-4 py-2 text-sm font-bold theme-text-on-primary theme-hover-bg-primary transition-colors"
            >
              <LogIn size={15} />
              Open Login
            </button>
          </div>
        </div>
        <div className="border-t theme-border px-6 py-4 text-center text-xs theme-text-muted">
          {new Date().getFullYear()} EventFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Pencil, Trash2, PlusCircle, Search, UserRound, Landmark } from "lucide-react";
import {
  getClubsAdmin,
  getClubSecretaries,
  getClubSeniorTreasurers,
  updateClubAdmin,
  deleteClubAdmin,
} from "../api/clubService";
import { EditClubModal } from "../components";
import { resolveImageUrl } from "../lib/clubUtils";
import { hasRole } from "../../../shared/utils/roles";

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

function ManageClubsPage() {
  const roles = readStoredUser()?.roles || [];
  const isAdmin = hasRole(roles, "ROLE_ADMIN");

  const [clubs, setClubs] = useState([]);
  const [secretaries, setSecretaries] = useState([]);
  const [seniorTreasurers, setSeniorTreasurers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [editingClub, setEditingClub] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [clubsData, secretariesData, treasurersData] = await Promise.all([
        getClubsAdmin(),
        getClubSecretaries(),
        getClubSeniorTreasurers(),
      ]);

      setClubs(Array.isArray(clubsData) ? clubsData : []);
      setSecretaries(Array.isArray(secretariesData) ? secretariesData : []);
      setSeniorTreasurers(Array.isArray(treasurersData) ? treasurersData : []);
    } catch (err) {
      console.error("Failed to load clubs:", err);
      setError("Failed to load clubs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin, fetchAll]);

  const filteredClubs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clubs;
    return clubs.filter((c) => (c.clubName || "").toLowerCase().includes(term));
  }, [clubs, search]);

  const handleSave = async (payload) => {
    if (!editingClub) return;
    setSaving(true);

    try {
      await updateClubAdmin(editingClub.id, payload);
      setEditingClub(null);
      await fetchAll();
    } catch (err) {
      console.error("Failed to update club:", err);
      alert(err?.response?.data?.message || "Failed to update club.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (club) => {
    if (!window.confirm(`Delete "${club.clubName}"? This cannot be undone.`)) return;

    setDeletingId(club.id);
    try {
      await deleteClubAdmin(club.id);
      setClubs((prev) => prev.filter((c) => c.id !== club.id));
    } catch (err) {
      console.error("Failed to delete club:", err);
      alert(err?.response?.data?.message || "Failed to delete club.");
    } finally {
      setDeletingId(null);
    }
  };

  const findPerson = (list, regNumber) =>
    list.find((p) => p.regNumber === regNumber);

  if (!isAdmin) {
    return (
      <div className="min-h-screen theme-bg-page theme-text p-6">
        <div className="max-w-4xl mx-auto rounded-2xl border theme-border-danger theme-bg-danger-soft p-6 theme-text-danger">
          This section is available only for ROLE_ADMIN users.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page theme-text p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl theme-bg-tint-strong border theme-border-primary flex items-center justify-center theme-text-primary">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black theme-text">Manage Clubs</h1>
              <p className="text-sm theme-text-muted">
                {clubs.length} club{clubs.length === 1 ? "" : "s"} registered
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/club-create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl theme-bg-primary theme-hover-bg-primary theme-text-on-primary text-sm font-bold transition-colors"
          >
            <PlusCircle size={16} />
            New Club
          </Link>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 theme-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clubs by name..."
            className="w-full pl-11 pr-4 py-3 rounded-xl theme-bg-surface-muted border theme-border theme-text theme-placeholder focus:outline-none theme-focus-border transition-all"
          />
        </div>

        {error && (
          <div className="rounded-xl border theme-border-danger theme-bg-danger-soft px-4 py-3 text-sm theme-text-danger">
            {error}
          </div>
        )}

        {loading && <p className="theme-text-muted">Loading clubs...</p>}

        {!loading && filteredClubs.length === 0 && (
          <div className="text-center py-24 theme-bg-surface-muted border border-dashed theme-border rounded-3xl">
            <p className="theme-text-muted">
              {clubs.length === 0 ? "No clubs registered yet." : "No clubs match your search."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {!loading &&
            filteredClubs.map((club) => {
              const secretary = findPerson(secretaries, club.secretaryRegNumber);
              const seniorTreasurer = findPerson(seniorTreasurers, club.seniorTreasurerRegNumber);
              const bgImageUrl = resolveImageUrl(club.bgImageUrl);

              return (
                <div
                  key={club.id}
                  className="rounded-3xl border theme-border theme-bg-surface overflow-hidden flex flex-col"
                >
                  <div className="h-24 theme-gradient-primary relative">
                    {bgImageUrl && (
                      <img src={bgImageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    <h2 className="text-lg font-bold theme-text truncate">{club.clubName}</h2>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 text-xs theme-text-muted">
                        <UserRound size={14} className="theme-text-primary shrink-0" />
                        {secretary ? (
                          <span className="truncate">
                            Secretary: <span className="theme-text font-semibold">{secretary.userName}</span> ({secretary.regNumber})
                          </span>
                        ) : (
                          <span className="italic">No secretary assigned</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs theme-text-muted">
                        <Landmark size={14} className="theme-text-primary shrink-0" />
                        {seniorTreasurer ? (
                          <span className="truncate">
                            Sr. Treasurer: <span className="theme-text font-semibold">{seniorTreasurer.userName}</span> ({seniorTreasurer.regNumber})
                          </span>
                        ) : (
                          <span className="italic">No senior treasurer assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t theme-border">
                      <button
                        onClick={() => setEditingClub(club)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface-muted theme-hover-bg-tint border theme-border theme-text text-xs font-bold transition-colors"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(club)}
                        disabled={deletingId === club.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface-muted theme-hover-bg-tint border theme-border theme-hover-border-danger theme-text-muted theme-hover-text-danger text-xs font-bold transition-colors disabled:opacity-60"
                      >
                        <Trash2 size={13} />
                        {deletingId === club.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {editingClub && (
        <EditClubModal
          club={editingClub}
          secretaries={secretaries}
          seniorTreasurers={seniorTreasurers}
          saving={saving}
          onClose={() => setEditingClub(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default ManageClubsPage;

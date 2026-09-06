import { cloneElement, useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Users,
  Building2,
  Search,
  Pencil,
  Trash2,
  PlusCircle,
  Wrench,
} from "lucide-react";
import {
  getPlaces,
  createPlaceAdmin,
  updatePlaceAdmin,
  deletePlaceAdmin,
  uploadPlacePhoto,
} from "../api/placeService";
import { getUsersAdmin } from "../../../shared/api/adminUsers";
import { PlaceFormModal } from "../components";
import { hasRole } from "../../../shared/utils/roles";

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const PlacesPage = () => {
  const roles = readStoredUser()?.roles || [];
  const isAdmin = hasRole(roles, "ROLE_ADMIN");

  const [places, setPlaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlace, setEditingPlace] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlaces();
      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load places:", err);
      setError("Failed to load places.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsersAdmin();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const filteredPlaces = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return places;
    return places.filter(
      (p) =>
        (p.placeName || "").toLowerCase().includes(term) ||
        (p.department || "").toLowerCase().includes(term)
    );
  }, [places, searchTerm]);

  const highestCapacity = useMemo(
    () => places.reduce((max, p) => (p.capacity && p.capacity > max ? p.capacity : max), 0),
    [places]
  );
  const departmentCount = useMemo(
    () => new Set(places.map((p) => p.department).filter(Boolean)).size,
    [places]
  );

  const openCreateModal = () => {
    setEditingPlace(null);
    setShowCreateModal(true);
  };

  const openEditModal = (place) => {
    setEditingPlace(place);
    setShowCreateModal(true);
  };

  const handleSave = async (payload, photoFile) => {
    setSaving(true);
    try {
      const saved = editingPlace
        ? await updatePlaceAdmin(editingPlace.placeId, payload)
        : await createPlaceAdmin(payload);

      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        await uploadPlacePhoto(saved.placeId, formData);
      }

      setShowCreateModal(false);
      setEditingPlace(null);
      await fetchPlaces();
    } catch (err) {
      console.error("Failed to save place:", err);
      alert(err?.response?.data?.message || "Failed to save place.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (place) => {
    if (!window.confirm(`Delete "${place.placeName}"? This cannot be undone.`)) return;
    setDeletingId(place.placeId);
    try {
      await deletePlaceAdmin(place.placeId);
      setPlaces((prev) => prev.filter((p) => p.placeId !== place.placeId));
    } catch (err) {
      console.error("Failed to delete place:", err);
      alert(err?.response?.data?.message || "Failed to delete place.");
    } finally {
      setDeletingId(null);
    }
  };

  const describeResources = (resources) => {
    if (!Array.isArray(resources) || resources.length === 0) return null;
    return resources.map((r) => `${r.quantity}x ${r.name}`).join(", ");
  };

  return (
    <div className="p-8 theme-bg-page min-h-screen theme-text">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black theme-text tracking-tight uppercase">
            Faculty Resources
          </h1>
          <p className="theme-text-muted text-sm mt-1 font-medium">
            Manage campus places, their equipment, and capacities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none theme-text-muted transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search venue or dept..."
              value={searchTerm}
              className="theme-bg-surface-muted border theme-border rounded-2xl py-3 pl-12 pr-6 w-full md:w-72 focus:outline-none focus:ring-2 theme-focus-ring theme-focus-border transition-all text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl theme-bg-primary theme-hover-bg-primary theme-text-on-primary text-sm font-bold transition-colors"
            >
              <PlusCircle size={16} />
              New Place
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Venues" value={places.length} icon={<MapPin />} />
        <StatCard label="Highest Capacity" value={highestCapacity || "N/A"} icon={<Users />} />
        <StatCard label="Departments" value={departmentCount} icon={<Building2 />} />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border theme-border-danger theme-bg-danger-soft px-4 py-3 text-sm theme-text-danger">
          {error}
        </div>
      )}

      {loading && <p className="theme-text-muted">Loading places...</p>}

      {!loading && filteredPlaces.length === 0 && (
        <div className="text-center py-24 theme-bg-surface-muted border border-dashed theme-border rounded-3xl">
          <p className="theme-text-muted font-bold uppercase tracking-[0.2em] text-xs">
            {places.length === 0 ? "No places registered yet." : "No matching venues found"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading &&
          filteredPlaces.map((place) => (
            <div
              key={place.placeId}
              className="theme-bg-surface-muted border theme-border rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl flex flex-col"
            >
              <div className="h-36 theme-gradient-primary relative">
                {place.photoUrl ? (
                  <img src={place.photoUrl} alt={place.placeName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <MapPin size={48} />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold theme-text truncate">{place.placeName}</h2>
                  <span
                    className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      place.department === "All"
                        ? "theme-bg-surface-muted theme-border theme-text-muted"
                        : "theme-bg-tint-strong theme-border-primary theme-text-primary"
                    }`}
                  >
                    {place.department || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Users size={14} className="theme-text-soft" />
                  {place.capacity ? (
                    <span className="font-bold theme-text">{place.capacity} capacity</span>
                  ) : (
                    <span className="font-bold uppercase tracking-widest text-[10px]">
                      Outdoor / Unlimited
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-2 text-xs theme-text-muted">
                  <Wrench size={14} className="theme-text-soft mt-0.5 shrink-0" />
                  <span>{describeResources(place.resources) || "No equipment listed"}</span>
                </div>

                {place.responsiblePersonName && (
                  <p className="text-[11px] theme-text-muted">
                    Responsible: <span className="theme-text font-semibold">{place.responsiblePersonName}</span>
                  </p>
                )}

                {isAdmin && (
                  <div className="flex gap-2 pt-3 mt-auto border-t theme-border">
                    <button
                      onClick={() => openEditModal(place)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface theme-hover-bg-tint border theme-border theme-text text-xs font-bold transition-colors"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(place)}
                      disabled={deletingId === place.placeId}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface theme-hover-bg-tint border theme-border theme-hover-border-danger theme-text-muted theme-hover-text-danger text-xs font-bold transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={13} />
                      {deletingId === place.placeId ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      {showCreateModal && (
        <PlaceFormModal
          place={editingPlace}
          users={users}
          saving={saving}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPlace(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="p-6 theme-bg-surface-muted border theme-border rounded-3xl flex items-center gap-5 transition-transform hover:-translate-y-1">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border theme-bg-tint-strong theme-text-primary theme-border-primary">
      {cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-black theme-text leading-none">{value}</p>
    </div>
  </div>
);

export default PlacesPage;

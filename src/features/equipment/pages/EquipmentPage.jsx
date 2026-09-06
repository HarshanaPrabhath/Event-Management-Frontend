import { useCallback, useEffect, useMemo, useState } from "react";
import { Wrench, Search, Pencil, Trash2, PlusCircle, User } from "lucide-react";
import {
  getGeneralResources,
  createGeneralResourceAdmin,
  updateGeneralResourceAdmin,
  deleteGeneralResourceAdmin,
} from "../api/equipmentService";
import { getUsersAdmin } from "../../../shared/api/adminUsers";
import { EquipmentFormModal } from "../components";
import { hasRole } from "../../../shared/utils/roles";

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const EquipmentPage = () => {
  const roles = readStoredUser()?.roles || [];
  const isAdmin = hasRole(roles, "ROLE_ADMIN");

  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGeneralResources();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load equipment:", err);
      setError("Failed to load equipment.");
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
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin, fetchUsers]);

  const filteredEquipment = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return equipment;
    return equipment.filter((e) => (e.name || "").toLowerCase().includes(term));
  }, [equipment, searchTerm]);

  const openCreateModal = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editingItem) {
        await updateGeneralResourceAdmin(editingItem.id, payload);
      } else {
        await createGeneralResourceAdmin(payload);
      }
      setShowModal(false);
      setEditingItem(null);
      await fetchEquipment();
    } catch (err) {
      console.error("Failed to save equipment:", err);
      alert(err?.response?.data?.message || "Failed to save equipment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await deleteGeneralResourceAdmin(item.id);
      setEquipment((prev) => prev.filter((e) => e.id !== item.id));
    } catch (err) {
      console.error("Failed to delete equipment:", err);
      alert(err?.response?.data?.message || "Failed to delete equipment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 theme-bg-page min-h-screen theme-text">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black theme-text tracking-tight uppercase">Equipment</h1>
          <p className="theme-text-muted text-sm mt-1 font-medium">
            Standalone equipment that isn't tied to a specific place - available for any event,
            each with its own responsible technical officer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none theme-text-muted transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search equipment..."
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
              New Equipment
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border theme-border-danger theme-bg-danger-soft px-4 py-3 text-sm theme-text-danger">
          {error}
        </div>
      )}

      {loading && <p className="theme-text-muted">Loading equipment...</p>}

      {!loading && filteredEquipment.length === 0 && (
        <div className="text-center py-24 theme-bg-surface-muted border border-dashed theme-border rounded-3xl">
          <p className="theme-text-muted font-bold uppercase tracking-[0.2em] text-xs">
            {equipment.length === 0 ? "No standalone equipment registered yet." : "No matching equipment found"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {!loading &&
          filteredEquipment.map((item) => (
            <div
              key={item.id}
              className="theme-bg-surface-muted border theme-border rounded-3xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl theme-bg-tint-strong flex items-center justify-center theme-text-primary border theme-border-primary shrink-0">
                  <Wrench size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold theme-text truncate">{item.name}</h2>
                  <p className="text-xs theme-text-muted">{item.quantity} available</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs theme-text-muted">
                <User size={13} className="theme-text-soft" />
                {item.responsiblePersonName ? (
                  <span>
                    <span className="theme-text font-semibold">{item.responsiblePersonName}</span>{" "}
                    ({item.responsiblePersonRegNumber})
                  </span>
                ) : (
                  <span className="italic">No responsible person assigned</span>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2 mt-auto border-t theme-border">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface theme-hover-bg-tint border theme-border theme-text text-xs font-bold transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg theme-bg-surface theme-hover-bg-tint border theme-border theme-hover-border-danger theme-text-muted theme-hover-text-danger text-xs font-bold transition-colors disabled:opacity-60"
                  >
                    <Trash2 size={13} />
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {showModal && (
        <EquipmentFormModal
          equipment={editingItem}
          users={users}
          saving={saving}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default EquipmentPage;

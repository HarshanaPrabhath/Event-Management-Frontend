import { useState } from "react";
import { X, Save, MapPin, Plus, Trash2 } from "lucide-react";
import UserFilterSelect from "../../../shared/ui/UserFilterSelect";

const createResourceRow = (resource = {}) => ({
  id:
    resource.id ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
  name: resource.name || "",
  quantity: resource.quantity ?? 1,
});

const PlaceFormModal = ({ place, users = [], saving, onClose, onSave }) => {
  const [placeName, setPlaceName] = useState(place?.placeName || "");
  const [department, setDepartment] = useState(place?.department || "");
  const [capacity, setCapacity] = useState(place?.capacity ?? "");
  const [responsiblePersonRegNumber, setResponsiblePersonRegNumber] = useState(
    place?.responsiblePersonRegNumber || ""
  );
  const [resources, setResources] = useState(
    (place?.resources || []).map(createResourceRow)
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const addResource = () => {
    setResources((prev) => [...prev, createResourceRow()]);
  };

  const updateResource = (index, field, value) => {
    setResources((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const removeResource = (index) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedResources = resources
      .map((r) => ({
        name: (r.name || "").trim(),
        quantity: Number(r.quantity) || 0,
      }))
      .filter((r) => r.name);

    onSave(
      {
        placeName: placeName.trim(),
        department: department.trim(),
        capacity: capacity === "" ? null : Number(capacity),
        responsiblePersonRegNumber: responsiblePersonRegNumber || "",
        resources: cleanedResources,
      },
      photoFile
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 theme-modal-backdrop transition-opacity" onClick={onClose} />

      <div className="relative theme-bg-page border theme-border w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-tint-strong rounded-lg">
              <MapPin className="theme-text-primary" size={22} />
            </div>
            <h2 className="text-xl font-bold theme-text tracking-tight">
              {place ? "Edit Place" : "New Place"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 theme-hover-bg rounded-full theme-text-muted theme-hover-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Place Name</label>
              <input
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                required
                className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. ICT, ET, All"
                className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Capacity</label>
              <input
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
                Responsible Person (TO)
              </label>
              <UserFilterSelect
                users={users}
                value={responsiblePersonRegNumber}
                onChange={setResponsiblePersonRegNumber}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest theme-file-input-soft theme-text-muted text-sm w-full"
            />
            {(photoPreview || place?.photoUrl) && (
              <img
                src={photoPreview || place?.photoUrl}
                alt=""
                className="mt-2 h-32 w-full object-cover rounded-xl border theme-border"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
                Equipment / Resources
              </label>
              <button
                type="button"
                onClick={addResource}
                className="inline-flex items-center gap-1.5 rounded-lg border theme-border theme-bg-surface-muted px-3 py-1.5 text-xs font-bold theme-text theme-hover-bg transition-colors"
              >
                <Plus size={14} />
                Add Resource
              </button>
            </div>

            {resources.length === 0 && (
              <p className="text-xs theme-text-muted italic">
                No equipment listed for this place yet.
              </p>
            )}

            {resources.map((resource, index) => (
              <div
                key={resource.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_90px_auto] gap-3 rounded-xl border theme-border theme-bg-surface p-3"
              >
                <input
                  type="text"
                  value={resource.name}
                  onChange={(e) => updateResource(index, "name", e.target.value)}
                  placeholder="e.g. Microphone"
                  className="rounded-lg border theme-border theme-bg-surface px-3 py-2 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
                />
                <input
                  type="number"
                  min="0"
                  value={resource.quantity}
                  onChange={(e) => updateResource(index, "quantity", e.target.value)}
                  className="rounded-lg border theme-border theme-bg-surface px-3 py-2 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeResource(index)}
                  className="inline-flex items-center justify-center rounded-lg border theme-border-danger theme-bg-danger-soft px-3 py-2 theme-text-danger theme-hover-bg-tint transition-colors"
                  title="Remove resource"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <p className="text-[11px] theme-text-muted italic">
              Equipment listed here is always approved by this place's own responsible person
              above. For equipment that needs its own dedicated technical officer regardless of
              venue, use the separate Equipment page instead.
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 theme-text-muted theme-hover-text font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl theme-bg-primary theme-hover-bg-primary theme-disabled-bg theme-disabled-text theme-text-on-primary text-sm font-bold transition-colors"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Place"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceFormModal;

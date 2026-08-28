import { useState } from "react";
import { X, Save, Building2 } from "lucide-react";

const describeAssignment = (person, currentClubId) => {
  if (!person?.clubId || !person?.clubName) return "";
  if (currentClubId && String(person.clubId) === String(currentClubId)) return "";
  return ` — currently at ${person.clubName}`;
};

const EditClubModal = ({ club, secretaries = [], seniorTreasurers = [], saving, onClose, onSave }) => {
  const [clubName, setClubName] = useState(club?.clubName || "");
  const [secretaryRegNumber, setSecretaryRegNumber] = useState(club?.secretaryRegNumber || "");
  const [seniorTreasurerRegNumber, setSeniorTreasurerRegNumber] = useState(
    club?.seniorTreasurerRegNumber || ""
  );

  if (!club) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      clubName: clubName.trim(),
      secretaryRegNumber,
      seniorTreasurerRegNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 theme-modal-backdrop transition-opacity" onClick={onClose} />

      <div className="relative theme-bg-page border theme-border w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-tint-strong rounded-lg">
              <Building2 className="theme-text-primary" size={22} />
            </div>
            <h2 className="text-xl font-bold theme-text tracking-tight">Edit Club</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 theme-hover-bg rounded-full theme-text-muted theme-hover-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
              Club Name
            </label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              required
              className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
              Secretary
            </label>
            <select
              value={secretaryRegNumber || ""}
              onChange={(e) => setSecretaryRegNumber(e.target.value)}
              className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
            >
              <option value="">Unassigned</option>
              {secretaries.map((s) => (
                <option key={s.regNumber} value={s.regNumber}>
                  {s.userName} ({s.regNumber}){describeAssignment(s, club.clubId ?? club.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">
              Senior Treasurer
            </label>
            <select
              value={seniorTreasurerRegNumber || ""}
              onChange={(e) => setSeniorTreasurerRegNumber(e.target.value)}
              className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
            >
              <option value="">Unassigned</option>
              {seniorTreasurers.map((s) => (
                <option key={s.regNumber} value={s.regNumber}>
                  {s.userName} ({s.regNumber}){describeAssignment(s, club.clubId ?? club.id)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] theme-text-muted italic">
            Reassigning a secretary or senior treasurer here removes them from any club they
            currently hold that role at. Other club details (vision, mission, board) are managed
            by the secretary from their own club profile.
          </p>

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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;

import { useState } from "react";
import { X, Save, Wrench } from "lucide-react";
import UserFilterSelect from "../../../shared/ui/UserFilterSelect";

const EquipmentFormModal = ({ equipment, users = [], saving, onClose, onSave }) => {
  const [name, setName] = useState(equipment?.name || "");
  const [quantity, setQuantity] = useState(equipment?.quantity ?? 1);
  const [responsiblePersonRegNumber, setResponsiblePersonRegNumber] = useState(
    equipment?.responsiblePersonRegNumber || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      quantity: Number(quantity) || 0,
      responsiblePersonRegNumber,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 theme-modal-backdrop transition-opacity" onClick={onClose} />

      <div className="relative theme-bg-page border theme-border w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-tint-strong rounded-lg">
              <Wrench className="theme-text-primary" size={22} />
            </div>
            <h2 className="text-xl font-bold theme-text tracking-tight">
              {equipment ? "Edit Equipment" : "New Equipment"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 theme-hover-bg rounded-full theme-text-muted theme-hover-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Portable Projector"
              required
              className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
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
              emptyLabel="Select a responsible person..."
            />
            <p className="text-[11px] theme-text-muted italic">
              Required - this equipment isn't tied to a place, so it needs its own approver.
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
              disabled={saving || !responsiblePersonRegNumber}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl theme-bg-primary theme-hover-bg-primary theme-disabled-bg theme-disabled-text theme-text-on-primary text-sm font-bold transition-colors"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentFormModal;

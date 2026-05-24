import { Plus, Trash2 } from "lucide-react";

function BoardEditor({
  members,
  onMemberChange,
  onAddMember,
  onRemoveMember,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black uppercase tracking-widest theme-text-muted">
          Executive Board
        </label>
        <button
          type="button"
          onClick={onAddMember}
          className="inline-flex items-center gap-1.5 rounded-lg border theme-border theme-bg-surface-muted px-3 py-1.5 text-xs font-bold theme-text theme-hover-bg transition-colors"
        >
          <Plus size={14} />
          Add Member
        </button>
      </div>

      <div className="space-y-3">
        {members.map((member, index) => (
          <div
            key={member.id || index}
            className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 rounded-xl border theme-border theme-bg-surface p-3"
          >
            <input
              type="text"
              value={member.position}
              onChange={(e) => onMemberChange(index, "position", e.target.value)}
              placeholder="Position (e.g. President)"
              className="rounded-lg border theme-border theme-bg-surface px-3 py-2 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
            />
            <input
              type="text"
              value={member.name}
              onChange={(e) => onMemberChange(index, "name", e.target.value)}
              placeholder="Name (e.g. Harshana)"
              className="rounded-lg border theme-border theme-bg-surface px-3 py-2 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
            />
            <button
              type="button"
              onClick={() => onRemoveMember(index)}
              disabled={members.length === 1}
              className="inline-flex items-center justify-center rounded-lg border theme-border-danger theme-bg-danger-soft px-3 py-2 theme-text-danger theme-hover-bg-tint disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Remove member"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardEditor;

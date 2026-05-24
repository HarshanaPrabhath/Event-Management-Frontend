import ReadOnlyField from "./ReadOnlyField";

function BoardReadOnly({ members }) {
  if (!Array.isArray(members) || members.length === 0) {
    return <ReadOnlyField label="Executive Board" value="No board members saved." />;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-black uppercase tracking-widest theme-text-muted">
        Executive Board
      </p>
      <div className="rounded-xl border theme-border theme-bg-surface divide-y theme-divide">
        {members.map((member, index) => (
          <div key={`${member.position}-${member.name}-${index}`} className="px-4 py-3 flex items-center gap-3">
            <span className="text-xs font-bold theme-text-primary min-w-24">{member.position || "Role"}</span>
            <span className="text-sm theme-text">{member.name || "Unknown"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardReadOnly;

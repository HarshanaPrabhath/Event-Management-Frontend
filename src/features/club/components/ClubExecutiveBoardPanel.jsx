import { Users } from "lucide-react";

function ClubExecutiveBoardPanel({ members }) {
  return (
    <div className="p-6 rounded-3xl border theme-border theme-bg-surface">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Executive Board</p>
        <Users size={16} className="theme-text-soft" />
      </div>

      {members.length > 0 ? (
        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={`${member.position}-${member.name}-${index}`}
              className="rounded-xl border theme-border theme-bg-surface px-3 py-2"
            >
              <p className="text-[10px] font-black uppercase tracking-widest theme-text-primary">
                {member.position || "Role"}
              </p>
              <p className="text-sm font-semibold theme-text mt-1">
                {member.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center border-2 border-dashed theme-border rounded-2xl">
          <p className="text-xs theme-text-soft font-medium italic text-balance px-4">
            Board members for the current term have not been updated.
          </p>
        </div>
      )}
    </div>
  );
}

export default ClubExecutiveBoardPanel;

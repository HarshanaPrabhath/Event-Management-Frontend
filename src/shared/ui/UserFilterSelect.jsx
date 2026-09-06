import { useMemo, useState } from "react";
import { Search } from "lucide-react";

// A plain <select> paired with a live text filter above it - lets an admin narrow a long user
// list (e.g. technical officers) by name or reg number before picking one.
function UserFilterSelect({ users = [], value, onChange, emptyLabel = "Unassigned" }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        (u.userName || "").toLowerCase().includes(term) ||
        (u.regNumber || "").toLowerCase().includes(term)
    );
  }, [users, filter]);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name or reg number..."
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border theme-border theme-bg-surface text-xs theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors"
        />
      </div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full theme-bg-surface-muted border theme-border rounded-xl px-4 py-2.5 text-sm theme-text focus:outline-none theme-focus-border transition-colors"
      >
        <option value="">{emptyLabel}</option>
        {filtered.map((u) => (
          <option key={u.regNumber} value={u.regNumber}>
            {u.userName} ({u.regNumber})
          </option>
        ))}
      </select>
    </div>
  );
}

export default UserFilterSelect;

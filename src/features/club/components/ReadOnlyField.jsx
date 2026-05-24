function ReadOnlyField({ label, value, mono = false }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-black uppercase tracking-widest theme-text-muted">{label}</p>
      <div
        className={`w-full rounded-xl border theme-border theme-bg-surface px-4 py-3 text-sm theme-text whitespace-pre-wrap break-words ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value || "N/A"}
      </div>
    </div>
  );
}

export default ReadOnlyField;

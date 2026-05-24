function FormField({ label, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-widest theme-text-muted">
        {label}
      </label>
      <textarea
        {...props}
        className={`w-full rounded-xl border theme-border theme-bg-surface px-4 py-3 text-sm theme-text theme-placeholder focus:outline-none theme-focus-border transition-colors ${className}`}
      />
    </div>
  );
}

export default FormField;

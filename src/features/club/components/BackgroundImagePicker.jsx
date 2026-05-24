function BackgroundImagePicker({ onChange, previewUrl }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-widest theme-text-muted">
        Background Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="w-full rounded-xl border theme-border theme-bg-surface px-3 py-2 text-sm theme-text file:mr-3 file:rounded-md file:border-0 theme-file-input file:px-3 file:py-1.5 file:text-xs file:font-bold  "
      />
      {previewUrl && (
        <div className="rounded-xl border theme-border theme-bg-surface overflow-hidden">
          <img src={previewUrl} alt="Selected background preview" className="w-full h-52 object-cover" />
        </div>
      )}
    </div>
  );
}

export default BackgroundImagePicker;

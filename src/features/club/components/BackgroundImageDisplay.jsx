function BackgroundImageDisplay({ imageUrl }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-black uppercase tracking-widest theme-text-muted">
        Background Image
      </p>
      <div className="rounded-xl border theme-border theme-bg-surface overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Current club background"
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="h-40 flex items-center justify-center text-sm theme-text-muted">
            No background image uploaded.
          </div>
        )}
      </div>
    </div>
  );
}

export default BackgroundImageDisplay;

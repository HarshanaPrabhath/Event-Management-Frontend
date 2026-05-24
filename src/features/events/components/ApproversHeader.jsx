function ApproversHeader({ count }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-bold uppercase tracking-widest theme-text-primary">
        Approval Pipeline
      </h3>
      <span className="text-[10px] theme-text-muted font-medium">
        {count} Steps Defined
      </span>
    </div>
  );
}

export default ApproversHeader;

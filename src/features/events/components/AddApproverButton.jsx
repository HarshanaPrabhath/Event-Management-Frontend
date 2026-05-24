function AddApproverButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3 border border-dashed theme-border rounded-xl theme-text-muted text-sm font-medium theme-hover-bg theme-hover-border-primary theme-hover-text-primary transition-all"
    >
      <span className="text-lg">+</span> Add Extra Approval Step
    </button>
  );
}

export default AddApproverButton;

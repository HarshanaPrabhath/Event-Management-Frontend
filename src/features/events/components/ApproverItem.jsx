function ApproverItem({
  approver,
  index,
  stepNumber,
  roleMap,
  onRoleChange,
  onRemove,
}) {
  const isFirstApprover = Boolean(approver.isPlaceResponsible);

  return (
    <div
      key={`${approver.role}-${index}`}
      className="group flex gap-3 items-center theme-bg-surface-muted border theme-border p-3 rounded-xl transition-all theme-hover-bg"
    >
      <div className="flex-shrink-0">
        <input
          type="number"
          value={stepNumber ?? approver.order}
          disabled
          readOnly
          className={`w-12 theme-bg-page border theme-border rounded-lg p-2 text-center text-sm font-bold theme-text-primary focus:ring-1 theme-focus-ring outline-none ${
            isFirstApprover ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>

      <div className="flex-1">
        {isFirstApprover ? (
          <input
            type="text"
            value={approver.displayName || approver.role || ""}
            disabled
            className="w-full theme-bg-surface-muted border theme-border-primary rounded-lg p-2 text-sm theme-text-primary font-semibold italic"
          />
        ) : (
          <select
            value={approver.role}
            onChange={(e) => onRoleChange(index, e.target.value)}
            className="w-full theme-bg-surface-muted border theme-border rounded-lg p-2 text-sm theme-text outline-none cursor-pointer theme-focus-border"
          >
            {Object.keys(roleMap).map((role) => (
              <option key={role} value={role} className="theme-bg-surface theme-text">
                {role}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={isFirstApprover}
        className={`p-2 transition-colors md:opacity-0 group-hover:opacity-100 ${
          isFirstApprover
            ? "opacity-30 cursor-not-allowed theme-text-soft"
            : "theme-text-muted theme-hover-text-danger"
        }`}
        title={isFirstApprover ? "Cannot remove first approver" : "Remove step"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

export default ApproverItem;

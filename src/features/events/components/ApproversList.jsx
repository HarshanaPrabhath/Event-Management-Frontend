import ApproverItem from "./ApproverItem";

function ApproversList({
  approvers,
  roleMap,
  onRoleChange,
  onRemove
}) {
  // Mirror the real pipeline the backend builds (LetterService#buildAndSaveSteps):
  // [TO if a venue is chosen] -> senior treasurer (always injected) -> manual approvers.
  const hasPlaceResponsible = approvers.some((a) => a.isPlaceResponsible);
  const manualStepOffset = 1 + (hasPlaceResponsible ? 1 : 0); // senior treasurer, and the TO

  const stepNumbers = approvers.map((approver, idx) => {
    if (approver.isPlaceResponsible) return 1;
    const manualPos = approvers.slice(0, idx).filter((a) => !a.isPlaceResponsible).length + 1;
    return manualStepOffset + manualPos;
  });

  return (
    <div className="space-y-3">
      {approvers.map((approver, index) => (
        <ApproverItem
          key={`${approver.role}-${index}`}
          approver={approver}
          index={index}
          stepNumber={stepNumbers[index]}
          roleMap={roleMap}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default ApproversList;

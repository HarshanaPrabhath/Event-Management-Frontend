import ApproverItem from "./ApproverItem";

// Mirror the real pipeline the backend builds (LetterService#buildAndSaveSteps):
// [TO if a venue is chosen] -> [one TO per requested resource's department] -> senior treasurer
// (always injected) -> manual approvers. The senior treasurer and resource TOs are never part of
// the `approvers` state (the backend injects/resolves them automatically), so they're rendered
// here as locked rows, not sent back on submit.
function ApproversList({
  approvers,
  seniorTreasurer,
  resourceApprovers = [],
  roleMap,
  onRoleChange,
  onRemove
}) {
  const placeResponsibleEntry = approvers.find((a) => a.isPlaceResponsible);
  const manualApprovers = approvers.filter((a) => !a.isPlaceResponsible);

  const treasurerEntry = seniorTreasurer
    ? {
        role: seniorTreasurer.name,
        displayName: seniorTreasurer.name,
        locked: true,
      }
    : null;

  // realIndex maps back into the actual `approvers` array for role-change/remove; locked rows
  // (TO, resource TOs, senior treasurer) never trigger those callbacks so their index is unused.
  const rows = [
    ...(placeResponsibleEntry
      ? [{ approver: placeResponsibleEntry, realIndex: approvers.indexOf(placeResponsibleEntry), key: "place-responsible" }]
      : []),
    ...resourceApprovers.map((ra) => ({
      approver: { role: ra.name, displayName: ra.name, locked: true },
      realIndex: -1,
      key: `resource-${ra.regNumber}`,
    })),
    ...(treasurerEntry
      ? [{ approver: treasurerEntry, realIndex: -1, key: "senior-treasurer" }]
      : []),
    ...manualApprovers.map((approver) => {
      const realIndex = approvers.indexOf(approver);
      return { approver, realIndex, key: `${approver.role}-${realIndex}` };
    }),
  ];

  return (
    <div className="space-y-3">
      {rows.map(({ approver, realIndex, key }, position) => (
        <ApproverItem
          key={key}
          approver={approver}
          index={realIndex}
          stepNumber={position + 1}
          roleMap={roleMap}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default ApproversList;

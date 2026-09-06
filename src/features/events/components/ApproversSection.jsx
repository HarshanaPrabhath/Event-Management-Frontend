import ApproversHeader from "./ApproversHeader";
import ApproversList from "./ApproversList";
import AddApproverButton from "./AddApproverButton";

function ApproversSection({ approvers, setValues, roleMap, seniorTreasurer, resourceApprovers = [] }) {
  const resolveRoleDetails = (role) => {
    const raw = roleMap[role];
    if (!raw) {
      return { userId: "", displayName: role || "Staff member" };
    }

    if (typeof raw === "string") {
      return { userId: raw, displayName: role };
    }

    return {
      userId: raw.regNumber || raw.userId || "",
      displayName: raw.displayName || role,
    };
  };

  // Update a specific role in the pipeline
  const handleRoleChange = (index, role) => {
    const details = resolveRoleDetails(role);

    setValues(prev => {
      const updated = [...prev.approvers];
      updated[index] = {
        ...updated[index],
        role: role,
        userId: details.userId || "Pending Assignment",
        name: details.userId || "Pending Assignment",
        displayName: details.displayName,
      };
      return { ...prev, approvers: updated };
    });
  };

  // Add a manual step (it will append to the end of the current pipeline)
  const addApprover = () => {
    const roles = Object.keys(roleMap);
    const firstRole = roles.length > 0 ? roles[0] : "Lecturer";
    const details = resolveRoleDetails(firstRole);
    
    setValues(prev => ({
      ...prev,
      approvers: [
        ...prev.approvers,
        {
          order: prev.approvers.length + 1,
          role: firstRole,
          userId: details.userId || "Staff member",
          name: details.userId || "Staff member",
          displayName: details.displayName,
        },
      ],
    }));
  };

  const removeApprover = (index) => {
    setValues((prev) => {
      const filtered = prev.approvers
        .filter((_, i) => i !== index)
        .map((approver, i) => ({ ...approver, order: i + 1 }));

      return {
        ...prev,
        approvers: filtered,
      };
    });
  };

  return (
    <div className="space-y-4">
      <ApproversHeader count={approvers.length + (seniorTreasurer ? 1 : 0) + resourceApprovers.length} />
      <ApproversList
        approvers={approvers}
        seniorTreasurer={seniorTreasurer}
        resourceApprovers={resourceApprovers}
        roleMap={roleMap}
        onRoleChange={handleRoleChange}
        onRemove={removeApprover}
      />
      <AddApproverButton onClick={addApprover} />
    </div>
  );
}

export default ApproversSection;

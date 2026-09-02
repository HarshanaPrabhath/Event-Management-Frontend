export const createEventFormData = (payload, file) => {
  const formData = new FormData();

  formData.append("eventName", payload.eventName || "");
  formData.append("eventDate", payload.eventDate || "");
  formData.append("eventTime", payload.eventTime || "");
  formData.append("eventEndTime", payload.eventEndTime || "");
  formData.append("placeName", payload.eventPlace || "");
  formData.append("description", payload.description || "");

  if (file) {
    formData.append("letterPdf", file);
  }

  // The venue's responsible person (TO) is derived server-side from placeName in
  // LetterService#buildAndSaveSteps - it is kept in payload.approvers only to drive the
  // pipeline preview, so it must be stripped here and the manual approvers renumbered from 1.
  const manualApprovers = (payload.approvers || []).filter((a) => !a.isPlaceResponsible);
  manualApprovers.forEach((approver, index) => {
    const userId = approver.userId || approver.name || "";
    formData.append(`approvers[${index}].order`, String(index + 1));
    formData.append(`approvers[${index}].name`, String(userId));
  });

  return formData;
};

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

  (payload.approvers || []).forEach((approver, index) => {
    const userId = approver.userId || approver.name || "";
    formData.append(`approvers[${index}].order`, String(approver.order ?? ""));
    formData.append(`approvers[${index}].name`, String(userId));
  });

  return formData;
};

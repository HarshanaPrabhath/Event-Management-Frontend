import apiClient from "../../../shared/api/client";

export const getPlaces = () =>
  apiClient.get("/places");

export const createEvent = (formData) =>
  apiClient.post("/letter/place", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getDashboardCalendarBookings = () =>
  apiClient.get("/calendar/bookings");

export const getPublicCalendarEvents = () =>
  apiClient.get("/calendar/events");

export const getMyLetters = () =>
  apiClient.get("/letter/my");

// Club secretary edits a RETURNED_TO_SECRETARY letter and pushes it back into the flow from the
// start. formData fields mirror createEventFormData (eventName/eventDate/.../letterPdf), all optional.
export const resendLetter = (letterId, formData) =>
  apiClient.post(`/letter/${letterId}/resend`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Permanently close a letter. Allowed for the owning secretary or the club's senior treasurer.
export const cancelLetter = (letterId, reason) =>
  apiClient.post(`/letter/${letterId}/cancel`, {
    remarks: reason,
    rejectionReason: reason,
  });

export const getResponsiblePerson = (placeName) =>
  apiClient.get("/places/responsible-person", {
    params: { placeName },
  });

export const getResponsiblePersons = () =>
  apiClient.get("/auth/responsible-persons");

// Used to preview the approval pipeline order (TO, then senior treasurer) while placing a letter.
export const getMySeniorTreasurer = () =>
  apiClient.get("/me/club");

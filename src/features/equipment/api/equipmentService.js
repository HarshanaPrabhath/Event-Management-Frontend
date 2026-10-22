import apiClient from "../../../shared/api/client";

// eventDate/startTime/endTime are optional - when given, each item's remainingQuantity reflects
// what's actually still free for that slot (other overlapping events' approved claims subtracted
// out) instead of the raw total. excludeLetterId excludes a letter's own earlier claim.
export const getGeneralResources = ({ eventDate, startTime, endTime, excludeLetterId } = {}) =>
  apiClient.get("/general-resources", {
    params: { eventDate, startTime, endTime, excludeLetterId },
  });

export const createGeneralResourceAdmin = (payload) =>
  apiClient.post("/admin/general-resources", payload);

export const updateGeneralResourceAdmin = (id, payload) =>
  apiClient.put(`/admin/general-resources/${id}`, payload);

export const deleteGeneralResourceAdmin = (id) =>
  apiClient.delete(`/admin/general-resources/${id}`);

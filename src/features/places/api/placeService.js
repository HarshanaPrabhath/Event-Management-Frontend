import apiClient from "../../../shared/api/client";

export const getPlaces = () =>
  apiClient.get("/places");

export const createPlaceAdmin = (payload) =>
  apiClient.post("/admin/places", payload);

export const updatePlaceAdmin = (placeId, payload) =>
  apiClient.put(`/admin/places/${placeId}`, payload);

export const deletePlaceAdmin = (placeId) =>
  apiClient.delete(`/admin/places/${placeId}`);

export const uploadPlacePhoto = (placeId, formData) =>
  apiClient.post(`/admin/places/${placeId}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

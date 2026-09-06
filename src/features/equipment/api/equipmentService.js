import apiClient from "../../../shared/api/client";

export const getGeneralResources = () =>
  apiClient.get("/general-resources");

export const createGeneralResourceAdmin = (payload) =>
  apiClient.post("/admin/general-resources", payload);

export const updateGeneralResourceAdmin = (id, payload) =>
  apiClient.put(`/admin/general-resources/${id}`, payload);

export const deleteGeneralResourceAdmin = (id) =>
  apiClient.delete(`/admin/general-resources/${id}`);

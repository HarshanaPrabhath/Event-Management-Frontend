import apiClient from "../../../shared/api/client";

export const createClub = (payload) =>
  apiClient.post("/admin/clubs", payload);

export const getClubSecretaries = () =>
  apiClient.get("/admin/clubs/secretaries");

export const getClubs = () =>
  apiClient.get("/clubs");

export const getMyClub = () =>
  apiClient.get("/me/club");

export const updateMyClub = (payload) =>
  apiClient.put("/me/club", payload);

export const updateMyClubBgImage = (formData) =>
  apiClient.post("/me/club/bg-image", formData);

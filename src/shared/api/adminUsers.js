import apiClient from "./client";

// role: e.g. "TO" to list only technical officers. search: filters by name/regNumber/email.
export const getUsersAdmin = (params = {}) =>
  apiClient.get("/admin/users", { params });

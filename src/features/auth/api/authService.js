import apiClient from "../../../shared/api/client";

export const checkApi = () =>
  apiClient.get("/check");

export const login = (regNumber, password) =>
  apiClient.post("/auth/signin", { regNumber, password });

export const register = (username, email, password, regNumber) =>
  apiClient.post("/auth/register", {
    username,
    email,
    password,
    regNumber,
    role: ["user"],
  });

export const registerByAdmin = (username, email, password, regNumber, role) =>
  apiClient.post("/auth/register", {
    username,
    email,
    password,
    regNumber,
    role: [role],
  });

export const logoutUser = () =>
  apiClient.post("/auth/signout");

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
  apiClient.get("/calendar/event");

export const getMyLetters = () =>
  apiClient.get("/letter/my");

export const getResponsiblePerson = (placeName) =>
  apiClient.get("/places/responsible-person", {
    params: { placeName },
  });

export const getResponsiblePersons = () =>
  apiClient.get("/auth/responsible-persons");

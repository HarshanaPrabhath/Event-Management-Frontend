import React, { useEffect, useState } from "react";
import { EventForm } from "../components";
import {
  createEvent as createEventAPI,
  getPlaces,
  getResponsiblePersons,
} from "../../../shared/api/eventService";

const DEFAULT_ROLE_MAP = {
  Lecturer: { regNumber: "LC2001", displayName: "Lecturer" },
  Dean: { regNumber: "DID100", displayName: "Dean" },
  Head: { regNumber: "HD3001", displayName: "Head" },
};

function EventPage() {
  const getInitialState = () => ({
    eventName: "",
    eventDate: "",
    eventTime: "",
    eventEndTime: "",
    eventPlace: "",
    description: "",
    approvers: [],
  });

  const [values, setValues] = useState(getInitialState());
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [roleMap, setRoleMap] = useState(DEFAULT_ROLE_MAP);
  const [roleMapError, setRoleMapError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setPlacesLoading(true);
      setPlacesError(null);
      try {
        const data = await getPlaces();
        setPlaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Places error:", err);
        setPlacesError(err.message || "Failed to load places");
        setPlaces([]);
      } finally {
        setPlacesLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  useEffect(() => {
    const fetchResponsiblePeople = async () => {
      setRoleMapError(null);
      try {
        const data = await getResponsiblePersons();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        const mapped = list.reduce((acc, person, index) => {
          const key = (person?.userName || person?.email || `User ${index + 1}`).toString();
          const regNumber = (person?.regNumber || person?.email || "").toString();

          if (key && regNumber) {
            acc[key] = {
              regNumber,
              displayName: key,
            };
          }
          return acc;
        }, {});

        setRoleMap(Object.keys(mapped).length > 0 ? mapped : DEFAULT_ROLE_MAP);
      } catch (err) {
        console.error("Responsible persons error:", err);
        setRoleMapError(err.message || "Failed to load responsible persons");
        setRoleMap(DEFAULT_ROLE_MAP);
      }
    };

    fetchResponsiblePeople();
  }, []);

  const handleSubmit = async (payload) => {
    setLoading(true);
    try {
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

      (payload.approvers || []).forEach((approver, i) => {
        const userId = approver.userId || approver.name || "";
        formData.append(`approvers[${i}].order`, String(approver.order ?? ""));
        formData.append(`approvers[${i}].name`, String(userId));
      });

      const response = await createEventAPI(formData);
      console.info("EVENT RESPONSE:", response);
      alert(response || "Event created successfully!");
      setValues(getInitialState());
      setFile(null);
    } catch (err) {
      console.error("Event submit error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen theme-bg-page p-6 space-y-8">
      {placesLoading && <p className="theme-text">Loading places...</p>}
      {placesError && <p className="theme-text-danger">{placesError}</p>}
      {roleMapError && <p className="theme-text-danger">{roleMapError}</p>}

      <EventForm
        values={values}
        setValues={setValues}
        setFile={setFile}
        roleMap={roleMap}
        places={places}
        onSubmit={handleSubmit}
      />

      {loading && (
        <div className="fixed inset-0 theme-bg-overlay flex items-center justify-center z-[60]">
          <div className="theme-bg-primary px-6 py-3 rounded-full theme-text-on-primary font-bold animate-pulse">
            SUBMITTING...
          </div>
        </div>
      )}
    </div>
  );
}

export default EventPage;

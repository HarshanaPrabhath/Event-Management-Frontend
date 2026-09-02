import { useState } from "react";
import { EventForm } from "../components";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { usePlaces } from "../hooks/usePlaces";
import { useResponsiblePersons } from "../hooks/useResponsiblePersons";
import { getApiErrorMessage } from "../../../shared/api/apiError";

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
  const { places, loading: placesLoading, error: placesError } = usePlaces();
  const { roleMap, error: roleMapError } = useResponsiblePersons();
  const { loading, submitEvent } = useCreateEvent();

  const handleSubmit = async (payload) => {
    try {
      const response = await submitEvent(payload, file);
      alert(response || "Event created successfully!");
      setValues(getInitialState());
      setFile(null);
    } catch (err) {
      console.error("Event submit error:", err);
      alert(getApiErrorMessage(err, "Failed to create event"));
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
        <div className="fixed inset-0 theme-modal-backdrop flex items-center justify-center z-[60]">
          <div className="theme-bg-primary px-6 py-3 rounded-full theme-text-on-primary font-bold animate-pulse">
            SUBMITTING...
          </div>
        </div>
      )}
    </div>
  );
}

export default EventPage;

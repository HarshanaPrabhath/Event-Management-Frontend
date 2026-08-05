import { useState } from "react";
import { createEvent } from "../api/eventService";
import { createEventFormData } from "../utils/eventFormData";

export function useCreateEvent() {
  const [loading, setLoading] = useState(false);

  const submitEvent = async (payload, file) => {
    setLoading(true);

    try {
      const formData = createEventFormData(payload, file);
      return await createEvent(formData);
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitEvent };
}

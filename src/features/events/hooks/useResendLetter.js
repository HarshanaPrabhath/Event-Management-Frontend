import { useState } from "react";
import { resendLetter } from "../api/eventService";
import { createEventFormData } from "../utils/eventFormData";

export function useResendLetter() {
  const [loading, setLoading] = useState(false);

  const submitResend = async (letterId, payload, file) => {
    setLoading(true);

    try {
      const formData = createEventFormData(payload, file);
      return await resendLetter(letterId, formData);
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitResend };
}

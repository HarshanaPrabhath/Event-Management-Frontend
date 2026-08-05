import { useEffect, useState } from "react";
import { getPlaces } from "../api/eventService";

export function usePlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPlaces();
        setPlaces(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Places error:", err);
        setError(err.message || "Failed to load places");
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  return { places, loading, error };
}

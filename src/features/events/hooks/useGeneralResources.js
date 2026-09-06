import { useEffect, useState } from "react";
import { getGeneralResources } from "../../equipment/api/equipmentService";

export function useGeneralResources() {
  const [generalResources, setGeneralResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getGeneralResources();
        setGeneralResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("General resources error:", err);
        setError(err.message || "Failed to load equipment");
        setGeneralResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return { generalResources, loading, error };
}

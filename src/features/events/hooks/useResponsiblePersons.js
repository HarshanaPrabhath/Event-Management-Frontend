import { useEffect, useState } from "react";
import { getResponsiblePersons } from "../api/eventService";

export const DEFAULT_ROLE_MAP = {
  Lecturer: { regNumber: "LC2001", displayName: "Lecturer" },
  Dean: { regNumber: "DID100", displayName: "Dean" },
  Head: { regNumber: "HD3001", displayName: "Head" },
};

export function useResponsiblePersons() {
  const [roleMap, setRoleMap] = useState(DEFAULT_ROLE_MAP);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResponsiblePeople = async () => {
      setError(null);

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
        setError(err.message || "Failed to load responsible persons");
        setRoleMap(DEFAULT_ROLE_MAP);
      }
    };

    fetchResponsiblePeople();
  }, []);

  return { roleMap, error };
}

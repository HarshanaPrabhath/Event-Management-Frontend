import { useEffect, useState } from "react";
import { ApprovedLetterCardDetail } from "../components";
import { getApprovedByMe } from "../../../shared/api/approvalService";

function ApprovedByMePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedLetters();
  }, []);

  const fetchApprovedLetters = async () => {
    try {
      setLoading(true);

      const data = await getApprovedByMe();

      // handle array or single object safely
      const list = Array.isArray(data)
        ? data
        : data
        ? [data]
        : [];

      setLetters(list);
    } catch (err) {
      console.error("Approved fetch error:", err.message);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-text p-6">
        Loading approved letters...
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page p-6 theme-text">

      {/* HEADER */}
      <div className="mb-6 border-b theme-border pb-4">
        <h1 className="text-3xl font-bold theme-text-success">
          Approved By Me
        </h1>
        <p className="theme-text-muted text-sm">
          Letters you have approved
        </p>
      </div>

      {/* EMPTY STATE */}
      {letters.length === 0 ? (
        <div className="text-center theme-text-muted mt-20">
          No approved letters found
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <ApprovedLetterCardDetail
              key={letter.letterId}
              letter={letter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ApprovedByMePage;

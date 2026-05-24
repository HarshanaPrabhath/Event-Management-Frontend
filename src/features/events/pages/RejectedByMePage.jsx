import React, { useEffect, useState } from "react";
import { RejectedLetterCardDetail } from "../components";
import { getRejectedByMe } from "../../../shared/api/approvalService";

function RejectedByMePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRejectedLetters();
  }, []);

  const fetchRejectedLetters = async () => {
    try {
      const data = await getRejectedByMe();

      // handle array or single object safely
      const list = Array.isArray(data)
        ? data
        : data
        ? [data]
        : [];

      setLetters(list);
    } catch (err) {
      console.error("Rejected fetch error:", err.message);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-text p-6">
        Loading rejected letters...
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-page p-6 theme-text">

      {/* HEADER */}
      <div className="mb-6 border-b theme-border pb-4">
        <h1 className="text-3xl font-bold theme-text-danger">
          Rejected By Me
        </h1>
        <p className="theme-text-muted text-sm">
          Letters you have rejected
        </p>
      </div>

      {/* EMPTY STATE */}
      {letters.length === 0 ? (
        <div className="text-center theme-text-muted mt-20">
          No rejected letters found
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <RejectedLetterCardDetail
              key={letter.letterId}
              letter={letter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default RejectedByMePage;

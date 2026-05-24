import React, { useEffect, useState } from "react";
import { LetterCard } from "../components";
import { getMyLetters } from "../../../shared/api/eventService";

function MyLettersPage() {
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyLetters();

        const list = Array.isArray(data)
          ? data
          : data?.data
          ? data.data
          : [];

        setLetters(list);
      } catch (err) {
        console.error("ERROR:", err.message);
        setLetters([]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative min-h-screen theme-bg-page p-6 space-y-8 overflow-hidden">

      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full theme-bg-tint blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full theme-bg-tint blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b theme-border pb-6">
        <div>
          <h1 className="text-3xl font-bold theme-text">
            My Documents
          </h1>
          <p className="theme-text-muted text-sm mt-1">
            Manage and track your event proposals.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl theme-bg-surface-muted border theme-border theme-text-primary text-sm font-medium">
          {letters.length} Total Letters
        </div>
      </header>

      {/* Letters List */}
      <main className="relative z-10 space-y-6">
        {letters.length > 0 ? (
          letters.map((letter) => (
            <LetterCard key={letter.letterId} letter={letter} />
          ))
        ) : (
          <div className="text-center py-24 theme-bg-surface-muted border border-dashed theme-border rounded-3xl">
            <p className="theme-text-muted">
              No documents found in your history.
            </p>
          </div>
        )}
      </main>

    </div>
  );
}

export default MyLettersPage;

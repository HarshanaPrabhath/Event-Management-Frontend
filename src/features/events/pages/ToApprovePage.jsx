import { useCallback, useEffect, useState } from "react";
import { ApprovalLetterCard } from "../components";
import { getLettersToApprove, rejectLetter } from "../../../shared/api/approvalService";

function ToApprovePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");

  // ================= FETCH LETTERS =================
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getLettersToApprove();

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
          ? data.content
          : [];

      setLetters(list);
    } catch (err) {
      console.error("FETCH ERROR:", err.message);
      setLetters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ================= REFRESH AFTER APPROVE =================
  const handleApproveSuccess = () => {
    fetchData(); // reload list after sign-approve
  };

  // ================= REJECT =================
  const openRejectModal = (id) => {
    setSelectedId(id);
    setReason("");
    setShowModal(true);
  };

  const confirmReject = async () => {
    if (!reason.trim()) return;

    try {
      await rejectLetter(selectedId, reason);

      setLetters((prev) =>
        prev.filter((l) => l.letterId !== selectedId)
      );

      setShowModal(false);
      setSelectedId(null);
      setReason("");
    } catch (err) {
      console.error("Reject error:", err.message);
    }
  };

  return (
    <div className="relative min-h-screen theme-bg-page p-6 theme-text">

      <div className="mb-6 border-b theme-border pb-4">
        <h1 className="text-3xl font-bold">To Approve</h1>
        <p className="theme-text-muted text-sm">Pending approvals</p>
      </div>

      {loading && (
        <p className="theme-text-muted">Loading letters...</p>
      )}

      {!loading && letters.length === 0 && (
        <div className="text-center theme-text-muted mt-20">
          No letters pending approval 🎉
        </div>
      )}

      <div className="space-y-6">
        {letters.map((letter) => (
          <ApprovalLetterCard
            key={letter.letterId}
            letter={letter}
            onReject={openRejectModal}
            onApprove={handleApproveSuccess}   // ✅ IMPORTANT FIX
          />
        ))}
      </div>

      {/* REJECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 theme-bg-overlay flex items-center justify-center z-50">
          <div className="theme-bg-surface w-[400px] p-6 rounded-2xl border theme-border">

            <h2 className="text-xl font-bold mb-4">
              Reject Letter
            </h2>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-28 p-3 rounded-lg theme-bg-surface-muted border theme-border"
              placeholder="Enter rejection reason..."
            />

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setShowModal(false)}
                className="theme-text"
              >
                Cancel
              </button>

              <button
                onClick={confirmReject}
                className="theme-bg-danger theme-text-on-primary px-4 py-2 rounded"
              >
                Reject
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ToApprovePage;

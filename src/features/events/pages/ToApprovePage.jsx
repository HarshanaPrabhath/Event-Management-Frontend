import { useCallback, useEffect, useState } from "react";
import { ApprovalLetterCard } from "../components";
import { getLettersToApprove, rejectLetter, returnLetterToSecretary } from "../api/approvalService";

function ToApprovePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("reject"); // "reject" | "return"
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

      // Bounced letters (rejected downstream, back with the senior treasurer) need
      // priority attention over fresh letters awaiting a first look.
      const sorted = [...list].sort(
        (a, b) => (b.canReturnToSecretary ? 1 : 0) - (a.canReturnToSecretary ? 1 : 0)
      );

      setLetters(sorted);
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

  const handleApproveSuccess = () => {
    fetchData();
  };

  const openRejectModal = (id) => {
    setModalMode("reject");
    setSelectedId(id);
    setReason("");
    setShowModal(true);
  };

  const openReturnModal = (id) => {
    setModalMode("return");
    setSelectedId(id);
    setReason("");
    setShowModal(true);
  };

  const confirmModal = async () => {
    if (!reason.trim()) return;

    setSubmitting(true);
    try {
      if (modalMode === "return") {
        await returnLetterToSecretary(selectedId, reason);
      } else {
        await rejectLetter(selectedId, reason);
      }

      setLetters((prev) =>
        prev.filter((l) => l.letterId !== selectedId)
      );

      setShowModal(false);
      setSelectedId(null);
      setReason("");
    } catch (err) {
      console.error(`${modalMode === "return" ? "Return" : "Reject"} error:`, err.message);
      alert(err?.response?.data?.message || err.message || "Action failed");
    } finally {
      setSubmitting(false);
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
          No letters pending approval.
        </div>
      )}

      <div className="space-y-6">
        {letters.map((letter) => (
          <ApprovalLetterCard
            key={letter.letterId}
            letter={letter}
            onReject={openRejectModal}
            onApprove={handleApproveSuccess}
            onReturnToSecretary={openReturnModal}
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 theme-modal-backdrop flex items-center justify-center z-50">
          <div className="theme-bg-surface w-[400px] p-6 rounded-2xl border theme-border">

            <h2 className="text-xl font-bold mb-4">
              {modalMode === "return" ? "Return to Secretary" : "Reject Letter"}
            </h2>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-28 p-3 rounded-lg theme-bg-surface-muted border theme-border"
              placeholder={
                modalMode === "return"
                  ? "Explain what needs to change before resending..."
                  : "Enter rejection reason..."
              }
            />

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setShowModal(false)}
                className="theme-text"
              >
                Cancel
              </button>

              <button
                onClick={confirmModal}
                disabled={submitting}
                className={`px-4 py-2 rounded-lg font-semibold theme-text-on-primary disabled:opacity-60 ${
                  modalMode === "return"
                    ? "theme-bg-warning-solid theme-hover-bg-warning-solid"
                    : "theme-bg-danger-solid theme-hover-bg-danger-solid"
                }`}
              >
                {submitting
                  ? "Submitting..."
                  : modalMode === "return"
                  ? "Send to Secretary"
                  : "Reject"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ToApprovePage;

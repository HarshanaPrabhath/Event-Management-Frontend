import { useState } from "react";
import PdfViewer from "../../../shared/ui/PdfViewer";
import { buildServerFileUrl } from "../../../shared/api/fileUrl";
import { cancelLetter } from "../api/eventService";
import { useResendLetter } from "../hooks/useResendLetter";
import ResendLetterModal from "./ResendLetterModal";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  History,
  FileText,
  ExternalLink,
  Info,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Circle,
  RefreshCcw,
  Ban,
  Undo2,
  XCircle,
} from "lucide-react";
import {
  formatAppDate,
  formatAppDateTime,
  formatAppTime,
} from "../../../shared/utils/dateTime";
import { getStatusBadge } from "../utils/statusBadge";

const LetterCard = ({ letter, onChanged }) => {
  const [showResendModal, setShowResendModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { loading: resending, submitResend } = useResendLetter();

  if (!letter) return null;

  const handleResend = async (values, file) => {
    try {
      await submitResend(letter.letterId, values, file);
      setShowResendModal(false);
      if (onChanged) onChanged();
    } catch (err) {
      console.error("Resend error:", err);
      alert(err?.response?.data?.message || err.message || "Failed to resend letter");
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this letter? This cannot be undone.")) return;

    const reason = window.prompt("Optional reason for cancelling this letter:", "") || "";

    setCancelling(true);
    try {
      await cancelLetter(letter.letterId, reason);
      if (onChanged) onChanged();
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err?.response?.data?.message || err.message || "Failed to cancel letter");
    } finally {
      setCancelling(false);
    }
  };

  const pdfUrl = buildServerFileUrl(letter.pdfPath);
  const statusBadge = getStatusBadge(letter.globalStatus);
  const conflictSource = letter.bookingConflict || letter.conflictDetails || letter;
  const conflicts = Array.isArray(conflictSource?.conflicts)
    ? conflictSource.conflicts
    : [];
  // PENDING_BOOKING is the normal status once the venue's responsible person has confirmed the
  // slot - it means this letter legitimately holds its own reservation, not that it's blocked by
  // a conflict. Only an actual conflict payload (from a failed approve/resend attempt) should
  // trigger this banner.
  const hasBookingConflict =
    Boolean(conflictSource?.conflict) || conflicts.length > 0;
  const conflictMessage =
    conflictSource?.message ||
    letter.conflictMessage ||
    "Place is already booked for this date/time.";

  const previousApprovers = Array.isArray(letter.previousApprovers)
    ? [...letter.previousApprovers].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
    : [];
  const nextApprovers = Array.isArray(letter.nextApprovers)
    ? [...letter.nextApprovers].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
    : [];

  const latestRemark =
    letter.approvalNote ||
    previousApprovers[previousApprovers.length - 1]?.remarks ||
    letter.rejectionReason ||
    null;
  
  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 theme-bg-surface backdrop-blur-xl border theme-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">

      <div className="absolute top-0 right-0 w-64 h-64 theme-bg-tint blur-[100px] pointer-events-none" />

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 theme-text-muted">
            <FileText size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Request Documentation</span>
          </div>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noreferrer"
            className="theme-text-primary theme-hover-text-primary transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
          >
            Expand <ExternalLink size={12} />
          </a>
        </div>

        <div className="h-[550px] theme-bg-overlay rounded-[2rem] overflow-hidden border theme-border shadow-inner relative">
          <PdfViewer fileUrl={pdfUrl} />
        </div>
      </div>

      <div className="theme-text flex flex-col justify-between py-2">
        <div className="space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest theme-text-muted">
                Letter #{letter.letterId}
              </span>

              {(letter.canResend || letter.canCancel) && (
                <div className="ml-auto flex items-center gap-2">
                  {letter.canResend && (
                    <button
                      type="button"
                      onClick={() => setShowResendModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-primary theme-hover-bg-primary theme-text-on-primary text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <RefreshCcw size={12} /> Resend
                    </button>
                  )}
                  {letter.canCancel && (
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={handleCancel}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl theme-bg-danger-solid theme-hover-bg-danger-solid theme-text-on-primary text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-60"
                    >
                      <Ban size={12} /> {cancelling ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {letter.returnStage && (
              <div className="rounded-2xl border theme-border-warning theme-bg-warning-soft p-4">
                <div className="flex items-start gap-3">
                  <Undo2 size={18} className="mt-0.5 shrink-0 theme-text-warning" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest theme-text-warning">
                      {letter.returnStage === "SECRETARY"
                        ? "Returned to You for Revision"
                        : "Bounced Back to Senior Treasurer"}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed theme-text-warning">
                      {letter.returnStage === "SECRETARY"
                        ? "A downstream approver rejected this letter and the senior treasurer sent it back to you. Update the details and resend it, or cancel it."
                        : "A downstream approver rejected this letter. It's back with the senior treasurer, who can re-forward it or send it back to you."}
                    </p>
                    {letter.rejectionReason && (
                      <p className="mt-2 text-xs italic theme-text-warning">"{letter.rejectionReason}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {hasBookingConflict && (
              <div className="rounded-2xl border theme-border-warning theme-bg-warning-soft p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} className="mt-0.5 shrink-0 theme-text-warning" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest theme-text-warning">
                      Booking Conflict
                    </p>
                    <p className="mt-1 text-sm leading-relaxed theme-text-warning">
                      {conflictMessage}
                    </p>
                  </div>
                </div>

                {conflicts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {conflicts.map((conflict) => (
                      <div
                        key={`${conflict.calendarEventId || conflict.letterId}-${conflict.eventDate}-${conflict.eventTime}`}
                        className="rounded-xl border theme-border-warning theme-bg-surface p-3 text-xs theme-text"
                      >
                        <p className="font-bold">{conflict.title || "Existing booking"}</p>
                        <p className="mt-1 theme-text-muted">
                          {conflict.eventDate} {formatAppTime(conflict.eventTime)} - {formatAppTime(conflict.endTime || conflict.eventEndTime)} at {conflict.placeName || conflict.eventPlace || "same place"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h2 className="text-4xl font-black tracking-tight leading-tight">
              {letter.title || "Event Approval Request"}
            </h2>

            <div className="flex items-start gap-3 theme-bg-surface-muted p-4 rounded-2xl border theme-border">
              <Info size={18} className="theme-text-primary shrink-0 mt-0.5" />
              <p className="theme-text-muted text-sm leading-relaxed italic">
                "{letter.description || "No description provided."}"
              </p>
            </div>
          </div>

          {latestRemark && (
            <div className="rounded-2xl border theme-border theme-bg-surface p-4">
              <p className="text-[10px] font-black uppercase tracking-widest theme-text-muted">Approval Note</p>
              <p className="mt-1 text-sm theme-text">{latestRemark}</p>
            </div>
          )}

          {Array.isArray(letter.resourceRequests) && letter.resourceRequests.length > 0 && (
            <div className="rounded-2xl border theme-border theme-bg-surface p-4">
              <p className="text-[10px] font-black uppercase tracking-widest theme-text-muted mb-2">
                Resources Requested
              </p>
              <div className="space-y-1.5">
                {letter.resourceRequests.map((r, i) => {
                  const overAvailable = r.quantityAvailable != null && r.quantityRequested > r.quantityAvailable;
                  return (
                    <div key={`${r.resourceName}-${i}`} className="flex items-center justify-between text-xs">
                      <span className="theme-text font-semibold">
                        {r.quantityRequested}x {r.resourceName}
                        <span className="theme-text-muted font-normal"> &middot; {r.responsiblePersonName || "no TO assigned"}</span>
                      </span>
                      {overAvailable && (
                        <span className="theme-text-warning font-bold uppercase tracking-widest text-[10px]">
                          Only {r.quantityAvailable} available
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 theme-bg-surface rounded-2xl border theme-border theme-hover-border transition-colors">
              <p className="text-[9px] theme-text-muted font-black uppercase mb-1 tracking-widest">Event Date</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <Calendar size={14} className="theme-text-primary" /> {formatAppDate(letter.eventDate)}
              </p>
            </div>

            <div className="p-4 theme-bg-surface rounded-2xl border theme-border theme-hover-border transition-colors">
              <p className="text-[9px] theme-text-muted font-black uppercase mb-1 tracking-widest">Schedule</p>
              <p className="text-sm font-bold flex items-center gap-1.5 truncate">
                <Clock size={14} className="theme-text-primary shrink-0" /> 
                {formatAppTime(letter.eventTime)} 
                <ArrowRight size={10} className="theme-text-soft" /> 
                {formatAppTime(letter.eventEndTime)}
              </p>
            </div>

            <div className="p-4 theme-bg-surface rounded-2xl border theme-border theme-hover-border transition-colors col-span-2">
              <p className="text-[9px] theme-text-muted font-black uppercase mb-1 tracking-widest">Location</p>
              <p className="text-sm font-bold flex items-center gap-2">
                <MapPin size={14} className="theme-text-primary" /> {letter.eventPlace || "Venue not assigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 theme-bg-surface rounded-2xl border theme-border">
             <div className="w-10 h-10 rounded-full theme-bg-tint-strong flex items-center justify-center theme-text-primary">
               <User size={20} />
             </div>
             <div>
               <p className="text-[9px] theme-text-muted font-black uppercase tracking-widest">Initiated By</p>
               <p className="text-sm font-bold theme-text">
                 {letter.sender?.name || "Unknown"}
                 <span className="theme-text-muted font-medium ml-1">
                   ({letter.sender?.regNumber || "N/A"})
                 </span>
               </p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border theme-border theme-bg-surface p-3">
              <p className="text-[9px] font-black uppercase tracking-widest theme-text-muted">Created</p>
              <p className="mt-1 text-xs font-semibold theme-text">{formatAppDateTime(letter.createdAt)}</p>
            </div>
            <div className="rounded-xl border theme-border theme-bg-surface p-3">
              <p className="text-[9px] font-black uppercase tracking-widest theme-text-muted">Updated</p>
              <p className="mt-1 text-xs font-semibold theme-text">{formatAppDateTime(letter.updatedAt)}</p>
            </div>
            <div className="rounded-xl border theme-border theme-bg-surface p-3">
              <p className="text-[9px] font-black uppercase tracking-widest theme-text-muted">Final Decision</p>
              <p className="mt-1 text-xs font-semibold theme-text">{formatAppDateTime(letter.finalDecisionAt)}</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 theme-text-muted">
              <History size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Approval Flow</span>
            </div>

            <div className="flex flex-col gap-2">
              {previousApprovers.map((approver, index) => {
                const wasRejected = approver.status === "REJECTED";
                return (
                  <div
                    key={`${approver.stepOrder}-${approver.regNumber}-${index}`}
                    className={`flex items-center justify-between p-4 border rounded-2xl ${
                      wasRejected
                        ? "theme-bg-danger-soft theme-border-danger"
                        : "theme-bg-tint-strong theme-border-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg theme-bg-surface flex items-center justify-center border ${
                          wasRejected
                            ? "theme-text-danger theme-border-danger"
                            : "theme-text-primary theme-border-primary"
                        }`}
                      >
                        {wasRejected ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${
                          wasRejected ? "theme-text-danger" : "theme-text-primary"
                        }`}>
                          Step {approver.stepOrder} {wasRejected ? "Rejected" : "Approved"}
                        </p>
                        <p className="text-sm font-semibold theme-text">
                          {approver.name || "Approver"} ({approver.regNumber || "N/A"})
                        </p>
                        {approver.remarks && <p className="text-xs theme-text mt-1">{approver.remarks}</p>}
                      </div>
                    </div>
                    <p className="text-[11px] theme-text-muted">{formatAppDateTime(approver.actedAt)}</p>
                  </div>
                );
              })}

              {letter.currentApprover && (
                <div className="flex items-center justify-between p-4 theme-bg-tint-strong border theme-border-primary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg theme-bg-surface flex items-center justify-center theme-text-primary border theme-border-primary">
                      <CircleDot size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest theme-text-primary">
                        Current Approver (Step {letter.currentApprover?.stepOrder})
                      </p>
                      <p className="text-sm font-semibold theme-text">
                        {letter.currentApprover?.name || "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {nextApprovers.map((approver, index) => (
                <div key={`${approver.stepOrder}-${approver.regNumber}-${index}`} className="flex items-center justify-between p-4 theme-bg-surface border theme-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg theme-bg-surface-muted flex items-center justify-center theme-text-muted">
                      <Circle size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] theme-text-muted font-black uppercase tracking-widest">
                        Next Step {approver.stepOrder}
                      </p>
                      <p className="text-sm font-bold theme-text">
                        {approver.name || "Upcoming approver"} ({approver.regNumber || "N/A"})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black theme-text-muted uppercase">Waiting</span>
                </div>
              ))}

              {!letter.currentApprover && nextApprovers.length === 0 && (
                <div className="rounded-xl border theme-border theme-bg-surface px-4 py-3 text-xs theme-text-muted">
                  No pending approvers.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {showResendModal && (
      <ResendLetterModal
        letter={letter}
        loading={resending}
        onClose={() => setShowResendModal(false)}
        onConfirm={handleResend}
      />
    )}
    </>
  );
};

export default LetterCard;

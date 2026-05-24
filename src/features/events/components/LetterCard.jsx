import React from "react";
import PdfViewer from "../../../shared/ui/PdfViewer";
import { buildServerFileUrl } from "../../../shared/api/fileUrl";
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
} from "lucide-react";
import {
  formatAppDate,
  formatAppDateTime,
  formatAppTime,
} from "../../../shared/utils/dateTime";

const LetterCard = ({ letter }) => {
  if (!letter) return null;

  const pdfUrl = buildServerFileUrl(letter.pdfPath);
  const conflictSource = letter.bookingConflict || letter.conflictDetails || letter;
  const conflicts = Array.isArray(conflictSource?.conflicts)
    ? conflictSource.conflicts
    : [];
  const hasBookingConflict =
    Boolean(conflictSource?.conflict) ||
    conflicts.length > 0 ||
    letter.status === "PENDING_BOOKING" ||
    letter.globalStatus === "PENDING_BOOKING";
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 theme-bg-surface backdrop-blur-xl border theme-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      
      {/* 🟦 DECORATIVE BACKGROUND */}
      <div className="absolute top-0 right-0 w-64 h-64 theme-bg-tint blur-[100px] pointer-events-none" />

      {/* ================= LEFT: PDF ================= */}
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

      {/* ================= RIGHT: DETAILS ================= */}
      <div className="theme-text flex flex-col justify-between py-2">
        <div className="space-y-6">
          
          {/* HEADER & GLOBAL STATUS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full theme-bg-tint theme-text-primary text-[10px] font-black uppercase border theme-border-primary tracking-widest">
                {letter.globalStatus}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest theme-text-muted">
                Letter #{letter.letterId}
              </span>
            </div>

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

          {/* LOGISTICS GRID */}
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

          {/* SENDER INFO */}
          <div className="flex items-center gap-4 p-4 theme-bg-surface rounded-2xl border theme-border">
             <div className="w-10 h-10 rounded-full theme-bg-tint flex items-center justify-center theme-text-primary">
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

          {/* APPROVAL FLOW */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 theme-text-muted">
              <History size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Approval Flow</span>
            </div>

            <div className="flex flex-col gap-2">
              {previousApprovers.map((approver, index) => (
                <div key={`${approver.stepOrder}-${approver.regNumber}-${index}`} className="flex items-center justify-between p-4 theme-bg-tint border theme-border-primary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg theme-bg-tint-strong flex items-center justify-center theme-text-primary">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest theme-text-primary">
                        Step {approver.stepOrder} Approved
                      </p>
                      <p className="text-sm font-semibold theme-text">
                        {approver.name || "Approver"} ({approver.regNumber || "N/A"})
                      </p>
                      {approver.remarks && <p className="text-xs theme-text mt-1">{approver.remarks}</p>}
                    </div>
                  </div>
                  <p className="text-[11px] theme-text-muted">{formatAppDateTime(approver.actedAt)}</p>
                </div>
              ))}

              {letter.currentApprover && (
                <div className="flex items-center justify-between p-4 theme-bg-tint border theme-border-primary rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg theme-bg-tint-strong flex items-center justify-center theme-text-primary">
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
  );
};

export default LetterCard;

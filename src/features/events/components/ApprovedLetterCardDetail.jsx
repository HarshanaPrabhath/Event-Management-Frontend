import { cloneElement } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { buildServerFileUrl } from "../../../shared/api/fileUrl";
import { formatAppDate, formatAppDateTime, formatAppTime } from "../../../shared/utils/dateTime";
import PdfViewer from "../../../shared/ui/PdfViewer";
import { getStatusBadge } from "../utils/statusBadge";

function ApprovedLetterCardDetail({ letter }) {
  if (!letter) return null;

  const pdfUrl = buildServerFileUrl(letter.pdfPath);
  const statusBadge = getStatusBadge(letter.globalStatus || "APPROVED");
  const previousApprovers = Array.isArray(letter.previousApprovers)
    ? [...letter.previousApprovers].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
    : [];
  const nextApprovers = Array.isArray(letter.nextApprovers)
    ? [...letter.nextApprovers].sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
    : [];
  const myAction = letter.myAction || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 theme-bg-surface-muted backdrop-blur-xl border theme-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 theme-text-muted">
            <FileText size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Approved Document</span>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-1.5 theme-text-primary theme-hover-text-primary transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            Full View <ExternalLink size={12} className="group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        <div className="theme-bg-page rounded-[2rem] overflow-hidden border theme-border shadow-2xl h-[550px] relative">
          <PdfViewer fileUrl={pdfUrl} />
        </div>
      </div>

      <div className="flex flex-col space-y-5">
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`px-3 py-1 rounded-full border inline-flex items-center gap-2 ${statusBadge.className}`}>
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {statusBadge.label}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest theme-text-muted">
              Letter #{letter.letterId}
            </span>
          </div>

          <h2 className="text-3xl font-black theme-text tracking-tight leading-tight">
            {letter.title || "Event Approval Request"}
          </h2>

          <p className="theme-text-muted leading-relaxed border-l-2 theme-border-primary pl-4">
            {letter.description || "No description provided."}
          </p>
        </div>

        {letter.approvalNote && (
          <div className="rounded-2xl border theme-border-primary theme-bg-tint-strong px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest theme-text-primary">Approval Note</p>
            <p className="mt-1 text-sm theme-text-primary">{letter.approvalNote}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <DetailTile icon={<Calendar />} label="Event Date" value={formatAppDate(letter.eventDate)} />
          <DetailTile
            icon={<Clock />}
            label="Timeline"
            value={`${formatAppTime(letter.eventTime)} - ${formatAppTime(letter.eventEndTime)}`}
          />
          <DetailTile icon={<MapPin />} label="Place" value={letter.eventPlace || "Not specified"} />
          <DetailTile
            icon={<User />}
            label="Sender"
            value={`${letter.sender?.name || "Unknown"} (${letter.sender?.regNumber || "N/A"})`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetaItem label="Created" value={formatAppDateTime(letter.createdAt)} />
          <MetaItem label="Updated" value={formatAppDateTime(letter.updatedAt)} />
          <MetaItem label="Final Decision" value={formatAppDateTime(letter.finalDecisionAt)} />
        </div>

        {myAction && (
          <div className="rounded-2xl border theme-border-primary theme-bg-tint-strong p-4">
            <p className="text-[10px] font-black uppercase tracking-widest theme-text-primary">My Action</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs theme-text">
              <p>
                <span className="theme-text-muted">Name:</span> {myAction.name || "N/A"}
              </p>
              <p>
                <span className="theme-text-muted">Reg:</span> {myAction.regNumber || "N/A"}
              </p>
              <p>
                <span className="theme-text-muted">Step:</span> {myAction.stepOrder || "N/A"}
              </p>
              <p>
                <span className="theme-text-muted">Status:</span> {myAction.status || "N/A"}
              </p>
              <p>
                <span className="theme-text-muted">Assigned:</span> {formatAppDateTime(myAction.assignedAt)}
              </p>
              <p>
                <span className="theme-text-muted">Acted:</span> {formatAppDateTime(myAction.actedAt)}
              </p>
            </div>
            {myAction.remarks && <p className="mt-2 text-xs theme-text">{myAction.remarks}</p>}
          </div>
        )}

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 theme-text-muted px-1">
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Approval Trail</span>
          </div>

          {previousApprovers.length === 0 ? (
            <div className="rounded-xl border theme-border theme-bg-surface px-4 py-3 text-xs theme-text-muted">
              No previous approver records.
            </div>
          ) : (
            <div className="space-y-2">
              {previousApprovers.map((approver, index) => (
                <div
                  key={`${approver.stepOrder}-${approver.regNumber}-${index}`}
                  className="flex items-center justify-between p-4 rounded-2xl theme-bg-surface border theme-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl theme-bg-tint-strong flex items-center justify-center theme-text-primary border theme-border-primary">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-bold theme-text">
                        {approver.name || "Approver"} ({approver.regNumber || "N/A"})
                      </p>
                      <p className="text-[10px] theme-text-muted font-medium uppercase tracking-tighter">
                        Step {approver.stepOrder || "N/A"} • {approver.status || "N/A"}
                      </p>
                      {approver.remarks && <p className="text-xs theme-text-muted mt-1">{approver.remarks}</p>}
                    </div>
                  </div>
                  <p className="text-[10px] theme-text-muted">{formatAppDateTime(approver.actedAt, "HH:mm", "")}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border theme-border theme-bg-surface p-3 text-xs theme-text-muted">
            {letter.currentApprover
              ? `Current approver: ${letter.currentApprover.name || "N/A"}`
              : "Current approver: None"}
            <br />
            {nextApprovers.length > 0
              ? `Next approvers: ${nextApprovers.map((a) => a.name || "N/A").join(", ")}`
              : "Next approvers: None"}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailTile({ icon, label, value }) {
  return (
    <div className="p-4 rounded-[1.5rem] theme-bg-surface border theme-border">
      <div className="theme-text-muted mb-2">{cloneElement(icon, { size: 16 })}</div>
      <p className="text-[9px] font-black theme-text-muted uppercase tracking-widest mb-1">{label}</p>
      <p className="theme-text text-sm font-bold truncate leading-tight">{value}</p>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-xl border theme-border theme-bg-surface px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-widest theme-text-muted">{label}</p>
      <p className="mt-1 text-xs font-semibold theme-text">{value}</p>
    </div>
  );
}

export default ApprovedLetterCardDetail;

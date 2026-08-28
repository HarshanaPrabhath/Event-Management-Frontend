import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  CircleDot,
  Circle,
  Undo2,
} from "lucide-react";
import { formatAppDate, formatAppTime } from "../../../shared/utils/dateTime";
import { getStatusBadge } from "../utils/statusBadge";

const ApprovalLetterSummary = ({ letter, onReject, onOpenApproveModal, onReturnToSecretary }) => {
  if (!letter) return null;

  const statusBadge = getStatusBadge(letter.globalStatus);

  return (
    <div className="theme-text flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest rounded ${statusBadge.className}`}>
            {statusBadge.label}
          </span>
        </div>
        <h2 className="text-4xl font-black tracking-tight leading-tight uppercase">
          {letter.title}
        </h2>
        <p className="theme-text-muted mt-3 leading-relaxed border-l-2 theme-border pl-4 italic">
          "{letter.description || "No description provided."}"
        </p>

        {letter.canReturnToSecretary && (
          <div className="mt-4 rounded-2xl border theme-border-warning theme-bg-warning-soft p-4">
            <div className="flex items-start gap-3">
              <Undo2 size={18} className="mt-0.5 shrink-0 theme-text-warning" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest theme-text-warning">
                  Bounced by a Downstream Approver
                </p>
                <p className="mt-1 text-sm leading-relaxed theme-text-warning">
                  A later approver rejected this letter, so it came back to you. Approve to
                  re-forward it down the chain, or send it back to the club secretary for revision.
                </p>
                {letter.rejectionReason && (
                  <p className="mt-2 text-xs italic theme-text-warning">"{letter.rejectionReason}"</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <InfoTile 
          icon={<Calendar size={14} />} 
          label="Event Date" 
          value={formatAppDate(letter.eventDate)} 
        />
        <InfoTile 
          icon={<Clock size={14} />} 
          label="Timeline" 
          value={`${formatAppTime(letter.eventTime)} - ${formatAppTime(letter.eventEndTime)}`} 
        />
        <InfoTile 
          icon={<MapPin size={14} />} 
          label="Venue" 
          value={letter.eventPlace || "Not Specified"} 
        />
        <InfoTile 
          icon={<User size={14} />} 
          label="Requested By" 
          value={letter.sender?.name} 
          subValue={letter.sender?.regNumber}
        />
      </div>

      <div className="space-y-3 mb-8">
        <div className="p-4 theme-bg-surface-muted border theme-border rounded-2xl">
          <p className="text-[10px] font-black theme-text-muted uppercase tracking-widest mb-3">
            Approval Progress
          </p>
          <WorkflowProgress letter={letter} />
        </div>
      </div>

      <div className="flex gap-4 mt-auto">
        {letter.canReturnToSecretary && (
          <button
            onClick={() => onReturnToSecretary(letter.letterId)}
            className="flex-1 group py-4 rounded-2xl theme-bg-surface-muted theme-hover-bg-tint border border-transparent theme-hover-border-warning theme-text-muted theme-hover-text-warning transition-all duration-200 inline-flex items-center justify-center gap-2 font-bold"
          >
            <Undo2 size={18} className="group-hover:scale-110 transition-transform" />
            To Secretary
          </button>
        )}

        <button
          onClick={() => onReject(letter.letterId)}
          className="flex-1 group py-4 rounded-2xl theme-bg-surface-muted theme-hover-bg-tint border border-transparent theme-hover-border-danger theme-text-muted theme-hover-text-danger transition-all duration-200 inline-flex items-center justify-center gap-2 font-bold"
        >
          <XCircle size={18} className="group-hover:scale-110 transition-transform" />
          Reject
        </button>

        <button
          onClick={onOpenApproveModal}
          className="flex-1 group py-4 rounded-2xl theme-bg-primary theme-hover-bg-primary theme-text-on-primary transition-all duration-200 inline-flex items-center justify-center gap-2 font-bold shadow-lg theme-shadow"
        >
          <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
          {letter.canReturnToSecretary ? "Re-forward" : "Approve"}
        </button>
      </div>
    </div>
  );
};

const InfoTile = ({ icon, label, value, subValue }) => (
  <div className="p-3 theme-bg-surface border theme-border rounded-xl">
    <div className="flex items-center gap-2 theme-text-muted mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-xs font-bold theme-text truncate">{value}</p>
    {subValue && <p className="text-[10px] theme-text-muted">{subValue}</p>}
  </div>
);

const WorkflowProgress = ({ letter }) => {
  const previous = Array.isArray(letter.previousApprovers) ? [...letter.previousApprovers] : [];
  previous.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

  const next = Array.isArray(letter.nextApprovers) ? [...letter.nextApprovers] : [];
  next.sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0));

  const stages = [
    ...previous.map((approver) => ({ ...approver, state: "approved" })),
    ...(letter.currentApprover ? [{ ...letter.currentApprover, state: "current" }] : []),
    ...next.map((approver) => ({ ...approver, state: "waiting" })),
  ];

  if (stages.length === 0) {
    return <p className="text-xs theme-text-muted">No workflow steps available.</p>;
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-start gap-0 min-w-max pr-2">
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;

        return (
          <div key={`${stage.stepOrder}-${stage.name}-${index}`} className="flex items-center">
            <div className="min-w-[150px] max-w-[170px]">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                stage.state === "approved"
                  ? "theme-bg-tint-strong theme-border-primary theme-text-primary"
                  : stage.state === "current"
                  ? "theme-bg-tint-strong theme-border-primary theme-text-primary"
                  : "theme-bg-page theme-border theme-text-muted"
              }`}>
                {stage.state === "approved" ? <Check size={13} /> : stage.state === "current" ? <CircleDot size={13} /> : <Circle size={13} />}
              </div>
                <div>
                  <p className="text-xs font-bold theme-text truncate">
                    Step {stage.stepOrder}: {stage.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-widest theme-text-muted">
                    {stage.state === "approved" ? "Approved" : stage.state === "current" ? "Current" : "Waiting"}
                  </p>
                </div>
              </div>
            </div>

            {!isLast && (
              <div className={`mx-2 w-10 h-0.5 ${
                stage.state === "approved" ? "theme-bg-tint-strong" : "theme-bg-surface-strong"
              }`} />
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default ApprovalLetterSummary;

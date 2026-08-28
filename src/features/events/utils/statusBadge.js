// Maps a letter's globalStatus to a friendly label + theme badge classes.
// Uses the semantic status tokens (success / warning / danger) so the badge stays legible in
// both light and dark themes instead of every status rendering as the same faint blue tint.

const NEUTRAL = "theme-bg-surface-strong theme-text-muted theme-border";

const STATUS_BADGES = {
  APPROVED: {
    label: "Approved",
    className: "theme-bg-success-soft theme-text-success theme-border-success",
  },
  PENDING: {
    label: "Pending",
    className: "theme-bg-warning-soft theme-text-warning theme-border-warning",
  },
  PENDING_BOOKING: {
    label: "Pending Booking",
    className: "theme-bg-warning-soft theme-text-warning theme-border-warning",
  },
  RETURNED_TO_SECRETARY: {
    label: "Returned to Secretary",
    className: "theme-bg-tint-strong theme-text-primary theme-border-primary",
  },
  REJECTED: {
    label: "Rejected",
    className: "theme-bg-danger-soft theme-text-danger theme-border-danger",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "theme-bg-danger-soft theme-text-danger theme-border-danger",
  },
};

export const getStatusBadge = (status) => {
  const key = typeof status === "string" ? status.trim().toUpperCase() : "";
  const preset = STATUS_BADGES[key];

  if (preset) return preset;

  return {
    label: key ? key.replace(/_/g, " ") : "Unknown",
    className: NEUTRAL,
  };
};

import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import {
  Calendar as CalendarIcon,
  Clock,
  Info,
  MapPin,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { getDashboardCalendarBookings } from "../api/eventService";
import { parseAppDateTime } from "../../../shared/utils/dateTime";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const STATUS_GROUPS = {
  approved: "approved",
  pending: "pending",
};

const STATUS_THEME = {
  approved: {
    label: "Approved",
    dot: "theme-bg-accent",
    chip: "theme-border-primary theme-text-primary theme-bg-tint-strong",
    className: "calendar-event-approved",
  },
  pending: {
    label: "Pending",
    dot: "theme-bg-warning",
    chip: "theme-border-warning theme-text-warning theme-bg-warning-soft",
    className: "calendar-event-pending",
  },
};

const normalizeStatus = (event) =>
  String(
    event?.globalStatus ||
      event?.status ||
      event?.letterStatus ||
      event?.approvalStatus ||
      ""
  )
    .trim()
    .toUpperCase();

const getStatusGroup = (event) => {
  const status = normalizeStatus(event);

  if (status.includes("APPROVED")) return STATUS_GROUPS.approved;
  return STATUS_GROUPS.pending;
};

const mapCalendarEvent = (rawEvent) => {
  const start = parseAppDateTime(rawEvent?.eventDate, rawEvent?.eventTime);
  if (!start) return null;

  const parsedEnd = parseAppDateTime(
    rawEvent?.eventDate,
    rawEvent?.endTime || rawEvent?.eventEndTime
  );

  const end = parsedEnd || new Date(start.getTime() + 60 * 60 * 1000);
  const status = normalizeStatus(rawEvent) || "PENDING";

  if (
    status.includes("REJECTED") ||
    status.includes("DECLINED") ||
    status.includes("NOT_APPROVED")
  ) {
    return null;
  }

  const group = getStatusGroup({ status });

  return {
    id: rawEvent?.calendarEventId ?? rawEvent?.letterId ?? rawEvent?.id,
    title: rawEvent?.title || rawEvent?.eventName || "Untitled Event",
    start,
    end,
    location: rawEvent?.placeName || rawEvent?.eventPlace || "Unspecified",
    description: rawEvent?.description || "",
    status,
    statusGroup: group,
  };
};

function CalendarPage({ source = "dashboard" }) {
  const isPublicView = source === "public";
  const visibleStatusGroups = isPublicView ? [STATUS_GROUPS.approved] : Object.keys(STATUS_THEME);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [activeStatus, setActiveStatus] = useState(() => ({
    approved: true,
    pending: !isPublicView,
  }));

  useEffect(() => {
    setActiveStatus({
      approved: true,
      pending: !isPublicView,
    });
  }, [isPublicView]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardCalendarBookings();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const mapped = list
        .map(mapCalendarEvent)
        .filter(Boolean)
        .filter((event) => (isPublicView ? event.statusGroup === STATUS_GROUPS.approved : true));
      setEvents(mapped);
    } catch (err) {
      console.error("Calendar fetch failed:", err);
      setError("Failed to load calendar events.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [isPublicView]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const counts = useMemo(() => {
    const summary = {
      approved: 0,
      pending: 0,
    };

    events.forEach((event) => {
      summary[event.statusGroup] = (summary[event.statusGroup] || 0) + 1;
    });

    return summary;
  }, [events]);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events.filter((event) => {
      if (!activeStatus[event.statusGroup]) return false;

      if (!q) return true;

      const haystack = `${event.title} ${event.location} ${event.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [events, activeStatus, query]);

  const toggleStatus = (statusGroup) => {
    setActiveStatus((prev) => ({ ...prev, [statusGroup]: !prev[statusGroup] }));
  };

  const clearFilters = () => {
    setQuery("");
    setActiveStatus({
      approved: true,
      pending: !isPublicView,
    });
  };

  const eventPropGetter = (event) => ({
    className: STATUS_THEME[event.statusGroup || STATUS_GROUPS.pending].className,
  });

  return (
    <div className="min-h-screen theme-bg-page theme-text p-6 md:p-10 theme-selection">
      <div className="max-w-[1400px] mx-auto relative z-10 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b theme-border pb-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight theme-text">
              Event Calendar
            </h1>
            <p className="text-sm theme-text-muted">
              {isPublicView
                ? "Track approved events in one place."
                : "Track approved and pending events in one place."}
            </p>
          </div>

          <div className="theme-bg-surface-muted border theme-border p-4 rounded-2xl flex items-center gap-6">
            <div className="text-right">
              <p className="theme-text-muted text-[9px] font-bold uppercase tracking-widest mb-1">
                System Time
              </p>
              <p className="theme-text font-mono text-xl tabular-nums leading-none tracking-wider">
                {format(now, "HH:mm:ss")}
              </p>
            </div>
            <div className="h-8 w-[1px] theme-bg-surface-strong" />
            <div className="text-right">
              <p className="theme-text-muted text-[9px] font-bold uppercase tracking-widest mb-1">
                Visible Events
              </p>
              <p className="theme-text font-bold text-xl leading-none">{filteredEvents.length}</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="flex items-center gap-2 rounded-xl border theme-border theme-bg-surface-muted px-3">
            <Search size={16} className="theme-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, place, or status"
              className="w-full bg-transparent py-3 text-sm theme-text theme-placeholder outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {visibleStatusGroups.map((statusGroup) => {
              const isActive = activeStatus[statusGroup];
              const style = STATUS_THEME[statusGroup];

              return (
                <button
                  key={statusGroup}
                  type="button"
                  onClick={() => toggleStatus(statusGroup)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? style.chip
                      : "theme-border theme-text-muted theme-bg-surface-muted"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                  {style.label} ({counts[statusGroup] || 0})
                </button>
              );
            })}

            <button
              type="button"
              onClick={fetchEvents}
              className="inline-flex items-center gap-2 rounded-xl border theme-border px-3 py-1.5 text-xs font-bold theme-text theme-hover-bg transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-xl border theme-border px-3 py-1.5 text-xs font-bold theme-text-muted theme-hover-text theme-hover-bg transition-colors"
            >
              Clear
            </button>
          </div>
        </section>

        <div className="theme-bg-surface-muted backdrop-blur-xl border theme-border rounded-[2rem] p-4 md:p-6 shadow-2xl">
          {loading ? (
            <div className="h-[740px] rounded-2xl border theme-border theme-bg-surface animate-pulse" />
          ) : error ? (
            <div className="h-[740px] rounded-2xl border theme-border-danger theme-bg-danger-soft flex items-center justify-center">
              <div className="text-center space-y-3">
                <p className="theme-text-danger font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={fetchEvents}
                  className="inline-flex items-center gap-2 rounded-xl border theme-border-danger px-4 py-2 text-xs font-bold theme-text-danger theme-hover-bg-tint"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              views={["month", "week", "day", "agenda"]}
              popup
              style={{ height: 740 }}
              onSelectEvent={setSelected}
              eventPropGetter={eventPropGetter}
              messages={{
                next: "Next",
                previous: "Back",
                today: "Today",
                month: "Month",
                week: "Week",
                day: "Day",
                agenda: "Agenda",
                noEventsInRange: "No events in this range.",
              }}
            />
          )}
        </div>

        {!loading && !error && filteredEvents.length === 0 && (
          <div className="rounded-2xl border theme-border theme-bg-surface-muted px-4 py-6 text-center text-sm theme-text-muted">
            No events match your current filters.
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 theme-modal-backdrop" onClick={() => setSelected(null)} />

            <div className="relative theme-bg-page border theme-border rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="h-1.5 theme-gradient-primary-r" />

              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="theme-bg-tint-strong theme-text-primary p-3 rounded-xl border theme-border-primary">
                    <Info size={24} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="p-2 theme-hover-bg rounded-full transition-colors theme-text-muted theme-hover-text"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold theme-text tracking-tight leading-tight">
                    {selected.title}
                  </h3>
                  <p className="theme-text-muted leading-relaxed">
                    {selected.description || "No additional description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 pt-4 border-t theme-border">
                  <ModalDetail icon={<MapPin />} label="Venue" value={selected.location} />
                  <ModalDetail
                    icon={<Clock />}
                    label="Time"
                    value={`${format(selected.start, "PPP p")} - ${format(selected.end, "p")}`}
                  />
                  <ModalDetail
                    icon={<CalendarIcon />}
                    label="Approval Status"
                    value={selected.status || "PENDING"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModalDetail({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl theme-bg-surface-muted border theme-border">
      <div className="theme-text-primary">
        {isValidElement(icon) ? cloneElement(icon, { size: 18 }) : icon}
      </div>
      <div>
        <p className="text-[10px] font-bold theme-text-muted uppercase tracking-[0.15em] mb-1">
          {label}
        </p>
        <p className="theme-text font-semibold">{value || "Unspecified"}</p>
      </div>
    </div>
  );
}

export default CalendarPage;

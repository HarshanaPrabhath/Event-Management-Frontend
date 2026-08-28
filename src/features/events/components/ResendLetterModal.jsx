import { useState } from "react";
import { X, RefreshCcw, Calendar, Clock, MapPin, AlignLeft, FileText } from "lucide-react";
import { usePlaces } from "../hooks/usePlaces";

const toDateInputValue = (value) => (typeof value === "string" ? value.slice(0, 10) : "");
const toTimeInputValue = (value) => (typeof value === "string" ? value.slice(0, 5) : "");

const ResendLetterModal = ({ letter, loading, onClose, onConfirm }) => {
  const { places } = usePlaces();
  const [values, setValues] = useState({
    eventName: letter?.title || "",
    eventDate: toDateInputValue(letter?.eventDate),
    eventTime: toTimeInputValue(letter?.eventTime),
    eventEndTime: toTimeInputValue(letter?.eventEndTime),
    eventPlace: letter?.eventPlace || "",
    description: letter?.description || "",
  });
  const [file, setFile] = useState(null);

  if (!letter) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(values, file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 theme-modal-backdrop transition-opacity" onClick={onClose} />

      <div className="relative theme-bg-page border theme-border w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-tint-strong rounded-lg">
              <RefreshCcw className="theme-text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text tracking-tight">Revise &amp; Resend Letter</h2>
              <p className="text-[10px] theme-text-muted uppercase tracking-widest mt-1">
                Sends back to the senior treasurer for a fresh approval pass
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 theme-hover-bg rounded-full theme-text-muted theme-hover-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
          {letter.rejectionReason && (
            <div className="rounded-2xl border theme-border-warning theme-bg-warning-soft p-4">
              <p className="text-[10px] font-black theme-text-warning uppercase tracking-widest mb-1">
                Reason it was returned
              </p>
              <p className="text-sm theme-text-warning">{letter.rejectionReason}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
              Event Title
            </label>
            <input
              name="eventName"
              value={values.eventName}
              onChange={handleChange}
              className="w-full p-4 theme-bg-surface border theme-border rounded-2xl focus:outline-none theme-focus-border transition-all theme-text"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="Date" icon={<Calendar size={14} />}>
              <input
                type="date"
                name="eventDate"
                value={values.eventDate}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none theme-text"
                required
              />
            </Field>
            <Field label="Start" icon={<Clock size={14} />}>
              <input
                type="time"
                name="eventTime"
                value={values.eventTime}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none theme-text"
                required
              />
            </Field>
            <Field label="End" icon={<Clock size={14} />}>
              <input
                type="time"
                name="eventEndTime"
                value={values.eventEndTime}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none theme-text"
                required
              />
            </Field>
            <Field label="Venue" icon={<MapPin size={14} />}>
              <select
                name="eventPlace"
                value={values.eventPlace || ""}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none cursor-pointer appearance-none theme-text"
              >
                <option value="" className="theme-bg-page theme-text-muted italic">Without Location</option>
                {places.map((p) => (
                  <option key={p.placeId} value={p.placeName} className="theme-bg-page theme-text">
                    {p.placeName}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
              Description
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-4 top-4 theme-text-muted" size={18} />
              <textarea
                name="description"
                rows="3"
                value={values.description}
                onChange={handleChange}
                className="w-full p-4 pl-12 theme-bg-surface border theme-border rounded-2xl focus:outline-none theme-focus-border transition-all theme-text resize-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">
              Replace Documentation (optional)
            </label>
            <div className="border-2 border-dashed theme-border theme-hover-border-primary rounded-2xl p-4 transition-all theme-bg-surface group text-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest theme-file-input-soft theme-text-muted text-sm w-full"
              />
            </div>
            <p className="text-[10px] theme-text-muted flex items-center gap-1.5 ml-1">
              <FileText size={12} /> Leave empty to keep the previously submitted PDF.
            </p>
          </div>

          <p className="text-[11px] theme-text-muted italic">
            The approver chain from the original submission stays the same — the senior treasurer
            reviews first, followed by the place-responsible person and any other approvers already assigned.
          </p>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 theme-text-muted theme-hover-text font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 theme-bg-primary theme-hover-bg-primary theme-disabled-bg theme-disabled-text theme-text-on-primary rounded-xl font-bold transition-all shadow-lg theme-shadow active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 theme-border border-t-white rounded-full animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCcw size={16} />
                  Resend for Approval
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, icon, children }) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">{label}</label>
    <div className="flex items-center gap-2 p-3 theme-bg-surface border theme-border rounded-2xl theme-focus-border transition-all">
      <div className="theme-text-muted shrink-0">{icon}</div>
      <div className="text-sm w-full">{children}</div>
    </div>
  </div>
);

export default ResendLetterModal;

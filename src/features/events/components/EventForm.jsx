import { useEffect, useMemo, useRef, useState } from "react";
import ApproversSection from "./ApproversSection";
import { getResponsiblePerson, getMySeniorTreasurer } from "../api/eventService";
import { Calendar, Clock, MapPin, AlignLeft, FileText, Send, Loader2, Wrench } from "lucide-react";

// The real approval order the backend builds (LetterService#buildAndSaveSteps): the venue's
// responsible person (TO) leads when a venue is requested, the senior treasurer always signs
// next, then the manually-added approvers in the order they were added.
const renumber = (list) => list.map((a, i) => ({ ...a, order: i + 1 }));

function EventForm({ values, setValues, setFile, roleMap, places = [], generalResources = [], onSubmit }) {
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [seniorTreasurer, setSeniorTreasurer] = useState(null);
  const [resourceSelections, setResourceSelections] = useState({});
  const [generalResourceSelections, setGeneralResourceSelections] = useState({});
  const fileInputRef = useRef(null);

  const selectedPlace = useMemo(
    () => places.find((p) => p.placeName === values.eventPlace) || null,
    [places, values.eventPlace]
  );
  const availableResources = selectedPlace?.resources || [];

  const buildSelectedItems = (available, selections) =>
    available
      .filter((r) => selections[r.id]?.checked)
      .map((r) => ({
        resourceId: r.id,
        quantity: Math.max(1, Number(selections[r.id]?.quantity) || 1),
        name: r.name,
        available: r.quantity,
        responsiblePersonRegNumber: r.responsiblePersonRegNumber,
        responsiblePersonName: r.responsiblePersonName,
      }));

  const selectedResourceItems = buildSelectedItems(availableResources, resourceSelections);
  const selectedGeneralResourceItems = buildSelectedItems(generalResources, generalResourceSelections);

  const distinctResourceApprovers = [];
  [...selectedResourceItems, ...selectedGeneralResourceItems].forEach((item) => {
    if (
      item.responsiblePersonRegNumber &&
      !distinctResourceApprovers.some((a) => a.regNumber === item.responsiblePersonRegNumber)
    ) {
      distinctResourceApprovers.push({
        regNumber: item.responsiblePersonRegNumber,
        name: item.responsiblePersonName || item.responsiblePersonRegNumber,
      });
    }
  });

  const toggleResource = (resourceId, checked) => {
    setResourceSelections((prev) => ({
      ...prev,
      [resourceId]: { checked, quantity: prev[resourceId]?.quantity ?? 1 },
    }));
  };

  const setResourceQuantity = (resourceId, quantity) => {
    setResourceSelections((prev) => ({
      ...prev,
      [resourceId]: { checked: prev[resourceId]?.checked ?? true, quantity },
    }));
  };

  const toggleGeneralResource = (resourceId, checked) => {
    setGeneralResourceSelections((prev) => ({
      ...prev,
      [resourceId]: { checked, quantity: prev[resourceId]?.quantity ?? 1 },
    }));
  };

  const setGeneralResourceQuantity = (resourceId, quantity) => {
    setGeneralResourceSelections((prev) => ({
      ...prev,
      [resourceId]: { checked: prev[resourceId]?.checked ?? true, quantity },
    }));
  };

  // Reset file input if eventName is cleared
  useEffect(() => {
    if (!values.eventName && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [values.eventName]);

  useEffect(() => {
    getMySeniorTreasurer()
      .then((data) => {
        if (data?.seniorTreasurerRegNumber) {
          setSeniorTreasurer({
            regNumber: data.seniorTreasurerRegNumber,
            name: data.seniorTreasurerName || data.seniorTreasurerRegNumber,
          });
        }
      })
      .catch((err) => console.error("Senior treasurer lookup error:", err));
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name !== "eventPlace") {
      setValues((prev) => ({ ...prev, [name]: value }));
      return;
    }

    const placeValue = value === "" ? null : value;
    const manualApprovers = (values.approvers || []).filter((a) => !a.isPlaceResponsible);
    setResourceSelections({});

    if (!placeValue) {
      setValues((prev) => ({
        ...prev,
        eventPlace: null,
        approvers: renumber(manualApprovers),
      }));
      return;
    }

    setValues((prev) => ({ ...prev, eventPlace: placeValue }));
    setLoadingApprovers(true);

    try {
      const data = await getResponsiblePerson(placeValue);
      if (data?.responsiblePersonName) {
        setValues((prev) => ({
          ...prev,
          approvers: renumber([
            {
              role: data.responsiblePersonName,
              userId: data.responsiblePersonRegNumber,
              name: data.responsiblePersonRegNumber,
              displayName: data.responsiblePersonName,
              isPlaceResponsible: true,
            },
            ...manualApprovers,
          ]),
        }));
      } else {
        setValues((prev) => ({ ...prev, approvers: renumber(manualApprovers) }));
      }
    } catch (err) {
      console.error("Responsible person error:", err);
      setValues((prev) => ({ ...prev, approvers: renumber(manualApprovers) }));
    } finally {
      setLoadingApprovers(false);
    }
  };

  const placeResponsibleEntry = (values.approvers || []).find((a) => a.isPlaceResponsible);
  const manualEntries = (values.approvers || []).filter((a) => !a.isPlaceResponsible);
  const pipelinePreview = [
    ...(placeResponsibleEntry
      ? [{ label: placeResponsibleEntry.displayName || placeResponsibleEntry.role, tag: "Venue (TO)" }]
      : []),
    ...distinctResourceApprovers.map((a) => ({ label: a.name, tag: "Resource TO" })),
    ...(seniorTreasurer ? [{ label: seniorTreasurer.name, tag: "Senior Treasurer" }] : []),
    ...manualEntries.map((a) => ({ label: a.displayName || a.role, tag: null })),
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...values,
      resources: selectedResourceItems.map((item) => ({
        resourceId: item.resourceId,
        quantity: item.quantity,
      })),
      generalResources: selectedGeneralResourceItems.map((item) => ({
        resourceId: item.resourceId,
        quantity: item.quantity,
      })),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto theme-bg-surface-muted backdrop-blur-xl border theme-border p-8 rounded-[2rem] space-y-6 theme-text shadow-2xl"
    >
      <div className="flex items-center justify-between border-b theme-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 theme-bg-tint-strong rounded-lg theme-text-primary">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold theme-text leading-none">Letter Request</h2>
            <p className="text-[10px] theme-text-muted uppercase tracking-widest mt-1">create you event approval</p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Event Title</label>
        <input
          name="eventName"
          value={values.eventName}
          onChange={handleChange}
          placeholder="Enter event designation..."
          className="w-full p-4 theme-bg-surface border theme-border rounded-2xl focus:outline-none theme-focus-border transition-all theme-text"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField label="Date" icon={<Calendar size={14} />}>
          <input
            type="date"
            name="eventDate"
            value={values.eventDate}
            onChange={handleChange}
            className="w-full bg-transparent focus:outline-none theme-text"
            required
          />
        </FormField>

        <FormField label="Start" icon={<Clock size={14} />}>
          <input
            type="time"
            name="eventTime"
            value={values.eventTime}
            onChange={handleChange}
            className="w-full bg-transparent focus:outline-none theme-text"
            required
          />
        </FormField>

        <FormField label="End" icon={<Clock size={14} />}>
          <input
            type="time"
            name="eventEndTime"
            value={values.eventEndTime}
            onChange={handleChange}
            className="w-full bg-transparent focus:outline-none theme-text"
            required
          />
        </FormField>

        <FormField label="Venue" icon={<MapPin size={14} />}>
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
        </FormField>
      </div>

      {availableResources.length > 0 && (
        <div className="space-y-3 theme-bg-surface border theme-border rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="theme-text-primary" />
            <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">
              Resources Needed
            </span>
          </div>

          <div className="space-y-2">
            {availableResources.map((resource) => {
              const selection = resourceSelections[resource.id];
              const checked = Boolean(selection?.checked);
              const quantity = selection?.quantity ?? 1;
              const overAvailable = checked && Number(quantity) > (resource.quantity ?? 0);

              return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-1.5 rounded-xl border theme-border theme-bg-surface-muted p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleResource(resource.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-semibold theme-text flex-1">
                      {resource.name}
                    </span>
                    <span className="text-[10px] theme-text-muted uppercase tracking-widest">
                      {resource.quantity} available &middot; {resource.responsiblePersonName || "no TO assigned"}
                    </span>
                    {checked && (
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setResourceQuantity(resource.id, e.target.value)}
                        className="w-20 theme-bg-surface border theme-border rounded-lg px-2 py-1 text-sm text-center theme-text focus:outline-none theme-focus-border"
                      />
                    )}
                  </div>
                  {overAvailable && (
                    <p className="text-[11px] theme-text-warning pl-7">
                      Only {resource.quantity} available at this place — the responsible technical
                      officer will review whether {quantity} can still be provided.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {generalResources.length > 0 && (
        <div className="space-y-3 theme-bg-surface border theme-border rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="theme-text-primary" />
            <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">
              Additional Equipment
            </span>
          </div>
          <p className="text-[11px] theme-text-muted -mt-1">
            Equipment not tied to any place - available regardless of the venue chosen above.
          </p>

          <div className="space-y-2">
            {generalResources.map((resource) => {
              const selection = generalResourceSelections[resource.id];
              const checked = Boolean(selection?.checked);
              const quantity = selection?.quantity ?? 1;
              const overAvailable = checked && Number(quantity) > (resource.quantity ?? 0);

              return (
                <div
                  key={resource.id}
                  className="flex flex-col gap-1.5 rounded-xl border theme-border theme-bg-surface-muted p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => toggleGeneralResource(resource.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-semibold theme-text flex-1">
                      {resource.name}
                    </span>
                    <span className="text-[10px] theme-text-muted uppercase tracking-widest">
                      {resource.quantity} available &middot; {resource.responsiblePersonName || "no TO assigned"}
                    </span>
                    {checked && (
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setGeneralResourceQuantity(resource.id, e.target.value)}
                        className="w-20 theme-bg-surface border theme-border rounded-lg px-2 py-1 text-sm text-center theme-text focus:outline-none theme-focus-border"
                      />
                    )}
                  </div>
                  {overAvailable && (
                    <p className="text-[11px] theme-text-warning pl-7">
                      Only {resource.quantity} available — the responsible technical officer will
                      review whether {quantity} can still be provided.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Description</label>
        <div className="relative">
          <AlignLeft className="absolute left-4 top-4 theme-text-muted" size={18} />
          <textarea
            name="description"
            rows="3"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe the scope of the event..."
            className="w-full p-4 pl-12 theme-bg-surface border theme-border rounded-2xl focus:outline-none theme-focus-border transition-all theme-text resize-none"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">Documentation (PDF)</label>
        <div className="border-2 border-dashed theme-border theme-hover-border-primary rounded-2xl p-4 transition-all theme-bg-surface group text-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest theme-file-input-soft   theme-text-muted text-sm w-full"
          />
        </div>
      </div>

      <div className="theme-bg-surface border theme-border rounded-2xl overflow-hidden shadow-inner">
        <div className="p-4 border-b theme-border flex justify-between items-center theme-bg-surface-muted">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">Approval Pipeline</span>
            
          </div>
          {loadingApprovers && (
            <div className="flex items-center gap-2 theme-text-primary animate-pulse text-[10px] font-bold">
              <Loader2 size={12} className="animate-spin" /> SYNCHRONIZING
            </div>
          )}
        </div>
        {pipelinePreview.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pt-4">
            {pipelinePreview.map((p, i) => (
              <div
                key={`${p.label}-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full theme-bg-tint-strong border theme-border-primary text-xs font-bold theme-text"
              >
                <span className="theme-text-primary">{i + 1}</span>
                <span>{p.label}</span>
                {p.tag && (
                  <span className="text-[9px] uppercase tracking-widest theme-text-muted">{p.tag}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="p-4 min-h-[100px]">
          <ApproversSection
            approvers={values.approvers || []}
            setValues={setValues}
            roleMap={roleMap}
            seniorTreasurer={seniorTreasurer}
            resourceApprovers={distinctResourceApprovers}
          />
        </div>
      </div>

      <button 
        type="submit"
        className="w-full theme-bg-primary theme-hover-bg-primary theme-text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl theme-shadow transition-all active:scale-[0.98]"
      >
        <Send size={18} />
        Send Request
      </button>
    </form>
  );
}

function FormField({ label, icon, children }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-black theme-text-muted uppercase tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-2 p-3 theme-bg-surface border theme-border rounded-2xl theme-focus-border transition-all">
        <div className="theme-text-muted shrink-0">{icon}</div>
        <div className="text-sm w-full">{children}</div>
      </div>
    </div>
  );
}

export default EventForm;

import { useEffect, useMemo, useRef, useState } from "react";
import ApproversSection from "./ApproversSection";
import { getResponsiblePerson, getMySeniorTreasurer, getPlaces } from "../api/eventService";
import { getGeneralResources } from "../../equipment/api/equipmentService";
import { Calendar, Clock, MapPin, AlignLeft, FileText, Send, Loader2, Wrench, Plus, X } from "lucide-react";

// The real approval order the backend builds (LetterService#buildAndSaveSteps): the venue's
// responsible person (TO) leads when a venue is requested, the senior treasurer always signs
// next, then the manually-added approvers in the order they were added.
const renumber = (list) => list.map((a, i) => ({ ...a, order: i + 1 }));

function EventForm({ values, setValues, setFile, roleMap, places = [], generalResources = [], onSubmit }) {
  const [loadingApprovers, setLoadingApprovers] = useState(false);
  const [seniorTreasurer, setSeniorTreasurer] = useState(null);
  const [addedPlaceResources, setAddedPlaceResources] = useState([]);
  const [addedGeneralResources, setAddedGeneralResources] = useState([]);
  const [placePicker, setPlacePicker] = useState({ resourceId: "", quantity: 1 });
  const [generalPicker, setGeneralPicker] = useState({ resourceId: "", quantity: 1 });
  // Re-fetched with the current date/time whenever all three are filled in, so equipment already
  // committed to another event at an overlapping slot (even at a different venue) shows reduced -
  // or fully booked - instead of the raw total. Null until fetched; falls back to the plain
  // (unscoped) `places`/`generalResources` props until then.
  const [liveSlotPlaces, setLiveSlotPlaces] = useState(null);
  const [liveGeneralResources, setLiveGeneralResources] = useState(null);
  const fileInputRef = useRef(null);

  const hasFullSlot = Boolean(values.eventDate && values.eventTime && values.eventEndTime);

  useEffect(() => {
    if (!hasFullSlot) {
      setLiveSlotPlaces(null);
      setLiveGeneralResources(null);
      return;
    }

    let cancelled = false;
    const slot = { eventDate: values.eventDate, startTime: values.eventTime, endTime: values.eventEndTime };

    getPlaces(slot)
      .then((data) => { if (!cancelled) setLiveSlotPlaces(Array.isArray(data) ? data : []); })
      .catch((err) => {
        console.error("Live places availability error:", err);
        if (!cancelled) setLiveSlotPlaces(null);
      });

    getGeneralResources(slot)
      .then((data) => { if (!cancelled) setLiveGeneralResources(Array.isArray(data) ? data : []); })
      .catch((err) => {
        console.error("Live equipment availability error:", err);
        if (!cancelled) setLiveGeneralResources(null);
      });

    return () => { cancelled = true; };
  }, [hasFullSlot, values.eventDate, values.eventTime, values.eventEndTime]);

  const selectedPlace = useMemo(
    () => places.find((p) => p.placeName === values.eventPlace) || null,
    [places, values.eventPlace]
  );
  const liveSelectedPlace = useMemo(
    () => liveSlotPlaces?.find((p) => p.placeName === values.eventPlace) || null,
    [liveSlotPlaces, values.eventPlace]
  );
  const availablePlaceResources = (hasFullSlot && liveSelectedPlace ? liveSelectedPlace.resources : selectedPlace?.resources) || [];
  const availableGeneralResources = (hasFullSlot && liveGeneralResources ? liveGeneralResources : generalResources) || [];

  const toResourceItem = (item) => ({
    resourceId: item.resourceId,
    quantity: item.quantity,
    name: item.name,
    available: item.remainingAtPick,
    responsiblePersonRegNumber: item.responsiblePersonRegNumber,
    responsiblePersonName: item.responsiblePersonName,
  });
  const selectedResourceItems = addedPlaceResources.map(toResourceItem);
  const selectedGeneralResourceItems = addedGeneralResources.map(toResourceItem);

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

  const addResourceFrom = (items, picker, setPicker, setAdded) => {
    const resource = items.find((r) => String(r.id) === String(picker.resourceId));
    if (!resource) return;
    const quantity = Math.max(1, Number(picker.quantity) || 1);
    const remaining = resource.remainingQuantity ?? resource.quantity ?? 0;
    if (quantity > remaining) return;

    setAdded((prev) => {
      if (prev.some((p) => p.resourceId === resource.id)) return prev;
      return [
        ...prev,
        {
          resourceId: resource.id,
          name: resource.name,
          quantity,
          remainingAtPick: remaining,
          pendingElsewhere: resource.pendingElsewhere || 0,
          responsiblePersonRegNumber: resource.responsiblePersonRegNumber,
          responsiblePersonName: resource.responsiblePersonName,
        },
      ];
    });
    setPicker({ resourceId: "", quantity: 1 });
  };

  const addPlaceResource = () => addResourceFrom(availablePlaceResources, placePicker, setPlacePicker, setAddedPlaceResources);
  const addGeneralResource = () => addResourceFrom(availableGeneralResources, generalPicker, setGeneralPicker, setAddedGeneralResources);
  const removePlaceResource = (resourceId) =>
    setAddedPlaceResources((prev) => prev.filter((p) => p.resourceId !== resourceId));
  const removeGeneralResource = (resourceId) =>
    setAddedGeneralResources((prev) => prev.filter((p) => p.resourceId !== resourceId));

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
    setAddedPlaceResources([]);
    setPlacePicker({ resourceId: "", quantity: 1 });

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

      {availablePlaceResources.length > 0 && (
        <ResourcePicker
          title="Resources Needed"
          items={availablePlaceResources}
          addedItems={addedPlaceResources}
          picker={placePicker}
          setPicker={setPlacePicker}
          onAdd={addPlaceResource}
          onRemove={removePlaceResource}
          hasFullSlot={hasFullSlot}
        />
      )}

      {availableGeneralResources.length > 0 && (
        <ResourcePicker
          title="Additional Equipment"
          hint="Equipment not tied to any place - available regardless of the venue chosen above."
          items={availableGeneralResources}
          addedItems={addedGeneralResources}
          picker={generalPicker}
          setPicker={setGeneralPicker}
          onAdd={addGeneralResource}
          onRemove={removeGeneralResource}
          hasFullSlot={hasFullSlot}
        />
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

// Pick one item from a select (showing live remaining stock for the chosen date/time), enter a
// quantity, Add it to a running list. Shared between place-bound resources and standalone
// equipment - only the source list/handlers differ.
function ResourcePicker({ title, hint, items, addedItems, picker, setPicker, onAdd, onRemove, hasFullSlot }) {
  const pickedResource = items.find((r) => String(r.id) === String(picker.resourceId));
  const remaining = pickedResource ? (pickedResource.remainingQuantity ?? pickedResource.quantity ?? 0) : 0;
  const alreadyAdded = Boolean(pickedResource) && addedItems.some((a) => a.resourceId === pickedResource.id);
  const quantity = Math.max(1, Number(picker.quantity) || 1);
  const overAvailable = Boolean(pickedResource) && quantity > remaining;
  const canAdd = Boolean(pickedResource) && !alreadyAdded && !overAvailable && remaining > 0;
  const contested = Boolean(pickedResource) && (pickedResource.pendingElsewhere || 0) > 0;

  return (
    <div className="space-y-3 theme-bg-surface border theme-border rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <Wrench size={14} className="theme-text-primary" />
        <span className="text-[10px] font-black theme-text-muted uppercase tracking-[0.2em]">{title}</span>
      </div>
      {hint && <p className="text-[11px] theme-text-muted -mt-1">{hint}</p>}
      {!hasFullSlot && (
        <p className="text-[11px] theme-text-warning -mt-1">
          Set the event date, start and end time to see live availability for this slot.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={picker.resourceId}
          onChange={(e) => setPicker((prev) => ({ ...prev, resourceId: e.target.value }))}
          className="flex-1 min-w-[180px] theme-bg-surface-muted border theme-border rounded-lg px-3 py-2 text-sm theme-text focus:outline-none theme-focus-border"
        >
          <option value="">Select equipment...</option>
          {items.map((r) => {
            const rem = r.remainingQuantity ?? r.quantity ?? 0;
            const taken = addedItems.some((a) => a.resourceId === r.id);
            const alsoPending = (r.pendingElsewhere || 0) > 0;
            const statusLabel = taken
              ? "already added"
              : rem <= 0
              ? "fully booked for this slot"
              : `${rem} free${alsoPending ? ", also pending elsewhere" : ""}`;
            return (
              <option key={r.id} value={r.id} disabled={rem <= 0 || taken}>
                {r.name} ({statusLabel})
              </option>
            );
          })}
        </select>
        <input
          type="number"
          min="1"
          value={picker.quantity}
          onChange={(e) => setPicker((prev) => ({ ...prev, quantity: e.target.value }))}
          className="w-20 theme-bg-surface-muted border theme-border rounded-lg px-2 py-2 text-sm text-center theme-text focus:outline-none theme-focus-border"
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg theme-bg-primary theme-hover-bg-primary theme-text-on-primary text-xs font-bold uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {pickedResource && overAvailable && (
        <p className="text-[11px] theme-text-danger">
          Only {remaining} "{pickedResource.name}" left for this date/time - the rest is already
          committed to another event.
        </p>
      )}

      {pickedResource && !overAvailable && contested && (
        <p className="text-[11px] theme-text-warning">
          ⚠ Your selected equipment is also in the pending process of another event for this same
          date/time ({pickedResource.pendingElsewhere} unit{pickedResource.pendingElsewhere === 1 ? "" : "s"}
          {" "}requested there too) - be aware whichever gets approved first will claim it.
        </p>
      )}

      {addedItems.length > 0 && (
        <div className="space-y-2 pt-1">
          {addedItems.map((item) => (
            <div
              key={item.resourceId}
              className="flex items-center justify-between rounded-xl border theme-border theme-bg-surface-muted p-3"
            >
              <div>
                <span className="text-sm font-semibold theme-text">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-[10px] theme-text-muted uppercase tracking-widest block">
                  {item.responsiblePersonName || "no TO assigned"}
                </span>
                {item.pendingElsewhere > 0 && (
                  <span className="text-[10px] theme-text-warning block mt-0.5">
                    ⚠ Also pending elsewhere for this slot - not locked in until your TO approves it first
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.resourceId)}
                className="theme-text-muted theme-hover-text transition p-1"
                aria-label={`Remove ${item.name}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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

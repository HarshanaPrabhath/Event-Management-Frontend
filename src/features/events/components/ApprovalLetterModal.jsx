import { useEffect, useRef, useState } from "react";
import {
  X,
  PenTool,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  CalendarClock,
  MapPin,
  Upload,
  Eraser,
  Check,
} from "lucide-react";
import ApprovalPdfPreview from "./ApprovalPdfPreview";

// The signature pad is always rendered on a white surface and the signature is later stamped
// onto a white PDF, so the ink must stay dark regardless of the active (light/dark) theme.
const SIGNATURE_INK = "#0f172a";

const ApprovalLetterModal = ({
  pdfUrl,
  remark,
  signatureUrl,
  signatureSource,
  signaturePosition,
  bookingConflict,
  requiresSignature = true,
  loading,
  onRemarkChange,
  onSignatureChange,
  onSelectSignaturePosition,
  onClose,
  onConfirm,
}) => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const fileInputRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [activeSignatureTab, setActiveSignatureTab] = useState("upload");

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    // Keep the drawing transparent so the exported PNG overlays cleanly onto the PDF; the white
    // backdrop the user sees comes from the canvas' CSS background.
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = SIGNATURE_INK;
    ctx.lineWidth = 2.2;
  };

  useEffect(() => {
    if (activeSignatureTab === "draw") {
      // Wait a frame so the freshly-shown canvas has its final layout size before we size the bitmap.
      const raf = window.requestAnimationFrame(initCanvas);
      return () => window.cancelAnimationFrame(raf);
    }
  }, [activeSignatureTab]);

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDraw = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    drawingRef.current = true;
    canvas.setPointerCapture?.(event.pointerId);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    event.preventDefault();
  };

  const draw = (event) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setHasInk(true);
    event.preventDefault();
  };

  const stopDraw = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    event.preventDefault();
  };

  const clearDrawingPad = () => {
    initCanvas();
    setHasInk(false);
  };

  const useDrawingAsSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) {
      alert("Please draw your signature first.");
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    onSignatureChange?.({ dataUrl, source: "draw" });
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  const convertImageFileToPngDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const rawDataUrl = typeof reader.result === "string" ? reader.result : null;
        if (!rawDataUrl) {
          reject(new Error("Unable to read signature file"));
          return;
        }

        const image = new Image();
        image.onload = () => {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = Math.max(1, image.naturalWidth || image.width);
          tempCanvas.height = Math.max(1, image.naturalHeight || image.height);

          const context = tempCanvas.getContext("2d");
          if (!context) {
            reject(new Error("Unable to process signature image"));
            return;
          }

          context.drawImage(image, 0, 0);
          resolve(tempCanvas.toDataURL("image/png"));
        };
        image.onerror = () => reject(new Error("Invalid signature image"));
        image.src = rawDataUrl;
      };

      reader.onerror = () => reject(new Error("Unable to read signature file"));
      reader.readAsDataURL(file);
    });

  const onUploadSignature = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await convertImageFileToPngDataUrl(file);
      onSignatureChange?.({ dataUrl, source: "upload" });
    } catch (error) {
      console.error(error);
      alert("Could not process signature image. Please try another file.");
    }

    event.target.value = "";
  };

  const clearAttachedSignature = () => {
    onSignatureChange?.({ dataUrl: null, source: null });
  };

  const canPlaceSignature = requiresSignature && Boolean(signatureUrl);
  const conflicts = Array.isArray(bookingConflict?.conflicts)
    ? bookingConflict.conflicts
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 theme-modal-backdrop transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative theme-bg-page border theme-border w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b theme-border">
          <div className="flex items-center gap-3">
            <div className="p-2 theme-bg-tint-strong rounded-lg">
              <ShieldCheck className="theme-text-primary" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold theme-text tracking-tight">Authorize Document</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 theme-hover-bg rounded-full theme-text-muted theme-hover-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Side: PDF Preview (8 cols) */}
          <div className="lg:col-span-8 p-6 theme-bg-surface border-r theme-border overflow-y-auto">
            <div className="mb-4 flex items-center justify-between px-2">
              <span className="text-[10px] font-black theme-text-muted uppercase tracking-widest">Document Workspace</span>
              {canPlaceSignature && !signaturePosition && (
                <span className="text-[10px] theme-text-warning font-bold animate-pulse flex items-center gap-1">
                  <AlertCircle size={12} /> Click on the page to place signature
                </span>
              )}
            </div>
            <div className="rounded-2xl overflow-hidden border theme-border shadow-inner">
              <ApprovalPdfPreview
                pdfUrl={pdfUrl}
                signatureImageUrl={canPlaceSignature ? signatureUrl : null}
                signaturePosition={canPlaceSignature ? signaturePosition : null}
                onSelectSignaturePosition={canPlaceSignature ? onSelectSignaturePosition : undefined}
                heightClass="h-[550px]"
              />
            </div>
          </div>

          {/* Right Side: Approval Controls (4 cols) */}
          <div className="lg:col-span-4 p-8 flex flex-col theme-bg-page overflow-y-auto">
            <div className="space-y-8 flex-1">
              {bookingConflict?.conflict && (
                <section className="space-y-3 rounded-xl border theme-border-warning theme-bg-warning-soft p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 shrink-0 theme-text-warning" size={18} />
                    <div>
                      <h3 className="text-sm font-bold theme-text-warning">Place Already Booked</h3>
                      <p className="mt-1 text-xs leading-relaxed theme-text-warning">
                        {bookingConflict.message || "This place already has another event at the selected date and time."}
                      </p>
                    </div>
                  </div>

                  {conflicts.length > 0 && (
                    <div className="space-y-2">
                      {conflicts.map((conflict) => (
                        <div
                          key={`${conflict.calendarEventId || conflict.letterId}-${conflict.eventDate}-${conflict.eventTime}`}
                          className="rounded-lg border theme-border-warning theme-bg-surface p-3"
                        >
                          <p className="text-xs font-bold theme-text">{conflict.title || "Existing booking"}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] theme-text">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock size={12} className="theme-text-warning" />
                              {conflict.eventDate} {conflict.eventTime?.slice(0, 5)} - {conflict.endTime?.slice(0, 5)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={12} className="theme-text-warning" />
                              {conflict.placeName || "Same place"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
              
              {requiresSignature && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 theme-text">
                    <PenTool size={16} className="theme-text-primary" />
                    <h3 className="text-sm font-bold">Your Digital Signature</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border theme-border theme-bg-surface-muted p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSignatureTab("upload");
                        setHasInk(false);
                      }}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeSignatureTab === "upload"
                          ? "theme-bg-primary theme-text-on-primary"
                          : "theme-text theme-hover-bg"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <Upload size={13} />
                        Upload
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSignatureTab("draw");
                        setHasInk(false);
                      }}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeSignatureTab === "draw"
                          ? "theme-bg-primary theme-text-on-primary"
                          : "theme-text theme-hover-bg"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <PenTool size={13} />
                        Draw
                      </span>
                    </button>
                  </div>

                  {activeSignatureTab === "upload" ? (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onUploadSignature}
                      />
                      <button
                        type="button"
                        onClick={triggerFilePicker}
                        className="w-full rounded-xl border theme-border-strong theme-bg-surface-muted px-3 py-3 text-sm font-medium theme-text theme-hover-bg transition"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Upload size={14} />
                          Attach Signature Image
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="rounded-xl border theme-border theme-bg-surface-muted p-2">
                        <canvas
                          ref={canvasRef}
                          className="h-36 w-full touch-none rounded-lg theme-signature-surface"
                          onPointerDown={startDraw}
                          onPointerMove={draw}
                          onPointerUp={stopDraw}
                          onPointerLeave={stopDraw}
                          onPointerCancel={stopDraw}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={useDrawingAsSignature}
                          className="flex-1 rounded-xl theme-bg-primary px-3 py-2 text-xs font-bold theme-text-on-primary theme-hover-bg-primary transition"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Check size={13} />
                            Use Drawing
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={clearDrawingPad}
                          className="rounded-xl border theme-border-strong px-3 py-2 text-xs font-semibold theme-text theme-hover-bg transition"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Eraser size={13} />
                            Clear Pad
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {signatureUrl ? (
                    <div className="space-y-2">
                      <div className="relative theme-signature-surface h-28 rounded-xl p-4 flex items-center justify-center border theme-border">
                        <img src={signatureUrl} alt="signature" className="max-h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="theme-text-primary font-semibold">
                          Attached: {signatureSource === "draw" ? "Drawing" : "Uploaded image"}
                        </span>
                        <button
                          type="button"
                          onClick={clearAttachedSignature}
                          className="theme-text-muted theme-hover-text transition"
                        >
                          Clear attached
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-14 rounded-xl border border-dashed theme-border flex items-center justify-center text-xs theme-text-muted">
                      No signature attached yet
                    </div>
                  )}
                </section>
              )}

              {/* Remarks Section */}
              <section className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-center gap-2 theme-text">
                  <MessageSquare size={16} className="theme-text-primary" />
                  <h3 className="text-sm font-bold">Additional Description</h3>
                </div>
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={remark}
                    onChange={(e) => onRemarkChange(e.target.value)}
                    placeholder="Add a reason or instruction for this approval..."
                    className="w-full flex-1 p-4 rounded-xl theme-bg-surface-muted border theme-border theme-text text-sm focus:outline-none focus:ring-2 theme-focus-ring theme-focus-border transition-all theme-placeholder resize-none min-h-[120px]"
                  />
                </div>
              </section>
            </div>

            {/* Bottom Actions */}
            <div className="pt-8 flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={loading || (requiresSignature && (!signaturePosition || !signatureUrl))}
                className="w-full py-4 theme-bg-success-solid theme-hover-bg-success-solid theme-disabled-bg theme-disabled-text theme-text-on-primary rounded-xl font-bold transition-all shadow-lg theme-shadow active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 theme-border border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Approve Confirm"
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-3 theme-text-muted theme-hover-text font-medium text-sm transition-colors"
              >
                Cancel and return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalLetterModal;

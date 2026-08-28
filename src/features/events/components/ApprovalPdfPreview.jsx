import { useCallback, useEffect, useRef, useState } from "react";
import PdfViewer from "../../../shared/ui/PdfViewer";

// Signature box size, expressed as a fraction of the page so it stays stable at any zoom level.
const SIGNATURE_WIDTH_RATIO = 0.24;
const SIGNATURE_ASPECT = 3; // width : height

const getPageIndex = (pageLayer) => {
  const testId = pageLayer.getAttribute("data-testid") || "";
  const match = testId.match(/core__page-layer-(\d+)/);

  return match ? Number(match[1]) : 0;
};

const findPageLayerAtPoint = (container, clientX, clientY) => {
  const pageLayers = Array.from(
    container.querySelectorAll(".rpv-core__page-layer")
  );

  return pageLayers.find((pageLayer) => {
    const rect = pageLayer.getBoundingClientRect();

    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  });
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const ApprovalPdfPreview = ({
  pdfUrl,
  signatureImageUrl,
  signaturePosition,
  onSelectSignaturePosition,
  heightClass = "h-[500px]",
}) => {
  const containerRef = useRef(null);
  const [overlayStyle, setOverlayStyle] = useState(null);

  // The whole placement pipeline works in normalized page coordinates (0..1, TOP_LEFT origin),
  // which are independent of the viewer's zoom level. The backend resolves them against the real
  // PDF media box, so the on-screen overlay below and the stamped signature always line up.
  const updateOverlayStyle = useCallback(() => {
    const container = containerRef.current;

    if (!container || !signaturePosition) {
      setOverlayStyle(null);
      return;
    }

    const pageLayer = container.querySelector(
      `[data-testid="core__page-layer-${signaturePosition.pageIndex}"]`
    );

    if (!pageLayer) {
      setOverlayStyle(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const pageRect = pageLayer.getBoundingClientRect();

    setOverlayStyle({
      left: pageRect.left - containerRect.left + signaturePosition.nx * pageRect.width,
      top: pageRect.top - containerRect.top + signaturePosition.ny * pageRect.height,
      width: signaturePosition.nw * pageRect.width,
      height: signaturePosition.nh * pageRect.height,
    });
  }, [signaturePosition]);

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(updateOverlayStyle);

    const container = containerRef.current;
    if (!container) {
      return () => window.cancelAnimationFrame(animationFrame);
    }

    const scrollParent = container.querySelector(".rpv-core__inner-pages");
    const resizeObserver = new ResizeObserver(updateOverlayStyle);

    resizeObserver.observe(container);
    if (scrollParent) {
      scrollParent.addEventListener("scroll", updateOverlayStyle);
    }
    window.addEventListener("resize", updateOverlayStyle);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", updateOverlayStyle);
      }
      window.removeEventListener("resize", updateOverlayStyle);
    };
  }, [updateOverlayStyle]);

  const handleClick = (event) => {
    if (!onSelectSignaturePosition || !containerRef.current) return;

    const pageLayer = findPageLayerAtPoint(
      containerRef.current,
      event.clientX,
      event.clientY
    );

    if (!pageLayer) return;

    const pageRect = pageLayer.getBoundingClientRect();
    if (pageRect.width <= 0 || pageRect.height <= 0) return;

    const nw = SIGNATURE_WIDTH_RATIO;
    // Keep the box aspect ratio constant on screen: its height as a fraction of page height
    // depends on the page's own aspect ratio.
    const nh = (SIGNATURE_WIDTH_RATIO / SIGNATURE_ASPECT) * (pageRect.width / pageRect.height);

    // Anchor the click at the centre of the signature box, then keep the box on the page.
    const nx = clamp(
      (event.clientX - pageRect.left) / pageRect.width - nw / 2,
      0,
      1 - nw
    );
    const ny = clamp(
      (event.clientY - pageRect.top) / pageRect.height - nh / 2,
      0,
      1 - nh
    );

    onSelectSignaturePosition({
      pageIndex: getPageIndex(pageLayer),
      nx: Number(nx.toFixed(4)),
      ny: Number(ny.toFixed(4)),
      nw: Number(nw.toFixed(4)),
      nh: Number(nh.toFixed(4)),
      origin: "TOP_LEFT",
    });
  };

  return (
    <div
      ref={containerRef}
      className={`${heightClass} theme-bg-overlay rounded-2xl relative overflow-hidden ${
        onSelectSignaturePosition ? "cursor-crosshair" : ""
      }`}
      onClick={handleClick}
    >
      {pdfUrl && <PdfViewer fileUrl={pdfUrl} />}

      {overlayStyle && (
        <div
          className={`theme-signature-overlay ${
            signatureImageUrl
              ? "theme-signature-overlay-image"
              : "theme-signature-overlay-empty"
          }`}
          style={{
            position: "absolute",
            ...overlayStyle,
          }}
        >
          {signatureImageUrl ? (
            <img
              src={signatureImageUrl}
              alt="Signature preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="theme-signature-placeholder">SIGN HERE</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalPdfPreview;

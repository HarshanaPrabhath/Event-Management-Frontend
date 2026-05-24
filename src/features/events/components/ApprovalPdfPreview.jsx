import { useCallback, useEffect, useRef, useState } from "react";
import PdfViewer from "../../../shared/ui/PdfViewer";

const SIGNATURE_WIDTH = 150;
const SIGNATURE_HEIGHT = 50;

const getPageIndex = (pageLayer) => {
  const testId = pageLayer.getAttribute("data-testid") || "";
  const match = testId.match(/core__page-layer-(\d+)/);

  return match ? Number(match[1]) : 0;
};

const getPageScale = (pageLayer) => {
  const scale = Number.parseFloat(
    window.getComputedStyle(pageLayer).getPropertyValue("--scale-factor")
  );

  return Number.isFinite(scale) && scale > 0 ? scale : 1;
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

    const scale = getPageScale(pageLayer);
    const containerRect = container.getBoundingClientRect();
    const pageRect = pageLayer.getBoundingClientRect();

    setOverlayStyle({
      left: pageRect.left - containerRect.left + signaturePosition.x * scale,
      top: pageRect.top - containerRect.top + signaturePosition.y * scale,
      width: signaturePosition.width * scale,
      height: signaturePosition.height * scale,
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
    const scale = getPageScale(pageLayer);
    const pageWidth = pageRect.width / scale;
    const pageHeight = pageRect.height / scale;
    const maxX = pageWidth - SIGNATURE_WIDTH;
    const maxY = pageHeight - SIGNATURE_HEIGHT;
    const x = clamp((event.clientX - pageRect.left) / scale, 0, maxX);
    const y = clamp((event.clientY - pageRect.top) / scale, 0, maxY);
    const nx = pageWidth > 0 ? x / pageWidth : 0;
    const ny = pageHeight > 0 ? y / pageHeight : 0;
    const nw = pageWidth > 0 ? SIGNATURE_WIDTH / pageWidth : 0;
    const nh = pageHeight > 0 ? SIGNATURE_HEIGHT / pageHeight : 0;

    onSelectSignaturePosition({
      pageIndex: getPageIndex(pageLayer),
      x: Math.round(x),
      y: Math.round(y),
      width: SIGNATURE_WIDTH,
      height: SIGNATURE_HEIGHT,
      pageWidth: Math.round(pageWidth),
      pageHeight: Math.round(pageHeight),
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
          style={{
            position: "absolute",
            ...overlayStyle,
            border: "2px solid var(--theme-primary)",
            background: signatureImageUrl ? "var(--theme-signature-surface)" : "var(--theme-tint-strong)",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            zIndex: 10,
          }}
        >
          {signatureImageUrl ? (
            <img
              src={signatureImageUrl}
              alt="Signature preview"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: "10px", color: "var(--theme-primary)", fontWeight: "bold" }}>SIGN HERE</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalPdfPreview;

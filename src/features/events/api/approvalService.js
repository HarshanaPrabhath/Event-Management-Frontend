import apiClient from "../../../shared/api/client";

export const getLettersToApprove = () =>
  apiClient.get("/letter/to-approve");

export const rejectLetter = (id, reason) =>
  apiClient.post(`/letter/${id}/reject`, {
    reason,
    remarks: reason,
    rejectionReason: reason,
  });

export const getMySignature = () =>
  apiClient.get("/signature/me");

export const uploadMySignature = (formData) =>
  apiClient.post("/signature/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const saveMyDrawnSignature = (payload) =>
  apiClient.post("/signature/me/drawn", payload);

const resolveNormalized = (value, absolute, total) => {
  if (Number.isFinite(value)) return value;
  if (!Number.isFinite(total) || total <= 0) return 0;
  return absolute / total;
};

const toPngSignatureFile = async (signatureImageDataUrl) => {
  const response = await fetch(signatureImageDataUrl);
  const blob = await response.blob();
  return new File([blob], "signature.png", { type: "image/png" });
};

export const signApproveLetter = async (id, payload) => {
  const signatureImageDataUrl = payload?.signatureImageDataUrl;
  const signature = payload?.signature || {};

  if (!signatureImageDataUrl) {
    throw new Error("Signature image is required");
  }

  const {
    pageIndex = 0,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    pageWidth,
    pageHeight,
    nx,
    ny,
    nw,
    nh,
    origin = "TOP_LEFT",
  } = signature;

  const formData = new FormData();
  formData.append("signature", await toPngSignatureFile(signatureImageDataUrl));
  formData.append("pageIndex", String(pageIndex));
  formData.append("x", String(x));
  formData.append("y", String(y));
  formData.append("width", String(width));
  formData.append("height", String(height));
  formData.append("nx", String(resolveNormalized(nx, x, pageWidth)));
  formData.append("ny", String(resolveNormalized(ny, y, pageHeight)));
  formData.append("nw", String(resolveNormalized(nw, width, pageWidth)));
  formData.append("nh", String(resolveNormalized(nh, height, pageHeight)));
  formData.append("origin", origin);
  formData.append("remarks", payload?.remarks || "Approved and digitally signed");

  return apiClient.post(`/letter/${id}/sign-approve`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const approveLetter = (id, payload) =>
  apiClient.post(`/letter/${id}/approve`, payload);

export const getApprovedByMe = () =>
  apiClient.get("/letter/approved-by-me");

export const getRejectedByMe = () =>
  apiClient.get("/letter/rejected-by-me");

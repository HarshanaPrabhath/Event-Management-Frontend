import apiClient from "../../../shared/api/client";

export const getLettersToApprove = () =>
  apiClient.get("/letter/to-approve");

export const rejectLetter = (id, reason) =>
  apiClient.post(`/letter/${id}/reject`, {
    reason,
    remarks: reason,
    rejectionReason: reason,
  });

// Senior treasurer sends a bounced letter (a downstream approver rejected it) back to the club
// secretary instead of re-forwarding it down the chain again.
export const returnLetterToSecretary = (id, reason) =>
  apiClient.post(`/letter/${id}/return-to-secretary`, {
    remarks: reason,
    rejectionReason: reason,
  });

export const getMySignature = () =>
  apiClient.get("/signature/me");

export const uploadMySignature = (formData) =>
  apiClient.post("/signature/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

const toPngSignatureFile = async (signatureImageDataUrl) => {
  const response = await fetch(signatureImageDataUrl);
  const blob = await response.blob();
  return new File([blob], "signature.png", { type: "image/png" });
};

// Backend only exposes a single multipart signature upload (POST /signature/me) — there is no
// separate "/signature/me/drawn" endpoint. Reuse that endpoint for a canvas-drawn (data URL) signature.
export const saveMyDrawnSignature = async (signatureImageDataUrl) => {
  const formData = new FormData();
  formData.append("signature", await toPngSignatureFile(signatureImageDataUrl));
  return uploadMySignature(formData);
};

export const signApproveLetter = async (id, payload) => {
  const signatureImageDataUrl = payload?.signatureImageDataUrl;
  const signature = payload?.signature || {};

  if (!signatureImageDataUrl) {
    throw new Error("Signature image is required");
  }

  const { pageIndex = 0, nx, ny, nw, nh, origin = "TOP_LEFT" } = signature;

  if (![nx, ny, nw, nh].every((value) => Number.isFinite(value))) {
    throw new Error("Select where the signature should appear on the letter");
  }

  // Send only normalized (0..1) coordinates so placement is independent of the on-screen zoom.
  // The backend uses nx/ny/nw/nh whenever the absolute x/y/width/height are absent.
  const formData = new FormData();
  formData.append("signature", await toPngSignatureFile(signatureImageDataUrl));
  formData.append("pageIndex", String(pageIndex));
  formData.append("nx", String(nx));
  formData.append("ny", String(ny));
  formData.append("nw", String(nw));
  formData.append("nh", String(nh));
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

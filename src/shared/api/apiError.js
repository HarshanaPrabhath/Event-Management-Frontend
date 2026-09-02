// Normalizes the several error-body shapes the backend can return into a single
// human-readable string.
//
// Backend shapes (see MyGlobalExceptionHandler):
//  - ApiException / Forbidden / NotFound / ...:  { message: string, status: false }
//  - Bean validation (MethodArgumentNotValidException): flat map { field: message, ... }
//  - CalendarConflictException:                  { conflict: true, message, conflicts: [] }
export const getApiErrorMessage = (err, fallback = "Something went wrong") => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // Bean-validation map: join every "field: message" pair.
    const fieldMessages = Object.entries(data)
      .filter(([, value]) => typeof value === "string" && value.trim())
      .map(([field, value]) => `${field}: ${value}`);

    if (fieldMessages.length > 0) {
      return fieldMessages.join("\n");
    }
  }

  return err?.message || fallback;
};

import { buildServerFileUrl } from "../../../shared/api/fileUrl";

export function normalizeNamedMember(member, roleKey = "position") {
  return {
    [roleKey]: (member?.[roleKey] || "").toString(),
    name: (member?.name || "").toString(),
  };
}

export function parseNamedList(value, roleKey = "position") {
  if (Array.isArray(value)) {
    return value
      .map((member) => normalizeNamedMember(member, roleKey))
      .filter((member) => member[roleKey] || member.name);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((member) => normalizeNamedMember(member, roleKey))
          .filter((member) => member[roleKey] || member.name);
      }
    } catch {
      return [];
    }
  }

  return [];
}

export function normalizeBoardMember(member) {
  return normalizeNamedMember(member, "position");
}

export function parseExecutiveBoard(value) {
  return parseNamedList(value, "position");
}

export function normalizeClubMember(member) {
  return normalizeNamedMember(member, "role");
}

export function parseMembers(value) {
  return parseNamedList(value, "role");
}

export function resolveImageUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (typeof pathOrUrl === "string" && /^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return buildServerFileUrl(pathOrUrl);
}

export function normalizeClubData(data) {
  const executiveBoardValue = data?.executiveBoardJson ?? data?.executiveBoard ?? [];
  const parsedBoard = parseExecutiveBoard(executiveBoardValue);
  const membersValue = data?.membersJson ?? data?.members ?? [];
  const parsedMembers = parseMembers(membersValue);
  const bgImagePath = data?.bgImageUrl || data?.bgImagePath || data?.backgroundImage || null;

  return {
    vision: data?.vision || "",
    mission: data?.mission || "",
    description: data?.description || "",
    executiveBoardJson: JSON.stringify(parsedBoard),
    executiveBoard: parsedBoard,
    membersJson: JSON.stringify(parsedMembers),
    members: parsedMembers,
    bgImageUrl: resolveImageUrl(bgImagePath),
  };
}

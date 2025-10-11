// src/infrastructure/shared/tokens.ts
export const EMPTY_TOKENS = new Set([
  "", "NINGUNO", "NINGUNA", "NONE", "NA", "N/A",
  "SIN_CONTRAINDICACIONES", "SIN_ALERGENOS"
]);

export const toUpperToken = (s: string) =>
  String(s ?? "").trim().replace(/\s+/g, "_").toUpperCase();

export const cleanTokens = (arr: unknown): string[] => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(x => toUpperToken(String(x ?? "")))
    .filter(t => t && !EMPTY_TOKENS.has(t));
};

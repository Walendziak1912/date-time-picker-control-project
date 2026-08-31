import { parseBackendUtc, serializeBackendUtc } from "./timezone";
import type { DateBoundsRange } from "./fullBounds";

const BACKEND_RANGE_SEPARATOR = " , ";

export function serializeBackendRange(range: DateBoundsRange): string | null {
  if (!range.start || !range.end) {
    return null;
  }
  return `${serializeBackendUtc(range.start)}${BACKEND_RANGE_SEPARATOR}${serializeBackendUtc(range.end)}`;
}

export function parseBackendRange(
  raw: string | null | undefined,
): DateBoundsRange {
  const parts = (raw ?? "").split(",");
  if (parts.length < 2) {
    return { start: null, end: null };
  }

  const toDate = (value?: string): Date | null => {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    const d = parseBackendUtc(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  return { start: toDate(parts[0]), end: toDate(parts[1]) };
}

import type { RefObject } from "react";
import type { DateTimeRangeValidationResult } from "../types";

export function validationResultKey(
  result: DateTimeRangeValidationResult,
): string {
  return `${result.valid}:${result.reason ?? ""}:${result.message ?? ""}`;
}

export function notifyValidationIfChanged(
  result: DateTimeRangeValidationResult,
  lastKeyRef: RefObject<string | null>,
  onValidationChange?: (result: DateTimeRangeValidationResult) => void,
  options?: { force?: boolean },
): void {
  const key = validationResultKey(result);
  if (!options?.force && lastKeyRef.current === key) {
    return;
  }
  lastKeyRef.current = key;
  onValidationChange?.(result);
}

export function shouldShowValidationOnBlur(
  container: HTMLElement,
  graceUntil: number,
): boolean {
  if (Date.now() < graceUntil) {
    return false;
  }
  if (container.querySelector(".dtp[data-open]")) {
    return false;
  }
  const activeElement = document.activeElement;
  if (activeElement && container.contains(activeElement)) {
    return false;
  }
  return true;
}

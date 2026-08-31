import { describe, expect, test, vi } from "vitest";
import {
  notifyValidationIfChanged,
  shouldShowValidationOnBlur,
  validationResultKey,
} from "../../../../shared/components/DateTimeRange/repository/validationNotify";

describe("validationNotify", () => {
  test("validationResultKey zawiera valid, reason i message", () => {
    expect(validationResultKey({ valid: true })).toBe("true::");
    expect(
      validationResultKey({
        valid: false,
        reason: "both-dates-required",
        message: "Wybierz obie daty",
      }),
    ).toBe("false:both-dates-required:Wybierz obie daty");
  });

  test("notifyValidationIfChanged woła callback tylko przy zmianie wyniku", () => {
    const onValidationChange = vi.fn();
    const lastKeyRef = { current: null as string | null };

    const invalid = {
      valid: false,
      reason: "both-dates-required" as const,
      message: "Wybierz obie daty",
    };

    notifyValidationIfChanged(invalid, lastKeyRef, onValidationChange);
    notifyValidationIfChanged(invalid, lastKeyRef, onValidationChange);
    expect(onValidationChange).toHaveBeenCalledTimes(1);
    expect(onValidationChange).toHaveBeenCalledWith(invalid);

    notifyValidationIfChanged({ valid: true }, lastKeyRef, onValidationChange);
    expect(onValidationChange).toHaveBeenCalledTimes(2);
  });

  test("notifyValidationIfChanged z force=true woła callback ponownie dla tego samego wyniku", () => {
    const onValidationChange = vi.fn();
    const lastKeyRef = { current: null as string | null };

    const invalid = {
      valid: false,
      reason: "both-dates-required" as const,
      message: "Wybierz obie daty",
    };

    notifyValidationIfChanged(invalid, lastKeyRef, onValidationChange);
    notifyValidationIfChanged(invalid, lastKeyRef, onValidationChange, {
      force: true,
    });

    expect(onValidationChange).toHaveBeenCalledTimes(2);
  });

  test("shouldShowValidationOnBlur zwraca false w grace period", () => {
    const container = document.createElement("div");

    expect(
      shouldShowValidationOnBlur(container, Date.now() + 10_000),
    ).toBe(false);
  });

  test("shouldShowValidationOnBlur zwraca false gdy picker jest otwarty", () => {
    const container = document.createElement("div");
    const picker = document.createElement("div");
    picker.className = "dtp";
    picker.setAttribute("data-open", "");
    container.appendChild(picker);

    expect(shouldShowValidationOnBlur(container, 0)).toBe(false);
  });

  test("shouldShowValidationOnBlur zwraca true gdy focus opuszcza zakres", () => {
    const container = document.createElement("div");

    expect(shouldShowValidationOnBlur(container, 0)).toBe(true);
  });
});

import { describe, expect, test } from "vitest";
import { DateTimePickerPrecision } from "../../../../shared/components/DateTimePicker";
import {
  resolveFullBounds,
  resolveFullBoundsFields,
  resolveFullBoundsForSingleDate,
} from "../../../../shared/components/DateTimePicker/repository";

describe("resolveFullBounds", () => {
  test("precyzja Date rozszerza pojedynczą datę do pełnej doby UTC", () => {
    const date = new Date("2026-08-06T12:30:00.000Z");
    const bounds = resolveFullBoundsForSingleDate(
      date,
      DateTimePickerPrecision.Date,
    );

    expect(bounds.start!.toISOString()).toBe("2026-08-06T00:00:00.000Z");
    expect(bounds.end!.toISOString()).toBe("2026-08-06T23:59:59.999Z");
  });

  test("resolveFullBounds normalizuje start i end osobno", () => {
    const bounds = resolveFullBounds({
      start: new Date("2026-08-01T00:00:00.000Z"),
      end: new Date("2026-08-07T00:00:00.000Z"),
      precision: DateTimePickerPrecision.Date,
    });

    expect(bounds.start!.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(bounds.end!.toISOString()).toBe("2026-08-07T23:59:59.999Z");
  });

  test("resolveFullBoundsFields nie uzupełnia end z start", () => {
    const bounds = resolveFullBoundsFields({
      start: new Date("2026-08-06T12:30:00.000Z"),
      end: null,
      precision: DateTimePickerPrecision.Date,
    });

    expect(bounds.start!.toISOString()).toBe("2026-08-06T00:00:00.000Z");
    expect(bounds.end).toBeNull();
  });
});

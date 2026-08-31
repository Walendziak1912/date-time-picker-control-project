import { describe, expect, test } from "vitest";
import { createInstant } from "../../../../shared/components/DateTimePicker/repository";
import { formatDateTime, parseDateTime, defaultFormat, isDateDisabled, snapToStep } from "../../../../shared/components/DateTimePicker/repository/dateUtils";
import {
    resolveDateTimePickerPrecision,
    normalizeDateTimePrecisions,
    adjustValueForPrecisionChange,
    DateTimePickerPrecision,
} from "../../../../shared/components/DateTimePicker/types/precision.types";

describe("DateTimePicker repository formatDateTime", () => {
    test("Formatuje datę w strefie UTC", () => {
        const date = new Date(Date.UTC(2026, 6, 29, 14, 5, 9, 123));
        expect(formatDateTime(date, "dd.MM.yyyy HH:mm:ss:SSS", false, "pl-PL", "UTC")).toBe("29.07.2026 14:05:09:123");
    });

    test("Zwraca pusty string dla wartości null", () => {
        expect(formatDateTime(null, "dd.MM.yyyy", false, "pl-PL", "UTC")).toBe("");
    });

    test("Obsługuje samą datę bez czasu", () => {
        const date = new Date(Date.UTC(2025, 0, 1));
        expect(formatDateTime(date, "dd.MM.yyyy", false, "pl-PL", "UTC")).toBe("01.01.2025");
    });
});

describe("DateTimePicker repository parseDateTime", () => {
    test("Parsuje poprawną datę do instantu UTC", () => {
        const result = parseDateTime("29.07.2026", "dd.MM.yyyy", false, "UTC");
        expect(result).not.toBeNull();
        expect(result!.toISOString()).toBe("2026-07-29T00:00:00.000Z");
    });

    test("Parsuje datę z czasem i sekundami", () => {
        const result = parseDateTime("29.07.2026 14:05:09", "dd.MM.yyyy HH:mm:ss", false, "UTC");
        expect(result!.toISOString()).toBe("2026-07-29T14:05:09.000Z");
    });

    test("Zwraca null dla niepoprawnego formatu", () => {
        expect(parseDateTime("abc", "dd.MM.yyyy", false, "UTC")).toBeNull();
    });

    test("Zwraca null dla nieprawidłowego dnia (32)", () => {
        expect(parseDateTime("32.01.2025", "dd.MM.yyyy", false, "UTC")).toBeNull();
    });

    test("Zwraca null dla nieprawidłowego miesiąca (13)", () => {
        expect(parseDateTime("01.13.2025", "dd.MM.yyyy", false, "UTC")).toBeNull();
    });

    test("Zwraca null dla pustego tekstu", () => {
        expect(parseDateTime("   ", "dd.MM.yyyy", false, "UTC")).toBeNull();
    });
});

describe("DateTimePicker repository defaultFormat", () => {
    test("Test formatowanie date dd.MM.yyyy", () => {
        expect(defaultFormat("date", false, false)).toBe("dd.MM.yyyy");
    });

    test("Test formatowania datetime bez sekund dd.MM.yyyy HH:mm", () => {
        expect(defaultFormat("datetime", false, false)).toBe("dd.MM.yyyy HH:mm");
    });

    test("Test formatowania datetime z sekundami dd.MM.yyyy HH:mm:ss", () => {
        expect(defaultFormat("datetime", false, true)).toBe("dd.MM.yyyy HH:mm:ss");
    });

    test("Test formatowania datetime z milisekundami dd.MM.yyyy HH:mm:ss:SSS", () => {
        expect(defaultFormat("datetime", false, true, true)).toBe("dd.MM.yyyy HH:mm:ss:SSS");
    });
});

describe("DateTimePicker repository isDateDisabled", () => {
    test("Blokuje datę przed minDate", () => {
        const min = new Date(2025, 0, 10);
        expect(isDateDisabled(new Date(2025, 0, 5), { minDate: min })).toBe(true);
    });

    test("blokuje datę po maxDate", () => {
        const max = new Date(2025, 0, 10);
        expect(isDateDisabled(new Date(2025, 0, 15), { maxDate: max })).toBe(true);
    });

    test("Nie blokuje daty w dozwolonym zakresie", () => {
        const min = new Date(2025, 0, 1);
        const max = new Date(2025, 0, 31);
        expect(isDateDisabled(new Date(2025, 0, 15), { minDate: min, maxDate: max })).toBe(false);
    });
});

describe("DateTimePicker repository snapToStep", () => {
    test("zaokrągla do najbliższego kroku", () => {
        expect(snapToStep(7, 5, 60)).toBe(5);
        expect(snapToStep(8, 5, 60)).toBe(10);
    });

    test("nie przekracza maxExclusive", () => {
        expect(snapToStep(59, 15, 60)).toBe(45);
    });

    test("nie schodzi poniżej zera", () => {
        expect(snapToStep(-3, 5, 60)).toBe(0);
    });
});

describe("DateTimePicker precision - resolveDateTimePickerPrecision", () => {
    test("Date -> mode date bez sekund/milisekund", () => {
        expect(resolveDateTimePickerPrecision(DateTimePickerPrecision.Date)).toEqual({
            mode: "date",
            showSeconds: false,
            showMilliseconds: false,
        });
    });

    test("DateTimeSeconds -> mode datetime z sekundami", () => {
        expect(resolveDateTimePickerPrecision(DateTimePickerPrecision.DateTimeSeconds)).toEqual({
            mode: "datetime",
            showSeconds: true,
            showMilliseconds: false,
        });
    });

    test("TimeMilliseconds -> mode time z sekundami i milisekundami", () => {
        expect(resolveDateTimePickerPrecision(DateTimePickerPrecision.TimeMilliseconds)).toEqual({
            mode: "time",
            showSeconds: true,
            showMilliseconds: true,
        });
    });
});

describe("DateTimePicker precision normalizeDateTimePrecisions", () => {
    test("Pojedyncza wartość zamieniana jest na tablicę", () => {
        expect(normalizeDateTimePrecisions(DateTimePickerPrecision.Date)).toEqual([DateTimePickerPrecision.Date]);
    });

    test("Tablica pozostaje bez zmian", () => {
        const input = [DateTimePickerPrecision.Date, DateTimePickerPrecision.DateTime];
        expect(normalizeDateTimePrecisions(input)).toEqual(input);
    });

    test("Pusta tablica", () => {
        expect(normalizeDateTimePrecisions(undefined)).toEqual([]);
    });
});

describe("DateTimePicker precision adjustValueForPrecisionChange", () => {
    test("Przejście do trybu date zeruje czas", () => {
        const value = new Date(Date.UTC(2026, 6, 29, 14, 30, 15, 500));
        const result = adjustValueForPrecisionChange(value, DateTimePickerPrecision.DateTimeSeconds, DateTimePickerPrecision.Date, "UTC");
        expect(result!.toISOString()).toBe("2026-07-29T00:00:00.000Z");
    });

    test("Przejście do trybu bez sekund usuwa sekundy", () => {
        const value = new Date(Date.UTC(2026, 6, 29, 14, 30, 15));
        const result = adjustValueForPrecisionChange(value, DateTimePickerPrecision.DateTimeSeconds, DateTimePickerPrecision.DateTime, "UTC");
        expect(result!.toISOString()).toBe("2026-07-29T14:30:00.000Z");
    });

    test("null pozostaje null", () => {
        expect(adjustValueForPrecisionChange(null, DateTimePickerPrecision.Date, DateTimePickerPrecision.DateTime, "UTC")).toBeNull();
    });
});

describe("DateTimePicker repository createInstant", () => {
    test("Tworzy instant UTC z podanych pól", () => {
        const instant = createInstant({ year: 2026, month: 6, date: 29, hours: 14, minutes: 5 }, "UTC");
        expect(instant.toISOString()).toBe("2026-07-29T14:05:00.000Z");
    });
});

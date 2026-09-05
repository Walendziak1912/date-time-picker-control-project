import { describe, expect, test } from "vitest";
import {
    hasRangeLimits,
    getMaxEndForStart,
    getMinStartForEnd,
    normalizeRangeValue,
    buildStartConstraints,
    buildEndConstraints,
    isRangeOrderValid,
    getPresetRange,
    matchPreset,
} from "../../../../shared/components/DateTimeRange/repository";

const utc = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) => new Date(Date.UTC(y, m, d, h, min, s, ms));

describe("DateTimeRange repository testy limitów", () => {
    test("False gdy brak limitów", () => {
        expect(hasRangeLimits({})).toBe(false);
    });

    test("True gdy ustawiono maxRangeDays", () => {
        expect(hasRangeLimits({ maxRangeDays: 3 })).toBe(true);
    });

    test("True gdy ustawiono maxRangeHours", () => {
        expect(hasRangeLimits({ maxRangeHours: 48 })).toBe(true);
    });

    test("False gdy limit ma wartość 0", () => {
        expect(hasRangeLimits({ maxRangeDays: 0 })).toBe(false);
    });
});

describe("DateTimeRange repository isRangeOrderValid", () => {
    test("True gdy start <= end", () => {
        expect(isRangeOrderValid(utc(2026, 6, 1), utc(2026, 6, 10))).toBe(true);
    });

    test("False gdy start > end", () => {
        expect(isRangeOrderValid(utc(2026, 6, 20), utc(2026, 6, 10))).toBe(false);
    });

    test("True gdy któraś wartość jest null", () => {
        expect(isRangeOrderValid(null, utc(2026, 6, 10))).toBe(true);
        expect(isRangeOrderValid(utc(2026, 6, 10), null)).toBe(true);
    });
});

describe("DateTimeRange repository getMaxEndForStart testy limitu godzinowego oraz precision", () => {
    test("Props maxRangeHours=48 z precyzją liczy dokładne 48h od startu", () => {
        const start = utc(2026, 6, 27, 12);
        const maxEnd = getMaxEndForStart(start, { maxRangeHours: 48, precision: true }, "datetime", "UTC");
        expect(maxEnd!.toISOString()).toBe("2026-07-29T12:00:00.000Z");
    });

    test("Bez limitów zwraca undefined", () => {
        const start = utc(2026, 6, 27, 12);
        expect(getMaxEndForStart(start, {}, "datetime", "UTC")).toBeUndefined();
    });

    test("Gdy wiele limitów wybiera najwcześniejszy koniec", () => {
        const start = utc(2026, 6, 27, 0);
        const maxEnd = getMaxEndForStart(start, { maxRangeHours: 48, maxRangeMinutes: 24 * 60, precision: true }, "datetime", "UTC");
        expect(maxEnd!.toISOString()).toBe("2026-07-28T00:00:00.000Z");
    });

    test("maxRangeDays=5 w trybie kalendarzowym liczy dni w UTC", () => {
        const start = utc(2026, 8, 23, 0);
        const maxEnd = getMaxEndForStart(start, { maxRangeDays: 5 }, "datetime", "UTC");
        expect(maxEnd!.toISOString()).toBe("2026-09-27T23:59:59.999Z");
    });
});

describe("DateTimeRange repository getMinStartForEnd (limit godzinowy opcja precision)", () => {
    test("Props maxRangeHours=48 z precyzją powinno liczyć 48h wstecz od końca", () => {
        const end = utc(2026, 6, 29, 12);
        const minStart = getMinStartForEnd(end, { maxRangeHours: 48, precision: true }, "datetime", "UTC");
        expect(minStart!.toISOString()).toBe("2026-07-27T12:00:00.000Z");
    });
});

describe("DateTimeRange repository normalizeRangeValue", () => {
    test("Start > end koryguje end do start", () => {
        const result = normalizeRangeValue({ start: utc(2026, 6, 20), end: utc(2026, 6, 10) }, {}, "datetime", "UTC");
        expect(result.end!.getTime()).toBe(result.start!.getTime());
    });

    test("Przycinanie end do maksymalnego zakresu (maxRangeDays + precyzją)", () => {
        const result = normalizeRangeValue({ start: utc(2026, 6, 27, 0), end: utc(2026, 6, 30, 0) }, { maxRangeDays: 2, precision: true }, "datetime", "UTC");
        expect(result.end!.toISOString()).toBe("2026-07-29T00:00:00.000Z");
    });

    test("Przycinanie end do maksymalnego zakresu kalendarzowego maxRangeDays=5", () => {
        const start = utc(2026, 8, 23, 0);
        const result = normalizeRangeValue(
            { start, end: utc(2026, 8, 30, 0) },
            { maxRangeDays: 5 },
            "datetime",
            "UTC",
        );
        expect(result.end!.toISOString()).toBe("2026-09-27T23:59:59.999Z");
    });
});

describe("DateTimeRange repository buildEndConstraints/buildStartConstraints datetime", () => {
    test("End nie może być wcześniejszy niż start", () => {
        const start = utc(2026, 6, 10, 8);
        const constraints = buildEndConstraints({
            mode: "datetime",
            start,
            limits: {},
            timezone: "UTC",
        });
        expect(constraints.minDateTime!.getTime()).toBe(start.getTime());
    });

    test("Start nie może być późniejszy niż end", () => {
        const end = utc(2026, 6, 20, 8);
        const constraints = buildStartConstraints({
            mode: "datetime",
            end,
            limits: {},
            timezone: "UTC",
        });
        expect(constraints.maxDateTime!.getTime()).toBe(end.getTime());
    });
});

describe("DateTimeRange repository getPresetRange", () => {
    const now = utc(2026, 6, 29, 15, 30); // środa 29.07.2026

    test("Today zwraca początek i koniec bieżącego dnia", () => {
        const range = getPresetRange("today", "UTC", now);
        expect(range.start!.toISOString()).toBe("2026-07-29T00:00:00.000Z");
        expect(range.end!.toISOString()).toBe("2026-07-29T23:59:59.999Z");
    });

    test("Yesterday zwraca poprzedni dzień", () => {
        const range = getPresetRange("yesterday", "UTC", now);
        expect(range.start!.toISOString()).toBe("2026-07-28T00:00:00.000Z");
        expect(range.end!.toISOString()).toBe("2026-07-28T23:59:59.999Z");
    });

    test("ThisWeek zaczyna się w poniedziałek", () => {
        const range = getPresetRange("thisWeek", "UTC", now);
        expect(range.start!.toISOString()).toBe("2026-07-27T00:00:00.000Z");
        expect(range.end!.toISOString()).toBe("2026-08-02T23:59:59.999Z");
    });

    test("ThisMonth obejmuje cały lipiec", () => {
        const range = getPresetRange("thisMonth", "UTC", now);
        expect(range.start!.toISOString()).toBe("2026-07-01T00:00:00.000Z");
        expect(range.end!.toISOString()).toBe("2026-07-31T23:59:59.999Z");
    });

    test("LastMonth obejmuje cały czerwiec", () => {
        const range = getPresetRange("lastMonth", "UTC", now);
        expect(range.start!.toISOString()).toBe("2026-06-01T00:00:00.000Z");
        expect(range.end!.toISOString()).toBe("2026-06-30T23:59:59.999Z");
    });
});

describe("DateTimeRange repository matchPreset", () => {
    const now = utc(2026, 6, 29, 15, 30);

    test("Rozpoznaje zakres odpowiadający presetowi today", () => {
        const todayRange = getPresetRange("today", "UTC", now);
        expect(matchPreset(todayRange, "UTC", undefined, now)).toBe("today");
    });

    test("Zwraca null dla zakresu nieodpowiadającego żadnemu presetowi", () => {
        const custom = { start: utc(2026, 6, 3), end: utc(2026, 6, 7) };
        expect(matchPreset(custom, "UTC", undefined, now)).toBeNull();
    });

    test("Zwraca null gdy brak start lub end", () => {
        expect(matchPreset({ start: null, end: null }, "UTC", undefined, now)).toBeNull();
    });
});

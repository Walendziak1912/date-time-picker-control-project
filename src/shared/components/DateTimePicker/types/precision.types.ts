import type { DateTimePickerMode } from "./DateTimePicker.types";
import type { SupportedLocale } from "./locale.types";
import {
    startOfDayTz,
    withoutMillisecondsTz,
    withoutSecondsTz,
} from "../repository/timezone";
import type { DateTimePickerTimezone } from "./DateTimePicker.types";

export const DateTimePickerPrecision = {
    //Tylko data (kalendarz), format dd.MM.yyyy
    Date: "date",
    //Data + godzina i minuta, format dd.MM.yyyy HH:mm
    DateTime: "datetime",
    //Data + godzina, minuta i sekunda, format dd.MM.yyyy HH:mm:ss
    DateTimeSeconds: "datetimeSeconds",
    //Data + godzina, minuta, sekunda i milisekunda, format dd.MM.yyyy HH:mm:ss:SSS
    DateTimeMilliseconds: "datetimeMilliseconds",
    //Tylko czas godzina i minuta
    Time: "time",
    //Tylko czas z sekundami
    TimeSeconds: "timeSeconds",
    //Tylko czas z milisekundami
    TimeMilliseconds: "timeMilliseconds",
} as const;

export type DateTimePickerPrecisionValue = (typeof DateTimePickerPrecision)[keyof typeof DateTimePickerPrecision];

export type ResolvedDateTimePickerPrecision = {
    mode: DateTimePickerMode;
    showSeconds: boolean;
    showMilliseconds: boolean;
};

export function resolveDateTimePickerPrecision(precision: DateTimePickerPrecisionValue): ResolvedDateTimePickerPrecision {
    switch (precision) {
        case DateTimePickerPrecision.Date:
            return { mode: "date", showSeconds: false, showMilliseconds: false };
        case DateTimePickerPrecision.DateTime:
            return { mode: "datetime", showSeconds: false, showMilliseconds: false };
        case DateTimePickerPrecision.DateTimeSeconds:
            return { mode: "datetime", showSeconds: true, showMilliseconds: false };
        case DateTimePickerPrecision.DateTimeMilliseconds:
            return { mode: "datetime", showSeconds: true, showMilliseconds: true };
        case DateTimePickerPrecision.Time:
            return { mode: "time", showSeconds: false, showMilliseconds: false };
        case DateTimePickerPrecision.TimeSeconds:
            return { mode: "time", showSeconds: true, showMilliseconds: false };
        case DateTimePickerPrecision.TimeMilliseconds:
            return { mode: "time", showSeconds: true, showMilliseconds: true };
    }
}

export type DateTimePrecisionsInput =
    | DateTimePickerPrecisionValue
    | DateTimePickerPrecisionValue[];

export function normalizeDateTimePrecisions(
    input?: DateTimePrecisionsInput,
): DateTimePickerPrecisionValue[] {
    if (input == null) return [];
    return Array.isArray(input) ? input : [input];
}

export function resolveActiveDateTimePrecision(
    availablePrecisions: DateTimePickerPrecisionValue[],
    options: {
        isControlled: boolean;
        selected?: DateTimePickerPrecisionValue;
        internal: DateTimePickerPrecisionValue | null;
    },
): DateTimePickerPrecisionValue | null {
    if (availablePrecisions.length === 0) return null;

    const fallback = availablePrecisions[0];
    if (options.isControlled) {
        return options.selected ?? fallback;
    }

    const candidate = options.internal ?? fallback;
    return availablePrecisions.includes(candidate) ? candidate : fallback;
}

export function getDefaultPrecisionLabel(
    precision: DateTimePickerPrecisionValue,
    locale: SupportedLocale = "pl-PL",
): string {
    const pl = locale === "pl-PL";
    switch (precision) {
        case DateTimePickerPrecision.Date:
            return pl ? "Data" : "Date";
        case DateTimePickerPrecision.DateTime:
            return pl ? "Minuty" : "Minutes";
        case DateTimePickerPrecision.DateTimeSeconds:
            return pl ? "Sekundy" : "Seconds";
        case DateTimePickerPrecision.DateTimeMilliseconds:
            return pl ? "Milisekundy" : "Milliseconds";
        case DateTimePickerPrecision.Time:
            return pl ? "Minuty" : "Minutes";
        case DateTimePickerPrecision.TimeSeconds:
            return pl ? "Sekundy" : "Seconds";
        case DateTimePickerPrecision.TimeMilliseconds:
            return pl ? "Milisekundy" : "Milliseconds";
    }
}

export function adjustValueForPrecisionChange(
    value: Date | null,
    from: DateTimePickerPrecisionValue,
    to: DateTimePickerPrecisionValue,
    timezone: DateTimePickerTimezone,
): Date | null {
    if (!value) return value;

    const fromResolved = resolveDateTimePickerPrecision(from);
    const toResolved = resolveDateTimePickerPrecision(to);
    let result = value;

    if (toResolved.mode === "date") {
        return startOfDayTz(result, timezone);
    }

    if (fromResolved.mode === "date") {
        result = startOfDayTz(result, timezone);
    }

    if (!toResolved.showSeconds) {
        result = withoutSecondsTz(result, timezone);
    } else if (!fromResolved.showSeconds) {
        result = withoutSecondsTz(result, timezone);
    }

    if (!toResolved.showMilliseconds) {
        result = withoutMillisecondsTz(result, timezone);
    } else if (!fromResolved.showMilliseconds) {
        result = withoutMillisecondsTz(result, timezone);
    }

    return result;
}

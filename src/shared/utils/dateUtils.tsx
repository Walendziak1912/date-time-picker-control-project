
import {
    createInstant,
    getDate,
    getHours,
    getMilliseconds,
    getMinutes,
    getMonth,
    getSeconds,
    getYear,
    parseBackendUtc,
    resolveDateTimePickerPrecision,
    serializeBackendUtc,
    type DateTimePickerPrecisionValue,
} from "../components/DateTimePicker";

export const DATE_FORMATS = {
    DATE_ONLY: "dd.MM.yyyy",
    DATE_SLASH: "dd/MM/yyyy",
    DATE_SLASH_ddmmyy: "dd/mm/yy",
    DATE_DASH: "yyyy-MM-dd",
    MONTH_YEAR: "MM.yyyy",
    YEAR_ONLY: "yyyy",
} as const;
export const DateTimeFormat = "HH:mm:ss.SSS dd.MM.yyyy";
export const DEFAULT_DATE_FORMAT_SHORT = "dd.mm.yy"; // PrimeReact nie obsługuje yyyy!
export const DEFAULT_DATE_FORMAT = "dd.MM.yyyy HH:mm:ss";

const INPUT_FORMATS = ["yyyy-MM-dd", "dd-MM-yyyy", "dd.MM.yyyy", "yyyy.MM.dd", "MM-dd-yyyy", "yyyy/MM/dd", "dd/MM/yyyy"];

export const parseToDate = (value: any): Date | null => {
    if (!value) return null;

    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return null;

    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
};

export const convertToUTC = (localDate: Date): Date => {
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const seconds = localDate.getSeconds();
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
};

export const convertToDateOnlyUTCString = (localDate: Date | null | undefined): string => {
    if (localDate == null) {
        return "";
    }

    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();
    const hours = localDate.getHours();
    const minutes = localDate.getMinutes();
    const seconds = localDate.getSeconds();
    const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    return date.toISOString().split("T")[0];
};

const pad = (n: number, len = 2) => String(n).padStart(len, "0");
export const formatDisplayDate = (date: Date): string => {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

export const dateToISOString = (date: Date): string => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}Z`;
};

export const formatDate = (date: Date, format: string): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return format.replace("dd", day).replace("MM", month).replace("yyyy", year.toString());
};

export const getDateFormater = (inputDate: Date | null | undefined) => {
    const date = inputDate ? new Date(inputDate) : null;
    const formattedDate = date
        ? date.toLocaleDateString("pl-PL", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
          })
        : "";

    return formattedDate;
};

export const formatDateTime = (date: Date | string | null, locale: string = "pl-PL"): string => {
    if (!date) return "";
    try {
        const dateObject = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(dateObject);
    } catch (error) {
        console.error("Invalid date:", date);
        return "";
    }
};

export const formatTime = (date: Date | undefined | null, locale: string = "pl-PL"): string => {
    if (!date) return "";
    try {
        const dateObject = typeof date === "string" ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
        }).format(dateObject);
    } catch (error) {
        console.error("Invalid date:", date);
        return "";
    }
};

export const generateDateRange = (startDate: string | number, endDate: string | number): string[] => {
    const dates: string[] = [];
    const current = new Date(Number(startDate));
    const end = new Date(Number(endDate));

    while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
    }

    return dates;
};

const parseDateFromString = (selectedDate: string): { from: Date; to: Date } => {
    // Check if it's a daily format: "DD-MM (day)" or "DD-MM"
    const dailyRegex = /^(\d{2})-(\d{2})(?:\s\([^)]+\))?$/;
    if (dailyRegex.test(selectedDate)) {
        const match = selectedDate.match(dailyRegex);
        if (match) {
            const day = parseInt(match[1]);
            const month = parseInt(match[2]) - 1;

            const startDate = new Date(1900, month, day);
            const endDate = new Date(1900, month, day, 23, 59, 59, 999);

            return { from: startDate, to: endDate };
        }
    }

    // Check if it's a weekekly format
    if (/^\d{4}\s-\s\d{1,2}$/.test(selectedDate)) {
        {
            const [year, week] = selectedDate.split(" - ").map((part) => parseInt(part.trim()));

            const firstDayOfYear = new Date(year, 0, 1);
            const daysOffset = (firstDayOfYear.getDay() > 0 ? firstDayOfYear.getDay() : 7) - 1;
            const firstMonday = new Date(year, 0, 1 + (7 - daysOffset));

            const startDate = new Date(firstMonday);
            startDate.setDate(firstMonday.getDate() + (week - 2) * 7);

            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            return { from: startDate, to: endDate };
        }
    }

    // Check if it's a month format
    if (/^\d{2}-\d{4}$/.test(selectedDate)) {
        {
            const [month, year] = selectedDate.split("-").map((part) => parseInt(part));

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            return { from: startDate, to: endDate };
        }
    }

    // Check if it's a year format
    if (/^\d{4}$/.test(selectedDate)) {
        {
            const year = parseInt(selectedDate);

            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);

            return { from: startDate, to: endDate };
        }
    }

    return {
        from: new Date(),
        to: new Date(),
    };
};

export const eventPadDate = (n: number, length = 2): string => String(n).padStart(length, "0");

export const buildUtcTime = (hh: number, mm: number, ss: number, ms: number): string => `${pad(hh)}:${pad(mm)}:${pad(ss)}.${pad(ms, 3)}`;

export const parseTimestamp = (s: string): Date => {
    const t: string = s.trim();
    const pl: RegExpMatchArray | null = t.match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (pl) {
        const [, d, m, y, hh, mm, ss = "00"] = pl;
        return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`);
    }
    const iso: RegExpMatchArray | null = t.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})(\.\d+)?$/);
    if (iso) {
        const [, y, m, d, hh, mm, ss, frac = ""] = iso;
        return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}${frac}`);
    }
    const fb: Date = new Date(t);
    if (!isNaN(fb.getTime())) return fb;
    throw new Error(`Nieznany format timestamp: "${t}"`);
};

export function displayPreciseDate(raw: string): string {
    const [datePart, timePart] = raw.split("T");
    const [year, month, day] = datePart.split("-");
    const [time, ms = "000"] = timePart.split(".");
    return `${day}.${month}.${year} ${time}.${ms.padStart(3, "0")}`;
}

//backend zawsze oczekuje zakresu w formacie "start , end" w UTC dlatego ta metoda pomocnicza 
const BACKEND_RANGE_SEPARATOR = " , ";
const boundOfPrecisionUtc = (date: Date, precision: DateTimePickerPrecisionValue, bound: "start" | "end"): Date => {
    const resolved = resolveDateTimePickerPrecision(precision);
    const isEnd = bound === "end";

    const instant = {
        year: getYear(date, "UTC"),
        month: getMonth(date, "UTC"),
        date: getDate(date, "UTC"),
        hours: getHours(date, "UTC"),
        minutes: getMinutes(date, "UTC"),
        seconds: getSeconds(date, "UTC"),
        milliseconds: getMilliseconds(date, "UTC"),
    };

    if (resolved.mode === "date") {
        instant.hours = isEnd ? 23 : 0;
        instant.minutes = isEnd ? 59 : 0;
        instant.seconds = isEnd ? 59 : 0;
        instant.milliseconds = isEnd ? 999 : 0;
    } else if (!resolved.showSeconds) {
        instant.seconds = isEnd ? 59 : 0;
        instant.milliseconds = isEnd ? 999 : 0;
    } else if (!resolved.showMilliseconds) {
        instant.milliseconds = isEnd ? 999 : 0;
    }
    return createInstant(instant, "UTC");
};

export type BackendRangeInput = {
    start: Date;
    end?: Date | null;
    precision: DateTimePickerPrecisionValue;
};

export const serializeBackendRange = ({ start, end, precision }: BackendRangeInput): string => {
    const rawEnd = end ?? start;
    const rangeStart = boundOfPrecisionUtc(start, precision, "start");
    const rangeEnd = boundOfPrecisionUtc(rawEnd, precision, "end");
    return `${serializeBackendUtc(rangeStart)}${BACKEND_RANGE_SEPARATOR}${serializeBackendUtc(rangeEnd)}`;
};

export const parseBackendRange = (raw: string | null | undefined): { start: Date | null; end: Date | null } => {
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
};

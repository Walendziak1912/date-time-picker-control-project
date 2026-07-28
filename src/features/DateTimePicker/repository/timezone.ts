import type { DateTimePickerTimezone } from '../types'

export function getYear(date: Date, timezone: DateTimePickerTimezone): number {
  return timezone === "UTC" ? date.getUTCFullYear() : date.getFullYear();
}

export function getMonth(date: Date, timezone: DateTimePickerTimezone): number {
  return timezone === "UTC" ? date.getUTCMonth() : date.getMonth();
}

export function getDate(date: Date, timezone: DateTimePickerTimezone): number {
  return timezone === "UTC" ? date.getUTCDate() : date.getDate();
}

export function getHours(date: Date, timezone: DateTimePickerTimezone): number {
  return timezone === "UTC" ? date.getUTCHours() : date.getHours();
}

export function getMinutes(
  date: Date,
  timezone: DateTimePickerTimezone,
): number {
  return timezone === "UTC" ? date.getUTCMinutes() : date.getMinutes();
}

export function getSeconds(
  date: Date,
  timezone: DateTimePickerTimezone,
): number {
  return timezone === "UTC" ? date.getUTCSeconds() : date.getSeconds();
}

export function getMilliseconds(
  date: Date,
  timezone: DateTimePickerTimezone,
): number {
  return timezone === "UTC" ? date.getUTCMilliseconds() : date.getMilliseconds();
}

export function createInstant(
  fields: {
    year: number;
    month: number;
    date: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
  },
  timezone: DateTimePickerTimezone,
): Date {
  const hours = fields.hours ?? 0;
  const minutes = fields.minutes ?? 0;
  const seconds = fields.seconds ?? 0;
  const milliseconds = fields.milliseconds ?? 0;

  if (timezone === "UTC") {
    return new Date(
      Date.UTC(
        fields.year,
        fields.month,
        fields.date,
        hours,
        minutes,
        seconds,
        milliseconds,
      ),
    );
  }

  return new Date(
    fields.year,
    fields.month,
    fields.date,
    hours,
    minutes,
    seconds,
    milliseconds,
  );
}

export function nowInTimezone(_timezone: DateTimePickerTimezone): Date {
  return new Date();
}

export function setDatePartTz(
  base: Date | null,
  day: Date,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    const year = getYear(day, timezone);
    const month = getMonth(day, timezone);
    const date = getDate(day, timezone);

    if (!base) {
      return createInstant({ year, month, date }, timezone);
    }

    return createInstant(
      {
        year,
        month,
        date,
        hours: getHours(base, timezone),
        minutes: getMinutes(base, timezone),
        seconds: getSeconds(base, timezone),
        milliseconds: getMilliseconds(base, timezone),
      },
      timezone,
    );
  }

  const result = base ? new Date(base) : new Date();
  result.setFullYear(
    getYear(day, timezone),
    getMonth(day, timezone),
    getDate(day, timezone),
  );
  if (!base) {
    result.setHours(0, 0, 0, 0);
  }
  return result;
}

export function setTimePartTz(
  base: Date | null,
  hours: number,
  minutes: number,
  seconds = 0,
  timezone: DateTimePickerTimezone,
  milliseconds = 0,
): Date {
  if (!base) {
    const today = nowInTimezone(timezone);
    return createInstant(
      {
        year: getYear(today, timezone),
        month: getMonth(today, timezone),
        date: getDate(today, timezone),
        hours,
        minutes,
        seconds,
        milliseconds,
      },
      timezone,
    );
  }

  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(base, timezone),
        month: getMonth(base, timezone),
        date: getDate(base, timezone),
        hours,
        minutes,
        seconds,
        milliseconds,
      },
      timezone,
    );
  }

  const result = new Date(base);
  result.setHours(hours, minutes, seconds, milliseconds);
  return result;
}

export function withoutSecondsTz(
  date: Date,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(date, timezone),
        month: getMonth(date, timezone),
        date: getDate(date, timezone),
        hours: getHours(date, timezone),
        minutes: getMinutes(date, timezone),
        seconds: 0,
        milliseconds: getMilliseconds(date, timezone),
      },
      timezone,
    );
  }

  const result = new Date(date);
  result.setSeconds(0, result.getMilliseconds());
  return result;
}

export function withoutMillisecondsTz(
  date: Date,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(date, timezone),
        month: getMonth(date, timezone),
        date: getDate(date, timezone),
        hours: getHours(date, timezone),
        minutes: getMinutes(date, timezone),
        seconds: getSeconds(date, timezone),
        milliseconds: 0,
      },
      timezone,
    );
  }

  const result = new Date(date);
  result.setMilliseconds(0);
  return result;
}

export function isSameDayTz(
  a: Date,
  b: Date,
  timezone: DateTimePickerTimezone,
): boolean {
  return (
    getYear(a, timezone) === getYear(b, timezone) &&
    getMonth(a, timezone) === getMonth(b, timezone) &&
    getDate(a, timezone) === getDate(b, timezone)
  );
}

export function isSameMonthTz(
  a: Date,
  b: Date,
  timezone: DateTimePickerTimezone,
): boolean {
  return (
    getYear(a, timezone) === getYear(b, timezone) &&
    getMonth(a, timezone) === getMonth(b, timezone)
  );
}

export function isSameYearTz(
  a: Date,
  b: Date,
  timezone: DateTimePickerTimezone,
): boolean {
  return getYear(a, timezone) === getYear(b, timezone);
}

export function startOfDayTz(
  date: Date,
  timezone: DateTimePickerTimezone,
): Date {
  return createInstant(
    {
      year: getYear(date, timezone),
      month: getMonth(date, timezone),
      date: getDate(date, timezone),
    },
    timezone,
  );
}

export function addMonthsTz(
  date: Date,
  amount: number,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(date, timezone),
        month: getMonth(date, timezone) + amount,
        date: getDate(date, timezone),
        hours: getHours(date, timezone),
        minutes: getMinutes(date, timezone),
        seconds: getSeconds(date, timezone),
        milliseconds: getMilliseconds(date, timezone),
      },
      timezone,
    );
  }

  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function addYearsTz(
  date: Date,
  amount: number,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(date, timezone) + amount,
        month: getMonth(date, timezone),
        date: getDate(date, timezone),
        hours: getHours(date, timezone),
        minutes: getMinutes(date, timezone),
        seconds: getSeconds(date, timezone),
        milliseconds: getMilliseconds(date, timezone),
      },
      timezone,
    );
  }

  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
}

export function setMonthPartTz(
  base: Date,
  monthIndex: number,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year: getYear(base, timezone),
        month: monthIndex,
        date: getDate(base, timezone),
        hours: getHours(base, timezone),
        minutes: getMinutes(base, timezone),
        seconds: getSeconds(base, timezone),
        milliseconds: getMilliseconds(base, timezone),
      },
      timezone,
    );
  }

  const result = new Date(base);
  result.setMonth(monthIndex);
  return result;
}

export function setYearPartTz(
  base: Date,
  year: number,
  timezone: DateTimePickerTimezone,
): Date {
  if (timezone === "UTC") {
    return createInstant(
      {
        year,
        month: getMonth(base, timezone),
        date: getDate(base, timezone),
        hours: getHours(base, timezone),
        minutes: getMinutes(base, timezone),
        seconds: getSeconds(base, timezone),
        milliseconds: getMilliseconds(base, timezone),
      },
      timezone,
    );
  }

  const result = new Date(base);
  result.setFullYear(year);
  return result;
}

export function buildCalendarDaysTz(
  month: Date,
  showOutside: boolean,
  timezone: DateTimePickerTimezone,
): Date[] {
  const year = getYear(month, timezone);
  const monthIndex = getMonth(month, timezone);
  const first = createInstant({ year, month: monthIndex, date: 1 }, timezone);
  const startOffset =
    timezone === "UTC" ? (first.getUTCDay() + 6) % 7 : (first.getDay() + 6) % 7;

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    if (timezone === "UTC") {
      days.push(
        createInstant(
          { year, month: monthIndex, date: 1 - startOffset + i },
          timezone,
        ),
      );
      continue;
    }

    const start = new Date(year, monthIndex, 1 - startOffset);
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }

  if (!showOutside) {
    const lastNeeded = days.findLastIndex((d) =>
      isSameMonthTz(d, month, timezone),
    );
    return days.slice(0, Math.max(lastNeeded + 1, 35));
  }

  return days;
}

/** ISO z backendu (z lub bez Z) → instant (timestamp). */
export function parseBackendUtc(iso: string): Date {
  const trimmed = iso.trim();
  if (!trimmed) return new Date(Number.NaN);

  if (/[Zz]$/.test(trimmed) || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  const normalized = trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`;
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/,
  );
  if (!match) return new Date(trimmed);

  const [, ys, ms, ds, hs, mins, ss = "0", frac = "0"] = match;
  const milliseconds = Number(frac.padEnd(3, "0").slice(0, 3));

  return new Date(
    Date.UTC(
      Number(ys),
      Number(ms) - 1,
      Number(ds),
      Number(hs),
      Number(mins),
      Number(ss),
      milliseconds,
    ),
  );
}

//ISO UTC dla API z sufiksem Z
export function serializeBackendUtc(date: Date): string {
  return date.toISOString();
}

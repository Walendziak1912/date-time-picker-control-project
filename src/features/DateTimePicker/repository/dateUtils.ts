import type { DateDisableConstraints, DateTimePickerTimezone, TimeDisableConstraints } from '../types'

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const PL_WEEKDAY_LABELS = [
  "Pon",
  "Wt",
  "Śr",
  "Czw",
  "Pt",
  "Sob",
  "Nd",
] as const;

export function getWeekdayLabels(locale: string): string[] {
  if (locale.toLowerCase().startsWith("pl")) {
    return [...PL_WEEKDAY_LABELS];
  }

  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i);
    const raw = formatter.format(d).replace(/\./g, "").trim();
    if (
      raw.toLowerCase().startsWith("niedz") ||
      raw.toLowerCase().startsWith("sun")
    ) {
      return "Nd";
    }
    return raw.length <= 3
      ? raw.charAt(0).toUpperCase() + raw.slice(1)
      : raw.charAt(0).toUpperCase() + raw.charAt(1).toLowerCase();
  });
}

export function getMonthLabels(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
  return Array.from({ length: 12 }, (_, i) =>
    formatter.format(new Date(2024, i, 1)),
  );
}

export function formatDateTime(
  value: Date | null,
  format: string,
  ampm: boolean,
  locale: string,
  timezone: DateTimePickerTimezone = 'UTC',
): string {
  if (!value) return "";

  const hours24 = timezone === "UTC" ? value.getUTCHours() : value.getHours();
  const hours12 = hours24 % 12 || 12;
  const isPm = hours24 >= 12;
  const meridiem =
    new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      hour12: true,
      timeZone: timezone === "UTC" ? "UTC" : undefined,
    })
      .formatToParts(value)
      .find((p) => p.type === "dayPeriod")?.value ?? (isPm ? "PM" : "AM");

  const tokens: Record<string, string> = {
    yyyy: String(
      timezone === "UTC" ? value.getUTCFullYear() : value.getFullYear(),
    ),
    MM: pad((timezone === "UTC" ? value.getUTCMonth() : value.getMonth()) + 1),
    dd: pad(timezone === "UTC" ? value.getUTCDate() : value.getDate()),
    HH: pad(hours24),
    hh: pad(hours12),
    mm: pad(timezone === "UTC" ? value.getUTCMinutes() : value.getMinutes()),
    ss: pad(timezone === "UTC" ? value.getUTCSeconds() : value.getSeconds()),
    SSS: pad3(
      timezone === "UTC" ? value.getUTCMilliseconds() : value.getMilliseconds(),
    ),
    a: meridiem,
  };

  let result = format;
  for (const [token, replacement] of Object.entries(tokens)) {
    result = result.replaceAll(token, replacement);
  }

  if (!ampm && format.includes("a")) {
    result = result.replace(/\s*a\s*/i, " ").trim();
  }

  return result;
}

export function parseDateTime(
  text: string,
  format: string,
  ampm: boolean,
  timezone: DateTimePickerTimezone = 'UTC',
): Date | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const tokenOrder = ["yyyy", "MM", "dd", "HH", "hh", "mm", "ss", "SSS", "a"] as const;
  const patterns: Record<(typeof tokenOrder)[number], string> = {
    yyyy: "(?<yyyy>\\d{4})",
    MM: "(?<MM>\\d{1,2})",
    dd: "(?<dd>\\d{1,2})",
    HH: "(?<HH>\\d{1,2})",
    hh: "(?<hh>\\d{1,2})",
    mm: "(?<mm>\\d{1,2})",
    ss: "(?<ss>\\d{1,2})",
    SSS: "(?<SSS>\\d{1,3})",
    a: "(?<a>[AaPp]\\.?\\s?[Mm]\\.?)",
  };

  let pattern = "";
  let rest = format;
  while (rest.length > 0) {
    const token = tokenOrder.find((t) => rest.startsWith(t));
    if (token) {
      pattern += patterns[token];
      rest = rest.slice(token.length);
      continue;
    }
    const ch = rest[0];
    pattern += ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    rest = rest.slice(1);
  }

  const match = trimmed.match(new RegExp(`^${pattern}$`, "i"));
  if (!match?.groups) return null;

  const year = Number(match.groups.yyyy ?? new Date().getFullYear());
  const month = Number(match.groups.MM ?? "1") - 1;
  const day = Number(match.groups.dd ?? "1");
  const minutes = Number(match.groups.mm ?? "0");
  const seconds = Number(match.groups.ss ?? "0");
  const milliseconds = Number(match.groups.SSS ?? "0");

  let hours = 0;
  if (match.groups.HH != null) {
    hours = Number(match.groups.HH);
  } else if (match.groups.hh != null) {
    const h12 = Number(match.groups.hh);
    const meridiem = (match.groups.a ?? "")
      .replace(/\./g, "")
      .replace(/\s/g, "")
      .toUpperCase();
    const isPm = meridiem.startsWith("P") || (ampm && meridiem === "");
    if (h12 === 12) hours = isPm ? 12 : 0;
    else hours = isPm ? h12 + 12 : h12;
  }

  if (
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31 ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59 ||
    milliseconds < 0 ||
    milliseconds > 999
  ) {
    return null;
  }

  const date =
    timezone === "UTC"
      ? new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds))
      : new Date(year, month, day, hours, minutes, seconds, milliseconds);

  if (timezone === "UTC") {
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
    return date;
  }

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function defaultFormat(
  mode: "date" | "time" | "datetime",
  ampm: boolean,
  includeSeconds: boolean,
  includeMilliseconds = false,
): string {
  let time = ampm ? "hh:mm" : "HH:mm";
  const withSeconds = includeSeconds || includeMilliseconds;
  if (withSeconds) time += ":ss";
  if (includeMilliseconds) time += ":SSS";
  if (ampm) time += " a";

  if (mode === "date") return "dd.MM.yyyy";
  if (mode === "time") return time;
  return `dd.MM.yyyy ${time}`;
}
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

export function range(max: number, step: number): number[] {
  const values: number[] = [];
  for (let i = 0; i < max; i += step) {
    values.push(i);
  }
  return values;
}

export function isDateDisabled(
  day: Date,
  options: DateDisableConstraints,
): boolean {
  const dayStart = startOfDay(day);
  const today = startOfDay(new Date());

  if (options.disablePast && dayStart < today) return true;
  if (options.disableFuture && dayStart > today) return true;
  if (options.minDate && dayStart < startOfDay(options.minDate)) return true;
  if (options.maxDate && dayStart > startOfDay(options.maxDate)) return true;
  if (options.minDateTime && dayStart < startOfDay(options.minDateTime))
    return true;
  if (options.maxDateTime && dayStart > startOfDay(options.maxDateTime))
    return true;
  if (options.shouldDisableDate?.(day)) return true;
  return false;
}

export function isMonthDisabled(
  month: Date,
  options: DateDisableConstraints,
): boolean {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  if (options.shouldDisableMonth?.(start)) return true;

  for (let d = start.getDate(); d <= end.getDate(); d += 1) {
    const day = new Date(month.getFullYear(), month.getMonth(), d);
    if (!isDateDisabled(day, options)) return false;
  }
  return true;
}

export function isYearDisabled(
  year: Date,
  options: DateDisableConstraints,
): boolean {
  const y = year.getFullYear();
  if (options.shouldDisableYear?.(new Date(y, 0, 1))) return true;

  for (let m = 0; m < 12; m += 1) {
    if (!isMonthDisabled(new Date(y, m, 1), options)) return false;
  }
  return true;
}

export function isTimeDisabled(
  candidate: Date,
  view: 'hours' | 'minutes' | 'seconds' | 'milliseconds',
  options: TimeDisableConstraints,
): boolean {
  const now = new Date();
  const timeOf = (d: Date) =>
    d.getHours() * 3600000 +
    d.getMinutes() * 60000 +
    d.getSeconds() * 1000 +
    d.getMilliseconds();
  const candidateTime = timeOf(candidate);

  if (options.disablePast && isSameDay(candidate, now) && candidate < now)
    return true;
  if (options.disableFuture && isSameDay(candidate, now) && candidate > now)
    return true;

  if (options.minTime && candidateTime < timeOf(options.minTime)) return true;
  if (options.maxTime && candidateTime > timeOf(options.maxTime)) return true;

  if (options.minDateTime && candidate < options.minDateTime) return true;
  if (options.maxDateTime && candidate > options.maxDateTime) return true;

  if (options.shouldDisableTime?.(candidate, view)) return true;
  return false;
}

export function snapToStep(
  value: number,
  step: number,
  maxExclusive: number,
): number {
  const snapped = Math.round(value / step) * step;
  if (snapped >= maxExclusive) return maxExclusive - step;
  return Math.max(0, snapped);
}

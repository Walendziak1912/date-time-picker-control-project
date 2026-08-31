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

//backend zawsze oczekuje zakresu w formacie "start , end" w UTC dlatego ta metoda pomocnicza
const BACKEND_RANGE_SEPARATOR = " , ";
const boundOfPrecisionUtc = (
  date: Date,
  precision: DateTimePickerPrecisionValue,
  bound: "start" | "end",
): Date => {
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

export type BackendRangeBoundsInput = {
  start?: Date | null;
  end?: Date | null;
  precision: DateTimePickerPrecisionValue;
};

// helper rozszerza granice zakresu do pełnej precyzji w UTC i zwraca je jako obiekty Date
// Zachowuje wartości null gdy dana granica nie została wybrana
//@Ignacy zerknij na to bo tutaj robi się rozjazd to jest na dodawaniu wydarzeń
//serializeBackendRange zwraca string w formacie "start , end"
//endpoint eventów EventRepository.add() wysyła obiekt EventVM, gdzie startDate i endDate to osobne pola typu Date
//logika końca dnia 23:59:59.999 siedzi w prywatnej funkcji boundOfPrecisionUtc
//dlatego dodałem resolveBackendRangeBounds
//serializeBackendRange, parseBackendRange w dateUtils.tsx są dokładnie po to, by opakować logikę granic zakresu w UTC dla backendu
//logika koniec dnia 23:59:59.999 zależnie od precyzji siedzi w jednym miejscu w boundOfPrecisionUtc resolveBackendRangeBounds i serializeBackendRange ją współdzielą
//pytanie czy taka normalizacja powinna być jak najbliżej granicy z API dla wydarzeń EventRepository.add() albo maperze VM do DTO?
//bo aktualnie jest w w handlerze onChange komponentu

export const resolveBackendRangeBounds = ({
  start,
  end,
  precision,
}: BackendRangeBoundsInput): { start: Date | null; end: Date | null } => ({
  start: start ? boundOfPrecisionUtc(start, precision, "start") : null,
  end: end ? boundOfPrecisionUtc(end, precision, "end") : null,
});

export const serializeBackendRange = ({
  start,
  end,
  precision,
}: BackendRangeInput): string => {
  const { start: rangeStart, end: rangeEnd } = resolveBackendRangeBounds({
    start,
    end: end ?? start,
    precision,
  });
  return `${serializeBackendUtc(rangeStart!)}${BACKEND_RANGE_SEPARATOR}${serializeBackendUtc(rangeEnd!)}`;
};

export const parseBackendRange = (
  raw: string | null | undefined,
): { start: Date | null; end: Date | null } => {
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

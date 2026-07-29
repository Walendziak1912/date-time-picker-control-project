import { useState } from "react";

import type { SupportedLocale } from "../../DateTimePicker";
import { useAppToast } from "../../../hooks/useAppToast";
import { serializeBackendUtc } from "../../DateTimePicker";
import {
  DateTimeRange,
  getMaxEndForStart,
  getPresetRange,
  serializeFlexRange,
} from "../index";
import type {
  DateTimeRangePresetKey,
  DateTimeRangeValue,
} from "../types";
import { useRangeFieldValidation } from "./useRangeFieldValidation";
import "./DateTimeRangeExample.css";

const EXAMPLE_TEXT = {
  "pl-PL": {
    subtitle:
      "Zakres dat oparty na dwóch kontrolkach DateTimePicker. Limity: maxRangeDays, maxRangeHours, maxRangeMinutes, maxRangeMonths. Prop precision włącza liczenie od dokładnego momentu startu. Prop showPresets dodaje combobox z gotowymi okresami. Prop showFlexDates dodaje combobox z elastycznymi opcjami dat (jak Booking.com). Walidacja formatu i kolejności dat z Toastem — wpisz błędną wartość i zatwierdź pole (Enter lub blur).",
    none: "brak",
    noneSetStart: "brak (ustaw datę początkową)",
    customPreset: "niestandardowy",
    arrival: "Przyjazd",
    departure: "Wyjazd",
    fromToast: "Od (Toast)",
    toToast: "Do (Toast)",
    dateFrom: "Data od",
    dateTo: "Data do",
    fromMax3: "Od (max 3 dni)",
    toMax3: "Do (max 3 dni)",
    fromPrecision: "Od (precision)",
    toPrecision: "Do (precision)",
    fromMax6h: "Od (max 6 h)",
    toMax6h: "Do (max 6 h)",
    value: "Wartość:",
    flexibility: "Elastyczność:",
    flexibilityDays: "dni",
    payload: "Payload API:",
    selectedPreset: "Wybrany preset:",
    startUtc: "Start UTC:",
    endUtc: "Koniec UTC:",
    maxEndUtc: "Max koniec UTC (2 doby od startu):",
    limit3Days: "— limit 3 dni kalendarzowe",
    limit6Hours: "— limit 6 godzin",
    precisionHint: "Np. start 15.07.2026 02:00:00.000 → max 17.07.2026 02:00:00.000",
  },
  "en-US": {
    subtitle:
      "Date range built from two DateTimePicker controls. Limits: maxRangeDays, maxRangeHours, maxRangeMinutes, maxRangeMonths. The precision prop counts from the exact start moment. showPresets adds a preset combobox. showFlexDates adds flexible date options (like Booking.com). Format and order validation via Toast — enter an invalid value and confirm the field (Enter or blur).",
    none: "none",
    noneSetStart: "none (set start date)",
    customPreset: "custom",
    arrival: "Check-in",
    departure: "Check-out",
    fromToast: "From (Toast)",
    toToast: "To (Toast)",
    dateFrom: "From date",
    dateTo: "To date",
    fromMax3: "From (max 3 days)",
    toMax3: "To (max 3 days)",
    fromPrecision: "From (precision)",
    toPrecision: "To (precision)",
    fromMax6h: "From (max 6 h)",
    toMax6h: "To (max 6 h)",
    value: "Value:",
    flexibility: "Flexibility:",
    flexibilityDays: "days",
    payload: "API payload:",
    selectedPreset: "Selected preset:",
    startUtc: "Start UTC:",
    endUtc: "End UTC:",
    maxEndUtc: "Max end UTC (2 days from start):",
    limit3Days: "— 3 calendar days limit",
    limit6Hours: "— 6 hours limit",
    precisionHint: "E.g. start 2026-07-15 02:00:00.000 → max 2026-07-17 02:00:00.000",
  },
} as const;

type DateTimeRangeExampleProps = {
  locale?: SupportedLocale;
};

function formatRangeValue(
  value: DateTimeRangeValue,
  mode: "date" | "datetime",
  locale: SupportedLocale,
  noneLabel: string,
) {
  const formatDate = (date: Date | null) => {
    if (!date) return noneLabel;
    if (mode === "date") return date.toLocaleDateString(locale);
    return date.toISOString();
  };

  return `${formatDate(value.start)} → ${formatDate(value.end)}`;
}

function formatMaxEnd(start: Date | null, noneLabel: string, noneSetStartLabel: string) {
  if (!start) return noneSetStartLabel;

  const maxEnd = getMaxEndForStart(
    start,
    { maxRangeDays: 2, precision: true },
    "datetime",
  );

  return maxEnd ? serializeBackendUtc(maxEnd) : noneLabel;
}

export function DateTimeRangeExample({ locale = "pl-PL" }: DateTimeRangeExampleProps) {
  const text = EXAMPLE_TEXT[locale];
  const { toastElement, showError } = useAppToast();
  const toastValidation = useRangeFieldValidation(showError, locale);

  const [toastRange, setToastRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [dateRange, setDateRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [datetimeRange, setDatetimeRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [preciseRange, setPreciseRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [limitedRange, setLimitedRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [precisionRange, setPrecisionRange] = useState<DateTimeRangeValue>({
    start: new Date("2026-07-15T02:00:00.000Z"),
    end: null,
  });

  const [hoursRange, setHoursRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  const [presetsRange, setPresetsRange] = useState<DateTimeRangeValue>(() =>
    getPresetRange("lastMonth", "UTC"),
  );
  const [selectedPreset, setSelectedPreset] =
    useState<DateTimeRangePresetKey | null>("lastMonth");

  const [flexRange, setFlexRange] = useState<DateTimeRangeValue>({
    start: new Date("2026-08-02"),
    end: new Date("2026-08-06"),
    flexibility: 0,
  });

  const flexPayload = serializeFlexRange(flexRange, "UTC");
  const formatValue = (value: DateTimeRangeValue, mode: "date" | "datetime" = "datetime") =>
    formatRangeValue(value, mode, locale, text.none);

  return (
    <>
      {toastElement}

      <section className="feature-example dtr-example">
        <header className="feature-example-intro">
          <h1>DateTimeRange</h1>
          <p className="feature-example-subtitle">{text.subtitle}</p>
        </header>

        <div className="feature-example-stack">
          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              mode="date"
              value={flexRange}
              onChange={setFlexRange}
              showFlexDates
              startLabel={text.arrival}
              endLabel={text.departure}
              separator={null}
            />
            <p className="selected-value">
              {text.value} {formatValue(flexRange, "date")}
            </p>
            <p className="selected-value">
              {text.flexibility} <code>{flexRange.flexibility ?? 0}</code> {text.flexibilityDays}
            </p>
            <p className="selected-value">
              {text.payload}{" "}
              <code>{flexPayload ? JSON.stringify(flexPayload) : text.none}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              value={toastRange}
              onChange={setToastRange}
              startLabel={text.fromToast}
              endLabel={text.toToast}
              error={toastValidation.error}
              onValidationChange={toastValidation.onValidationChange}
              showBorderFieldWhenError
              showPresets
            />
            <p className="selected-value">
              {text.value} <code>{formatValue(toastRange)}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              value={presetsRange}
              onChange={setPresetsRange}
              preset={selectedPreset}
              onPresetChange={setSelectedPreset}
              showPresets
              separator={null}
            />
            <p className="selected-value">
              {text.value} <code>{formatValue(presetsRange)}</code>
            </p>
            <p className="selected-value">
              {text.selectedPreset} <code>{selectedPreset ?? text.customPreset}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              mode="date"
              value={dateRange}
              onChange={setDateRange}
              startLabel={text.dateFrom}
              endLabel={text.dateTo}
            />
            <p className="selected-value">
              {text.value} {formatValue(dateRange, "date")}
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange locale={locale} value={datetimeRange} onChange={setDatetimeRange} />
            <p className="selected-value">
              {text.value} <code>{formatValue(datetimeRange)}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              value={preciseRange}
              onChange={setPreciseRange}
              showPresets
            />
            <p className="selected-value">
              {text.startUtc}{" "}
              <code>
                {preciseRange.start
                  ? serializeBackendUtc(preciseRange.start)
                  : text.none}
              </code>
            </p>
            <p className="selected-value">
              {text.endUtc}{" "}
              <code>
                {preciseRange.end
                  ? serializeBackendUtc(preciseRange.end)
                  : text.none}
              </code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              mode="date"
              value={limitedRange}
              onChange={setLimitedRange}
              startLabel={text.fromMax3}
              endLabel={text.toMax3}
              maxRangeDays={3}
            />
            <p className="selected-value">
              {text.value} {formatValue(limitedRange, "date")} {text.limit3Days}
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              value={precisionRange}
              onChange={setPrecisionRange}
              startLabel={text.fromPrecision}
              endLabel={text.toPrecision}
              showSeconds
              showMilliseconds
              maxRangeDays={2}
              precision
            />
            <p className="selected-value">
              {text.value} <code>{formatValue(precisionRange)}</code>
            </p>
            <p className="selected-value">
              {text.startUtc}{" "}
              <code>
                {precisionRange.start
                  ? serializeBackendUtc(precisionRange.start)
                  : text.none}
              </code>
            </p>
            <p className="selected-value">
              {text.maxEndUtc}{" "}
              <code>{formatMaxEnd(precisionRange.start, text.none, text.noneSetStart)}</code>
            </p>
            <p className="selected-value">{text.precisionHint}</p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              locale={locale}
              value={hoursRange}
              onChange={setHoursRange}
              startLabel={text.fromMax6h}
              endLabel={text.toMax6h}
              maxRangeHours={6}
            />
            <p className="selected-value">
              {text.value} <code>{formatValue(hoursRange)}</code> {text.limit6Hours}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

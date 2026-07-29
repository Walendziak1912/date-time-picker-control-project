import { useState } from "react";

import { useAppToast } from "../../../hooks/useAppToast";
import { serializeBackendUtc } from "../../DateTimePicker";
import { DateTimeRange, getMaxEndForStart, getPresetRange } from "../index";
import type { DateTimeRangePresetKey, DateTimeRangeValue } from "../types";
import { useRangeFieldValidation } from "./useRangeFieldValidation";
import "./DateTimeRangeExample.css";
function formatRangeValue(
  value: DateTimeRangeValue,
  mode: "date" | "datetime",
) {
  const formatDate = (date: Date | null) => {
    if (!date) return "brak";
    if (mode === "date") return date.toLocaleDateString("pl-PL");
    return date.toISOString();
  };

  return `${formatDate(value.start)} → ${formatDate(value.end)}`;
}

function formatMaxEnd(start: Date | null) {
  if (!start) return "brak (ustaw datę początkową)";

  const maxEnd = getMaxEndForStart(
    start,
    { maxRangeDays: 2, precision: true },
    "datetime",
  );

  return maxEnd ? serializeBackendUtc(maxEnd) : "brak";
}

export function DateTimeRangeExample() {
  const { toastElement, showError } = useAppToast();
  const toastValidation = useRangeFieldValidation(showError);

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

  return (
    <>
      {toastElement}

      <section className="feature-example dtr-example">
        <header className="feature-example-intro">
          <h1>DateTimeRange</h1>
          <p className="feature-example-subtitle">
            Zakres dat oparty na dwóch kontrolkach DateTimePicker. Limity:{" "}
            <code>maxRangeDays</code>, <code>maxRangeHours</code>,{" "}
            <code>maxRangeMinutes</code>, <code>maxRangeMonths</code>. Prop{" "}
            <code>precision</code> włącza liczenie od dokładnego momentu startu.
            Prop <code>showPresets</code> dodaje combobox z gotowymi okresami.
            Walidacja formatu i kolejności dat z Toastem — wpisz błędną wartość
            i zatwierdź pole (Enter lub blur).
          </p>
        </header>

        <div className="feature-example-stack">
          <div className="feature-example-block">
            <DateTimeRange
              value={toastRange}
              onChange={setToastRange}
              startLabel="Od (Toast)"
              endLabel="Do (Toast)"
              error={toastValidation.error}
              onValidationChange={toastValidation.onValidationChange}
              showBorderFieldWhenError
              showPresets
            />
            <p className="selected-value">
              Wartość: <code>{formatRangeValue(toastRange, "datetime")}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              value={presetsRange}
              onChange={setPresetsRange}
              preset={selectedPreset}
              onPresetChange={setSelectedPreset}
              showPresets
              separator={null}
            />
            <p className="selected-value">
              Wartość: <code>{formatRangeValue(presetsRange, "datetime")}</code>
            </p>
            <p className="selected-value">
              Wybrany preset: <code>{selectedPreset ?? "niestandardowy"}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              mode="date"
              value={dateRange}
              onChange={setDateRange}
              startLabel="Data od"
              endLabel="Data do"
            />
            <p className="selected-value">
              Wartość: {formatRangeValue(dateRange, "date")}
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              value={datetimeRange}
              onChange={setDatetimeRange}
              startLabel="Od"
              endLabel="Do"
            />
            <p className="selected-value">
              Wartość:{" "}
              <code>{formatRangeValue(datetimeRange, "datetime")}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              value={preciseRange}
              onChange={setPreciseRange}
              startLabel="Od"
              endLabel="Do"
              showPresets
            />
            <p className="selected-value">
              Start UTC:{" "}
              <code>
                {preciseRange.start
                  ? serializeBackendUtc(preciseRange.start)
                  : "brak"}
              </code>
            </p>
            <p className="selected-value">
              Koniec UTC:{" "}
              <code>
                {preciseRange.end
                  ? serializeBackendUtc(preciseRange.end)
                  : "brak"}
              </code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              mode="date"
              value={limitedRange}
              onChange={setLimitedRange}
              startLabel="Od (max 3 dni)"
              endLabel="Do (max 3 dni)"
              maxRangeDays={3}
            />
            <p className="selected-value">
              Wartość: {formatRangeValue(limitedRange, "date")} — limit 3 dni
              kalendarzowe
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              value={precisionRange}
              onChange={setPrecisionRange}
              startLabel="Od (precision)"
              endLabel="Do (precision)"
              showSeconds
              showMilliseconds
              maxRangeDays={2}
              precision
            />
            <p className="selected-value">
              Wartość:{" "}
              <code>{formatRangeValue(precisionRange, "datetime")}</code>
            </p>
            <p className="selected-value">
              Start UTC:{" "}
              <code>
                {precisionRange.start
                  ? serializeBackendUtc(precisionRange.start)
                  : "brak"}
              </code>
            </p>
            <p className="selected-value">
              Max koniec UTC (2 doby od startu):{" "}
              <code>{formatMaxEnd(precisionRange.start)}</code>
            </p>
            <p className="selected-value">
              Np. start 15.07.2026 02:00:00.000 → max 17.07.2026 02:00:00.000
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimeRange
              value={hoursRange}
              onChange={setHoursRange}
              startLabel="Od (max 6 h)"
              endLabel="Do (max 6 h)"
              maxRangeHours={6}
            />
            <p className="selected-value">
              Wartość: <code>{formatRangeValue(hoursRange, "datetime")}</code> —
              limit 6 godzin
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

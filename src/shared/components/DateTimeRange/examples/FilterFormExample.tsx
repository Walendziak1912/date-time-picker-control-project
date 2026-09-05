import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  FillRequired,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange, type DateTimeRangeHandle } from "../../DateTimeRange";
import type { DateTimeRangeValidationResult } from "../types";
import type { DateTimeRangeValue } from "../types";

const EMPTY_RANGE: DateTimeRangeValue = { start: null, end: null };

export function FilterFormExample() {
  const [range, setRange] = useState<DateTimeRangeValue>(EMPTY_RANGE);
  const rangeRef = useRef<DateTimeRangeHandle>(null);
  const [lastAction, setLastAction] = useState("-");
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [validationLog, setValidationLog] = useState<string[]>([]);

  const appendValidationLog = (result: DateTimeRangeValidationResult) => {
    const entry = result.valid
      ? `[${new Date().toLocaleTimeString()}] onValidationChange: OK`
      : `[${new Date().toLocaleTimeString()}] onValidationChange: ${result.message ?? result.reason ?? "błąd"}`;

    setValidationLog((prev) => [entry, ...prev].slice(0, 8));
  };

  const handleSubmit = () => {
    setSubmitAttempts((count) => count + 1);
    setLastAction("Wyślij formularz - wywołano ref.validate()");

    const validation = rangeRef.current?.validate() ?? { valid: true };

    if (!validation.valid) {
      setLastAction(
        `Wyślij formularz - walidacja nie przeszła (${validation.message ?? validation.reason})`,
      );
      if (validation.message) {
        toast.error(validation.message);
      }
      return;
    }

    const payload = serializeBackendRange(range);
    setLastAction("Wyślij formularz - walidacja OK, formularz wysłany");
    toast.success(`Wysłano filtry: ${payload ?? "-"}`);
  };

  const handleClearFilters = () => {
    setLastAction("Wyczyść filtry - reset stanu i ref.reset(), bez validate()");
    //setRange(EMPTY_RANGE);
    rangeRef.current?.reset();
    toast.info(`Filtry wyczyszczone ${range.start?.toISOString() ?? null} ${range.end?.toISOString() ?? null}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Formularz filtrów - walidacja przy Wyślij</h4>
      <p className="m-0 text-color-secondary line-height-3">
        Domyślnie walidacja uruchamia się dopiero po kliknięciu{" "}
        <strong>Wyślij formularz</strong> (<code>ref.validate()</code> -
        tryb <code>validationMode="submit"</code>). Po{" "}
        <strong>Wyczyść filtry</strong> wartości i błędy są resetowane (
        <code>ref.reset()</code>) bez ponownej walidacji.
      </p>

      <form
        className="flex flex-column gap-4 align-items-start"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex flex-column gap-2 w-full">
          <label className="font-medium">Zakres dat (wymagany)</label>
          <DateTimeRange
            ref={rangeRef}
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={range}
            onChange={setRange}
            onValidationChange={(result) => {
              appendValidationLog(result);
            }}
            showBorderFieldWhenError
            showTextUnderFieldWhenError
            fillRequired={FillRequired.All}
            validationRules={{
              "both-dates-required":
                "Wybierz datę początkową i końcową w filtrze",
              "start-date-required": "Podaj datę początkową w filtrze",
              "end-date-required": "Podaj datę końcową w filtrze",
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" label="Wyślij formularz" />
          <Button
            type="button"
            label="Wyczyść filtry"
            severity="secondary"
            outlined
            onClick={handleClearFilters}
          />
        </div>
      </form>

      <div className="flex flex-column gap-2 text-sm">
        <p className="m-0">
          Ostatnia akcja: <code>{lastAction}</code>
        </p>
        <p className="m-0">
          Próby wysłania (validate): <code>{submitAttempts}</code>
        </p>
        <p className="m-0">
          Stan UI:{" "}
          <code>
            {JSON.stringify({
              start: range.start?.toISOString() ?? null,
              end: range.end?.toISOString() ?? null,
            })}
          </code>
        </p>
        <p className="m-0">
          Payload API:{" "}
          <code>{serializeBackendRange(range) ?? "null"}</code>
        </p>
        {validationLog.length > 0 && (
          <div className="flex flex-column gap-1">
            <span className="font-medium">Log onValidationChange:</span>
            <ul className="m-0 pl-3">
              {validationLog.map((entry) => (
                <li key={entry}>
                  <code>{entry}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

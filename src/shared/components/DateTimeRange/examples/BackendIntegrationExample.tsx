import { useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { DateTimePickerPrecision, parseBackendRange, serializeBackendRange } from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

const BACKEND_RANGE_SAMPLE =
  "2026-08-01T00:00:00.000Z , 2026-08-07T23:59:59.999Z";

export function BackendIntegrationExample() {
  const [backendPayload, setBackendPayload] = useState(BACKEND_RANGE_SAMPLE);
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });

  const handleLoadFromBackend = () => {
    const { start, end } = parseBackendRange(backendPayload);
    setRange({ start, end });
  };

  const handleSaveToBackend = () => {
    const payload = serializeBackendRange(range);
    if (!payload) {
      toast.error("Uzupełnij obie daty zakresu przed zapisem");
      return;
    }

    setBackendPayload(payload);
    toast.success(`Zapisano: ${payload}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Wczytanie i zapis zakresu z backendu</h4>
      <p className="m-0 text-color-secondary">
        Backend trzyma string <code>start , end</code> w UTC. Komponent zwraca
        znormalizowany zakres
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          label="Wczytaj z backendu"
          onClick={handleLoadFromBackend}
        />
        <Button
          type="button"
          label="Zapisz do backendu"
          outlined
          onClick={handleSaveToBackend}
        />
      </div>
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={range}
        onChange={setRange}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        showBorderFieldWhenError
      />
      <p className="m-0 text-sm">
        String z API: <code>{backendPayload}</code>
      </p>
      <p className="m-0 text-sm">
        Stan UI:{" "}
        <code>
          {JSON.stringify({
            start: range.start?.toISOString() ?? null,
            end: range.end?.toISOString() ?? null,
          })}
        </code>
      </p>
    </div>
  );
}

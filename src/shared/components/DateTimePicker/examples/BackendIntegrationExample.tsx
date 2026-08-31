import { useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  parseBackendRange,
  serializeBackendRange,
  type DateBoundsRange,
} from "../../DateTimePicker";

const BACKEND_DATE_SAMPLE =
  "2026-08-16T00:00:00.000Z , 2026-08-16T23:59:59.999Z";

export function BackendIntegrationExample() {
  const [backendPayload, setBackendPayload] = useState(BACKEND_DATE_SAMPLE);
  const [value, setValue] = useState<DateBoundsRange>({
    start: null,
    end: null,
  });

  const handleLoadFromBackend = () => {
    const { start, end } = parseBackendRange(backendPayload);
    setValue({ start, end });
  };

  const handleSaveToBackend = () => {
    const payload = serializeBackendRange(value);
    if (!payload) {
      toast.error("Wybierz datę przed zapisem");
      return;
    }

    setBackendPayload(payload);
    toast.success(`Zapisano: ${payload}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Wczytanie i zapis daty z backendu</h4>
      <p className="m-0 text-color-secondary">
        Komponent domyślnie zwraca pełny zakres <code>{"{ start, end }"}</code>.
        Przy wczytywaniu używaj <code>parseBackendRange</code>, a przy zapisie
        serializuj <code>start</code> i <code>end</code> ze stanu.
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
      <DateTimePicker
        dateTimePrecisions={[
          DateTimePickerPrecision.Date,
          DateTimePickerPrecision.TimeMilliseconds,
        ]}
        value={value}
        onChange={setValue}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        
      />
      <p className="m-0 text-sm">
        String z API: <code>{backendPayload}</code>
      </p>
      <p className="m-0 text-sm">
        Stan komponentu:{" "}
        <code>
          {JSON.stringify({
            start: value.start?.toISOString() ?? null,
            end: value.end?.toISOString() ?? null,
          })}
        </code>
      </p>
    </div>
  );
}

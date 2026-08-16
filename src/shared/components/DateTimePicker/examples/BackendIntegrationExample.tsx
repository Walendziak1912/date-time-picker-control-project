import { useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";
import {
  parseBackendRange,
  serializeBackendRange,
} from "../../../utils/dateUtils";

const BACKEND_DATE_SAMPLE =
  "2026-08-16T00:00:00.000Z , 2026-08-16T23:59:59.999Z";

export function BackendIntegrationExample() {
  const [backendPayload, setBackendPayload] = useState(BACKEND_DATE_SAMPLE);
  const [value, setValue] = useState<Date | null>(null);
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    DateTimePickerPrecision.Date,
  );

  const handleLoadFromBackend = () => {
    const { start } = parseBackendRange(backendPayload);
    setValue(start);
  };

  const handleSaveToBackend = () => {
    if (!value) {
      toast.error("Wybierz datę przed zapisem");
      return;
    }

    const payload = serializeBackendRange({ start: value, precision });
    setBackendPayload(payload);
    toast.success(`Zapisano: ${payload}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Wczytanie i zapis daty z backendu</h4>
      <p className="m-0 text-color-secondary">
        Backend dla operatora też zwraca zakres <code>start , end</code>. Przy
        wczytywaniu używaj <code>start</code> z <code>parseBackendRange</code>, a
        przy zapisie wołaj <code>serializeBackendRange</code>.
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
        onChange={(date, context) => {
          setValue(date);
          if (context.precision) {
            setPrecision(context.precision);
          }
        }}
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
        Stan UI: <code>{value?.toISOString() ?? "null"}</code>
      </p>
      <p className="m-0 text-sm">
        Payload API:{" "}
        <code>
          {value ? serializeBackendRange({ start: value, precision }) : "null"}
        </code>
      </p>
    </div>
  );
}

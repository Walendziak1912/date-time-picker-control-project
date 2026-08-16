import { useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  FillRequired,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";
import { serializeBackendRange } from "../../../utils/dateUtils";

export function SimpleFormExample() {
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    DateTimePickerPrecision.Date,
  );

  const handleSave = () => {
    const payload =
      range.start && range.end
        ? serializeBackendRange({
            start: range.start,
            end: range.end,
            precision,
          })
        : null;

    toast.success(`Zapisano: ${payload ?? " -"}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Formularz bez ref — tylko useState + onChange</h4>
      <p className="m-0 text-color-secondary">
        Wariant bez ref i validate() przy Zapisz. Wartość trzymana w stanie
        rodzica. Błędy pokazują się po interakcji z polem (blur), przez
        onValidationChange.
      </p>
      <form
        className="flex flex-column gap-3 align-items-start"
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <div className="flex flex-column gap-2 w-full">
          <label className="font-medium">Zakres dat (opcjonalny)</label>
          <DateTimeRange
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={range}
            onChange={(next, context) => {
              setRange(next);
              if (context.change.precision) {
                setPrecision(context.change.precision);
              }
            }}
            onValidationChange={(result) => {
              if (!result.valid && result.message) {
                toast.error(result.message);
              }
            }}
            showBorderFieldWhenError
            fillRequired={FillRequired.All}
          />
        </div>
        <Button type="submit" label="Zapisz" />
      </form>
      <p className="m-0 text-sm">
        Stan UI:{" "}
        <code>
          {JSON.stringify({
            start: range.start?.toISOString() ?? null,
            end: range.end?.toISOString() ?? null,
          })}
        </code>
      </p>
      <p className="m-0 text-sm">
        Payload API:{" "}
        <code>
          {range.start && range.end
            ? serializeBackendRange({
                start: range.start,
                end: range.end,
                precision,
              })
            : "null"}
        </code>
      </p>
    </div>
  );
}

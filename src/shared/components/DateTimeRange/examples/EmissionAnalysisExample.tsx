import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

const emissionDate = new Date("2026-07-29T12:00:00");
const emissionMinDateTime = new Date(
  emissionDate.getTime() - 48 * 60 * 60 * 1000,
);

export function EmissionAnalysisExample() {
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: new Date(emissionDate.getTime() - 24 * 60 * 60 * 1000),
    end: emissionDate,
  });

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Analiza do 48h wstecz od daty emisji</h4>
      <p className="m-0 text-color-secondary">
        Data emisji: <code>{emissionDate.toISOString()}</code> dozwolony
        zakres od <code>{emissionMinDateTime.toISOString()}</code> do{" "}
        <code>{emissionDate.toISOString()}</code>
      </p>
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
        value={range}
        onChange={setRange}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        showBorderFieldWhenError
        minDateTime={emissionMinDateTime}
        maxDateTime={emissionDate}
        maxRangeHours={48}
      />
      <p className="m-0 text-sm">
        Stan UI:{" "}
        <code>
          {range.start?.toISOString() ?? "null"} –{" "}
          {range.end?.toISOString() ?? "null"}
        </code>
      </p>
      <p className="m-0 text-sm">
        Payload API:{" "}
        <code>
          {serializeBackendRange(range) ?? "null"}
        </code>
      </p>
    </div>
  );
}

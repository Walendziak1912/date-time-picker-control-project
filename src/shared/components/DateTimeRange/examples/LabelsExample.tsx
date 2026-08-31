import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

function RangeLabelsExample({
  title,
  description,
  startLabel,
  endLabel,
}: {
  title: string;
  description: string;
  startLabel?: string;
  endLabel?: string;
}) {
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">{title}</h4>
      <p className="m-0 text-color-secondary">{description}</p>
      <DateTimeRange
        dateTimePrecisions={DateTimePickerPrecision.DateTime}
        value={range}
        onChange={setRange}
        startLabel={startLabel}
        endLabel={endLabel}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        showBorderFieldWhenError
      />
      <p className="m-0 text-sm">
        Payload API: <code>{serializeBackendRange(range) ?? "null"}</code>
      </p>
    </div>
  );
}

export function DefaultLabelsExample() {
  return (
    <RangeLabelsExample
      title="Domyślne etykiety (Od / Do)"
      description="Bez startLabel i endLabel komponent używa etykiet z locale (pl: Od, Do)."
    />
  );
}

export function CustomLabelsExample() {
  return (
    <RangeLabelsExample
      title="Własne etykiety pól"
      description="Prop startLabel i endLabel nadpisują domyślne opisy nad polami wyboru daty."
      startLabel="Data rozpoczęcia"
      endLabel="Data zakończenia"
    />
  );
}

import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

function RangeExample({
  title,
  dateTimePrecisions,
  maxRangeDays,
}: {
  title: string;
  dateTimePrecisions: Parameters<
    typeof DateTimeRange
  >[0]["dateTimePrecisions"];
  maxRangeDays?: number;
}) {
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">{title}</h4>
      <DateTimeRange
        dateTimePrecisions={dateTimePrecisions}
        value={range}
        onChange={setRange}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        showBorderFieldWhenError
        maxRangeDays={maxRangeDays}
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

export function SecondsRangeExample() {
  return (
    <RangeExample
      title="Zakres dat z sekundami"
      dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
    />
  );
}

export function MillisecondsRangeExample() {
  return (
    <RangeExample
      title="Zakres dat z milisekundami"
      dateTimePrecisions={DateTimePickerPrecision.DateTimeMilliseconds}
    />
  );
}

export function MaxRangeDaysExample() {
  return (
    <RangeExample
      title="Zakres z milisekundami + limit 3 dni"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTimeMilliseconds,
      ]}
      maxRangeDays={3}
    />
  );
}

export function TimeOnlyRangeExample() {
  return (
    <RangeExample
      title="Zakres sam czas z sekundami"
      dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
    />
  );
}

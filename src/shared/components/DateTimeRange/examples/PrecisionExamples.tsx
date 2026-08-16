import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";
import { serializeBackendRange } from "../../../utils/dateUtils";

function RangeDemo({
  title,
  dateTimePrecisions,
  useEndOfDayAsRangeEnd,
}: {
  title: string;
  dateTimePrecisions: Parameters<typeof DateTimeRange>[0]["dateTimePrecisions"];
  useEndOfDayAsRangeEnd?: boolean;
}) {
  const [range, setRange] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    (Array.isArray(dateTimePrecisions)
      ? dateTimePrecisions[0]
      : dateTimePrecisions) ?? DateTimePickerPrecision.Date,
  );

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">{title}</h4>
      <DateTimeRange
        dateTimePrecisions={dateTimePrecisions}
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
        useEndOfDayAsRangeEnd={useEndOfDayAsRangeEnd}
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

export function PrecisionSwitchExample() {
  return (
    <RangeDemo
      title="Przełącznik precyzji — 2 tryby (data / data + czas ms), domyślnie pełny dzień"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTimeMilliseconds,
      ]}
    />
  );
}

export function UseEndOfDayExample() {
  return (
    <RangeDemo
      title="Przełącznik precyzji — bieżąca godzina w polu końcowym (useEndOfDayAsRangeEnd=false)"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTimeMilliseconds,
        DateTimePickerPrecision.TimeSeconds,
      ]}
      useEndOfDayAsRangeEnd={false}
    />
  );
}

export function MultiPrecisionExample() {
  return (
    <RangeDemo
      title="Przełącznik precyzji — więcej niż 2 tryby (dropdown)"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTime,
        DateTimePickerPrecision.DateTimeSeconds,
        DateTimePickerPrecision.DateTimeMilliseconds,
      ]}
    />
  );
}

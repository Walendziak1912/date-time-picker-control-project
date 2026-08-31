import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

function RangeWithExtras({
  title,
  dateTimePrecisions,
  showPresets,
  showFlexDates,
}: {
  title: string;
  dateTimePrecisions: Parameters<
    typeof DateTimeRange
  >[0]["dateTimePrecisions"];
  showPresets?: boolean;
  showFlexDates?: boolean;
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
        showPresets={showPresets}
        showFlexDates={showFlexDates}
      />
      <p className="m-0 text-sm">
        Stan UI: <code>{JSON.stringify(range)}</code>
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

export function PresetsExample() {
  return (
    <RangeWithExtras
      title="Zakres z presetem"
      dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
      showPresets
    />
  );
}

export function FlexDatesExample() {
  return (
    <RangeWithExtras
      title='Zakres "booking" (flex dates)'
      dateTimePrecisions={[
        DateTimePickerPrecision.DateTimeMilliseconds,
        DateTimePickerPrecision.Date,
      ]}
      showFlexDates
    />
  );
}

import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";
import { serializeBackendRange } from "../../../utils/dateUtils";

function PickerDemo({
  title,
  dateTimePrecisions,
  selectedDateTimePrecision,
  onDateTimePrecisionChange,
}: {
  title: string;
  dateTimePrecisions: Parameters<
    typeof DateTimePicker
  >[0]["dateTimePrecisions"];
  selectedDateTimePrecision?: DateTimePickerPrecisionValue;
  onDateTimePrecisionChange?: (precision: DateTimePickerPrecisionValue) => void;
}) {
  const [value, setValue] = useState<Date | null>(null);
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    selectedDateTimePrecision ?? DateTimePickerPrecision.Date,
  );

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">{title}</h4>
      <DateTimePicker
        dateTimePrecisions={dateTimePrecisions}
        selectedDateTimePrecision={selectedDateTimePrecision ?? precision}
        onDateTimePrecisionChange={
          onDateTimePrecisionChange ?? ((next) => setPrecision(next))
        }
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
        showBorderFieldWhenError
      />
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

export function PrecisionSwitchTwoModesExample() {
  return (
    <PickerDemo
      title="Przełącznik precyzji — 2 tryby (data / data + czas ms)"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTimeMilliseconds,
      ]}
    />
  );
}

export function PrecisionDropdownExample() {
  return (
    <PickerDemo
      title="Przełącznik precyzji — 4 tryby (dropdown)"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTime,
        DateTimePickerPrecision.DateTimeSeconds,
        DateTimePickerPrecision.DateTimeMilliseconds,
      ]}
    />
  );
}

export function ControlledPrecisionExample() {
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    DateTimePickerPrecision.Date,
  );

  return (
    <PickerDemo
      title="Przełącznik precyzji — tryb kontrolowany"
      dateTimePrecisions={[
        DateTimePickerPrecision.Date,
        DateTimePickerPrecision.DateTime,
      ]}
      selectedDateTimePrecision={precision}
      onDateTimePrecisionChange={setPrecision}
    />
  );
}

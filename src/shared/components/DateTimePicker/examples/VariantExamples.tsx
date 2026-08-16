import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  FillRequired,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";

function PickerVariantExample({
  title,
  dateTimePrecisions,
  showBorderFieldWhenError,
  fillRequired,
  timeVariant,
}: {
  title: string;
  dateTimePrecisions: Parameters<
    typeof DateTimePicker
  >[0]["dateTimePrecisions"];
  showBorderFieldWhenError?: boolean;
  fillRequired?: Parameters<typeof DateTimePicker>[0]["fillRequired"];
  timeVariant?: "digital" | "analog";
}) {
  const [value, setValue] = useState<Date | null>(null);
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    (Array.isArray(dateTimePrecisions)
      ? dateTimePrecisions[0]
      : dateTimePrecisions) ?? DateTimePickerPrecision.Date,
  );

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">{title}</h4>
      <DateTimePicker
        dateTimePrecisions={dateTimePrecisions}
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
        showBorderFieldWhenError={showBorderFieldWhenError}
        fillRequired={fillRequired}
        timeVariant={timeVariant}
        validationRules={
          fillRequired
            ? {
                "date-required": "Proszę wybrać datę",
                "date-format": "Wpisz datę w formacie dd.MM.yyyy",
              }
            : undefined
        }
      />
      <p className="m-0 text-sm">
        Wartość: <code>{value?.toISOString() ?? "null"}</code>
      </p>
      <p className="m-0 text-sm">
        Precyzja: <code>{precision}</code>
      </p>
    </div>
  );
}

export function DateTimeExample() {
  return (
    <PickerVariantExample
      title="Data + czas (dd.MM.yyyy HH:mm)"
      dateTimePrecisions={DateTimePickerPrecision.DateTime}
      showBorderFieldWhenError
    />
  );
}

export function DateTimeSecondsExample() {
  return (
    <PickerVariantExample
      title="Data + czas z sekundami (dd.MM.yyyy HH:mm:ss)"
      dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
    />
  );
}

export function DateTimeMillisecondsExample() {
  return (
    <PickerVariantExample
      title="Data + czas z milisekundami (dd.MM.yyyy HH:mm:ss.SSS)"
      dateTimePrecisions={DateTimePickerPrecision.DateTimeMilliseconds}
    />
  );
}

export function DateOnlyExample() {
  return (
    <PickerVariantExample
      title="Sama data"
      dateTimePrecisions={DateTimePickerPrecision.Date}
    />
  );
}

export function TimeExample() {
  return (
    <PickerVariantExample
      title="Sam czas (HH:mm)"
      dateTimePrecisions={DateTimePickerPrecision.Time}
    />
  );
}

export function TimeSecondsExample() {
  return (
    <PickerVariantExample
      title="Sam czas (HH:mm:ss)"
      dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
    />
  );
}

export function TimeMillisecondsExample() {
  return (
    <PickerVariantExample
      title="Sam czas (HH:mm:ss.SSS)"
      dateTimePrecisions={DateTimePickerPrecision.TimeMilliseconds}
    />
  );
}

export function DigitalClockExample() {
  return (
    <PickerVariantExample
      title="Sam czas (HH:mm:ss) — zegar cyfrowy"
      dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
      timeVariant="digital"
    />
  );
}

export function RequiredDateExample() {
  return (
    <PickerVariantExample
      title="Data wymagana (fillRequired=All) — błąd w toaście"
      dateTimePrecisions={DateTimePickerPrecision.Date}
      showBorderFieldWhenError
      fillRequired={FillRequired.All}
    />
  );
}

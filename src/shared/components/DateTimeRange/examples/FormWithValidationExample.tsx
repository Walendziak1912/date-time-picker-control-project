import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  FillRequired,
  serializeBackendRange,
} from "../../DateTimePicker";
import { DateTimeRange, type DateTimeRangeHandle } from "../../DateTimeRange";
import type { DateTimeRangeValue } from "../types";

export function FormWithValidationExample() {
  const [rangeAll, setRangeAll] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });
  const [rangeMaxDays, setRangeMaxDays] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });
  const [rangeStartOnly, setRangeStartOnly] = useState<DateTimeRangeValue>({
    start: null,
    end: null,
  });

  const rangeAllRef = useRef<DateTimeRangeHandle>(null);
  const rangeStartRef = useRef<DateTimeRangeHandle>(null);
  const rangeMaxDaysRef = useRef<DateTimeRangeHandle>(null);

  const onValidationError = (result: { valid: boolean; message?: string }) => {
    if (!result.valid && result.message) {
      toast.error(result.message);
    }
  };

  const handleFormSave = () => {
    const rangeAllValidation = rangeAllRef.current?.validate() ?? {
      valid: true,
    };
    const rangeMaxDaysValidation = rangeMaxDaysRef.current?.validate() ?? {
      valid: true,
    };
    const rangeStartValidation = rangeStartRef.current?.validate() ?? {
      valid: true,
    };

    if (
      !rangeAllValidation.valid ||
      !rangeMaxDaysValidation.valid ||
      !rangeStartValidation.valid
    ) {
      return;
    }

    const payload = serializeBackendRange(rangeAll);

    toast.success(`Zapisano: ${payload ?? " -"}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Formularz z walidacją przy Zapisz</h4>
      <form
        className="flex flex-column gap-4 align-items-start"
        onSubmit={(event) => {
          event.preventDefault();
          handleFormSave();
        }}
      >
        <div className="flex flex-column gap-2 w-full">
          <label className="font-medium">Zakres dat (fillRequired=All)</label>
          <DateTimeRange
            ref={rangeAllRef}
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={rangeAll}
            onChange={setRangeAll}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            fillRequired={FillRequired.All}
            validationRules={{
              "both-dates-required": "Wybierz datę początkową i końcową eventu",
              "start-date-required": "Podaj datę początkową eventu",
              "end-date-required": "Podaj datę końcową eventu",
            }}
          />
        </div>
        <div className="flex flex-column gap-2 w-full">
          <label className="font-medium">
            Zakres dat wymagany z ograniczeniem do 5 dni
          </label>
          <DateTimeRange
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            ref={rangeMaxDaysRef}
            value={rangeMaxDays}
            onChange={setRangeMaxDays}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            maxRangeDays={5}
            fillRequired={FillRequired.All}
          />
        </div>
        <div className="flex flex-column gap-2 w-full">
          <label className="font-medium">
            Zakres dat z wymaganą datą początkową (fillRequired=StartDate)
          </label>
          <DateTimeRange
            ref={rangeStartRef}
            dateTimePrecisions={DateTimePickerPrecision.Date}
            value={rangeStartOnly}
            onChange={setRangeStartOnly}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
        </div>
        <Button type="submit" label="Zapisz" />
      </form>
      <p className="m-0 text-sm">
        Stan UI:{" "}
        <code>
          {JSON.stringify({
            rangeAll: {
              start: rangeAll.start?.toISOString() ?? null,
              end: rangeAll.end?.toISOString() ?? null,
            },
            rangeMaxDays: {
              start: rangeMaxDays.start?.toISOString() ?? null,
              end: rangeMaxDays.end?.toISOString() ?? null,
            },
            rangeStartOnly: {
              start: rangeStartOnly.start?.toISOString() ?? null,
              end: rangeStartOnly.end?.toISOString() ?? null,
            },
          })}
        </code>
      </p>
      <p className="m-0 text-sm">
        Payload API (rangeAll):{" "}
        <code>{serializeBackendRange(rangeAll) ?? "null"}</code>
      </p>
    </div>
  );
}

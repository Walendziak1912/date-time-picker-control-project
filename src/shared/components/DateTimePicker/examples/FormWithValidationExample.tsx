import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  FillRequired,
  type DateTimePickerHandle,
  type DateTimePickerPrecisionValue,
} from "../../DateTimePicker";
import { serializeBackendRange } from "../../../utils/dateUtils";

export function FormWithValidationExample() {
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [formDatePrecision, setFormDatePrecision] =
    useState<DateTimePickerPrecisionValue>(DateTimePickerPrecision.Date);
  const formDateRef = useRef<DateTimePickerHandle>(null);

  const handleFormSave = () => {
    const validation = formDateRef.current?.validate() ?? { valid: true };
    if (!validation.valid) {
      return;
    }

    const payload = formDate
      ? serializeBackendRange({ start: formDate, precision: formDatePrecision })
      : null;

    toast.success(`Zapisano: ${payload ?? " -"}`);
  };

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Formularz z walidacją przy Zapisz</h4>
      <form
        className="flex flex-column gap-3 align-items-start"
        onSubmit={(event) => {
          event.preventDefault();
          handleFormSave();
        }}
      >
        <div className="flex flex-column gap-2">
          <label className="font-medium">Data</label>
          <DateTimePicker
            ref={formDateRef}
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
            ]}
            value={formDate}
            onChange={(date, context) => {
              setFormDate(date);
              if (context.precision) {
                setFormDatePrecision(context.precision);
              }
            }}
            onValidationChange={(result) => {
              if (!result.valid && result.message) {
                toast.error(result.message);
              }
            }}
            showBorderFieldWhenError
            fillRequired={FillRequired.All}
            validationRules={{
              "date-required": "Proszę podać datę",
              "date-format": "Wpisz poprawną datę w formacie dd.MM.yyyy",
            }}
          />
        </div>
        <Button type="submit" label="Zapisz" />
      </form>
      <p className="m-0 text-sm">
        Stan UI: <code>{formDate?.toISOString() ?? "null"}</code>
      </p>
      <p className="m-0 text-sm">
        Payload API:{" "}
        <code>
          {formDate
            ? serializeBackendRange({
                start: formDate,
                precision: formDatePrecision,
              })
            : "null"}
        </code>
      </p>
    </div>
  );
}

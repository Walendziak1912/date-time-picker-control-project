import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  FillRequired,
  serializeBackendRange,
  type DateBoundsRange,
  type DateTimePickerHandle,
} from "../../DateTimePicker";

export function FormWithValidationExample() {
  const [formDate, setFormDate] = useState<DateBoundsRange>({
    start: null,
    end: null,
  });
  const formDateRef = useRef<DateTimePickerHandle>(null);

  const handleFormSave = () => {
    const validation = formDateRef.current?.validate() ?? { valid: true };
    if (!validation.valid) {
      return;
    }

    const payload = serializeBackendRange(formDate);

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
            onChange={setFormDate}
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
        Stan UI:{" "}
        <code>
          {JSON.stringify({
            start: formDate.start?.toISOString() ?? null,
            end: formDate.end?.toISOString() ?? null,
          })}
        </code>
      </p>
    </div>
  );
}

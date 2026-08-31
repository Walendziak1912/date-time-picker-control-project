import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  FillRequired,
  type DateBoundsRange,
} from "../../DateTimePicker";

export function LabelExample() {
  const [value, setValue] = useState<DateBoundsRange>({
    start: null,
    end: null,
  });

  return (
    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">
      <h4 className="m-0">Etykieta pola (label)</h4>
      <p className="m-0 text-color-secondary">
        Prop label wyświetla opis nad polem wyboru daty i jest powiązany z
        inputem (htmlFor / aria-labelledby).
      </p>
      <DateTimePicker
        label="Data urodzenia"
        dateTimePrecisions={DateTimePickerPrecision.Date}
        value={value}
        onChange={setValue}
        onValidationChange={(result) => {
          if (!result.valid && result.message) {
            toast.error(result.message);
          }
        }}
        showBorderFieldWhenError
        fillRequired={FillRequired.All}
      />
      <p className="m-0 text-sm">
        Wartość: <code>{value.start?.toISOString() ?? "null"}</code>
      </p>
    </div>
  );
}

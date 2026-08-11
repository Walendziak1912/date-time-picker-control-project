import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  FillRequired,
  type DateTimePickerHandle,
  type DateTimePickerPrecisionValue,
} from "../../../components/DateTimePicker";

const eventCategoryOptions = [
  { label: "Spotkanie", value: "meeting" },
  { label: "Szkolenie", value: "training" },
  { label: "Inne", value: "other" },
];

type EventFormState = {
  title: string;
  category: string | null;
  date: Date | null;
};

const initialEventFormState: EventFormState = {
  title: "",
  category: null,
  date: null,
};

const onValidationError = (result: { valid: boolean; message?: string }) => {
  if (!result.valid) {
    toast.error(result.message);
  }
};

export const ExampleDateTimePicker: React.FC = () => {
  const [datetime, setDatetime] = useState<Date | null>(new Date());
  const [precision, setPrecision] = useState<DateTimePickerPrecisionValue>(
    DateTimePickerPrecision.Date,
  );
  const [eventForm, setEventForm] = useState<EventFormState>(
    initialEventFormState,
  );
  const eventDateRef = useRef<DateTimePickerHandle>(null);

  const handleEventFormSave = () => {
    const validation = eventDateRef.current?.validate() ?? { valid: true };
    if (!validation.valid) {
      return;
    }

    toast.success(
      `Zapisano wydarzenie: "${eventForm.title || "(bez tytułu)"}", kategoria: ${eventForm.category ?? "-"}, data: ${eventForm.date?.toISOString() ?? "-"}`,
    );
  };

  const handleEventFormCancel = () => {
    setEventForm(initialEventFormState);
    toast.info("Formularz anulowany — przywrócono wartości początkowe");
  };

  return (
    <>
      <section>
        <header>
          <h1>DateTimePicker</h1>
        </header>
        <div>
          <h4>
            Przykładowy formularz PrimeReact z data, input, dropdown, zapisz i
            anuluj
          </h4>
          <form
            className="p-fluid example-prime-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleEventFormSave();
            }}
          >
            <div className="field">
              <label htmlFor="event-title">Tytuł wydarzenia</label>
              <InputText
                id="event-title"
                value={eventForm.title}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="np. Spotkanie zespołu"
              />
            </div>
            <div className="field">
              <label htmlFor="event-category">Kategoria</label>
              <Dropdown
                id="event-category"
                value={eventForm.category}
                options={eventCategoryOptions}
                onChange={(event) =>
                  setEventForm((current) => ({
                    ...current,
                    category: event.value,
                  }))
                }
                placeholder="Wybierz kategorię"
              />
            </div>
            <div className="field">
              <label>Data wydarzenia</label>
              <DateTimePicker
                ref={eventDateRef}
                dateTimePrecisions={[
                  DateTimePickerPrecision.Date,
                  DateTimePickerPrecision.DateTime,
                ]}
                value={eventForm.date}
                onChange={(date) =>
                  setEventForm((current) => ({ ...current, date }))
                }
                onValidationChange={onValidationError}
                showBorderFieldWhenError
                fillRequired={FillRequired.All} //dla przykładu formularza wymagamy wypełnienia pola daty propsem FillRequired.All
                //nadpisanie domyślnych komunikatów walidacji lista ValidationCode w src\shared\components\DateTimePicker\types\validation.types.ts
                validationRules={{
                  "date-required": "Proszę podać datę wydarzenia",
                  "date-format":
                    "Wpisz poprawną datę wydarzenia w formacie dd.MM.yyyy",
                }}
              />
            </div>
            <div className="example-prime-form-actions">
              <Button type="submit" label="Zapisz" />
              <Button
                type="button"
                label="Anuluj"
                severity="secondary"
                outlined
                onClick={handleEventFormCancel}
              />
            </div>
          </form>
          <p className="selected-value">
            Stan formularza:{" "}
            <code>
              {JSON.stringify({
                title: eventForm.title,
                category: eventForm.category,
                date: eventForm.date?.toISOString() ?? null,
              })}
            </code>
          </p>
        </div>
        <div>
          <h4>
            Przełącznik precyzji 2 tryby (data oraz data + czas milisekundy)
            InputSwitch
          </h4>
          <DateTimePicker
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
        <div>
          <h4>Przełącznik precyzji z 4 trybami dropdown</h4>
          <DateTimePicker
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
              DateTimePickerPrecision.DateTimeSeconds,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
        <div>
          <h4>Data + czas == dd.MM.yyyy HH:mm</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.DateTime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>
            Data + czas == dd.MM.yyyy HH:mm dodatkowo ramka czerwona na polu w
            przypadku błędu
          </h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.DateTime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Data z czasem == dd.MM.yyyy HH:mm:ss</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Data z czasem == dd.MM.yyyy HH:mm:ss:SSS</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.DateTimeMilliseconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Przełącznik precyzji (2 tryby) — InputSwitch</h4>
          <DateTimePicker
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
            ]}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Przełącznik precyzji (4 tryby) — Dropdown</h4>
          <DateTimePicker
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
              DateTimePickerPrecision.DateTimeSeconds,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Przełącznik precyzji — tryb kontrolowany</h4>
          <DateTimePicker
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
            ]}
            selectedDateTimePrecision={precision}
            onDateTimePrecisionChange={setPrecision}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Precyzja: <code>{precision}</code>, wartość:{" "}
            <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sama Data</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.Date}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sam czas HH:mm</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.Time}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sam czas HH:mm:ss</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sam czas HH:mm:ss:SSS</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.TimeMilliseconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sam czas HH:mm:ss zegar cyfrowy</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            timeVariant="digital"
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Data wymagana (fillRequired=All) – błąd w toaście</h4>
          <DateTimePicker
            dateTimePrecisions={DateTimePickerPrecision.Date}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            fillRequired={FillRequired.All}
            validationRules={{
              "date-required": "Proszę wybrać datę",
              "date-format": "Wpisz datę w formacie dd.MM.yyyy",
            }}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString() ?? "null"}</code>
          </p>
        </div>
      </section>
    </>
  );
};

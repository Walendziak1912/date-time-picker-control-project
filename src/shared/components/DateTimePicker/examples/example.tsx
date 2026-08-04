import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  DateTimePickerPrecision,
  type DateTimePickerPrecisionValue,
} from "../../../components/DateTimePicker";

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

  return (
    <>
      <section>
        <header>
          <h1>DateTimePicker</h1>
        </header>
        <div>
          <h4>
            Przełącznik precyzji 2 tryby (data oraz data + czas milisekundy)
            InputSwitch
          </h4>
          <DateTimePicker
            // dateTimePrecisions={[
            //   DateTimePickerPrecision.Date,
            //   DateTimePickerPrecision.DateTimeMilliseconds,
            // ]}
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
            dateTimePrecision={DateTimePickerPrecision.DateTime}
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
            dateTimePrecision={DateTimePickerPrecision.DateTime}
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
            dateTimePrecision={DateTimePickerPrecision.DateTimeSeconds}
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
            dateTimePrecision={DateTimePickerPrecision.DateTimeMilliseconds}
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
            dateTimePrecision={DateTimePickerPrecision.Date}
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
            dateTimePrecision={DateTimePickerPrecision.Time}
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
            dateTimePrecision={DateTimePickerPrecision.TimeSeconds}
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
            dateTimePrecision={DateTimePickerPrecision.TimeMilliseconds}
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
            dateTimePrecision={DateTimePickerPrecision.TimeSeconds}
            value={datetime}
            onChange={setDatetime}
            onValidationChange={onValidationError}
            timeVariant="digital"
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
      </section>
    </>
  );
};

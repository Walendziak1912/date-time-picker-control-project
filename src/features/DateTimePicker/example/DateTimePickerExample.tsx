import { useState } from "react";
import { DateTimePicker, serializeBackendUtc } from "../index";
import { useExampleToast } from "./useExampleToast";
import { useFieldValidation } from "./useFieldValidation";
import "./DateTimePickerExample.css";

export function DateTimePickerExample() {
  const { toastElement, showError } = useExampleToast();
  const datetimeValidation = useFieldValidation(showError);
  const dateValidation = useFieldValidation(showError);
  const timeValidation = useFieldValidation(showError);

  const [datetime, setDatetime] = useState<Date | null>(new Date());
  const [dateOnly, setDateOnly] = useState<Date | null>(new Date());
  const [timeOnly, setTimeOnly] = useState<Date | null>(new Date());

  return (
    <>
      {toastElement}

      <section className="dtp-example">
        <header className="dtp-example-intro">
          <h1>DateTimePicker</h1>
          <p className="dtp-example-subtitle">
            Walidacja formatu z Toastem — wpisz błędną datę i zatwierdź pole
            (Enter lub blur).
          </p>
        </header>

        <div className="dtp-example-stack">
          <div className="dtp-example-block">
            <DateTimePicker
              label="Data + czas"
              value={datetime}
              onChange={setDatetime}
              error={datetimeValidation.error}
              onValidationChange={datetimeValidation.onValidationChange}
              showSeconds
              showMilliseconds
            />
            <p className="selected-value">
              Wartość: {datetime ? datetime.toISOString() : "brak"}
            </p>
            <p className="selected-value">
              ISO UTC:{" "}
              <code>{datetime ? serializeBackendUtc(datetime) : "brak"}</code>
            </p>
          </div>

          <div className="dtp-example-block">
            <DateTimePicker
              label="Tylko data"
              mode="date"
              value={dateOnly}
              onChange={setDateOnly}
              error={dateValidation.error}
              onValidationChange={dateValidation.onValidationChange}
            />
            <p className="selected-value">
              Wartość:{" "}
              <code>
                {dateOnly ? dateOnly.toLocaleDateString("pl-PL") : "brak"}
              </code>
            </p>
          </div>

          <div className="dtp-example-block">
            <DateTimePicker
              label="Tylko czas"
              mode="time"
              value={timeOnly}
              onChange={setTimeOnly}
              error={timeValidation.error}
              onValidationChange={timeValidation.onValidationChange}
              showSeconds
              showMilliseconds
            />
            <p className="selected-value">
              Wartość: <code>{timeOnly ? timeOnly.toISOString() : "brak"}</code>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

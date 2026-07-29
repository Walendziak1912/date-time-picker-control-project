import { useState } from "react";
import { DateTimePicker, serializeBackendUtc } from "../index";
import { useAppToast } from "../../../hooks/useAppToast";
import { useFieldValidation } from "./useFieldValidation";
import "./DateTimePickerExample.css";

export function DateTimePickerExample() {
  const { toastElement, showError } = useAppToast();
  const datetimeValidation = useFieldValidation(showError);
  const dateValidation = useFieldValidation(showError);
  const timeValidation = useFieldValidation(showError);

  const [datetime, setDatetime] = useState<Date | null>(new Date());
  const [dateOnly, setDateOnly] = useState<Date | null>(new Date());
  const [timeOnly, setTimeOnly] = useState<Date | null>(new Date());

  return (
    <>
      {toastElement}

      <section className="feature-example dtp-example">
        <header className="feature-example-intro">
          <h1>DateTimePicker</h1>
        </header>

        <div className="feature-example-stack">
          <div className="feature-example-block">
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
              Wartość: <code>{datetime ? datetime.toISOString() : "brak"}</code>
            </p>
            <p className="selected-value">
              ISO UTC:
              <code>{datetime ? serializeBackendUtc(datetime) : "brak"}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimePicker
              label="Tylko data"
              mode="date"
              value={dateOnly}
              onChange={setDateOnly}
              error={dateValidation.error}
              onValidationChange={dateValidation.onValidationChange}
            />
            <p className="selected-value">
              Wartość: <code>{dateOnly ? dateOnly.toISOString() : "brak"}</code>
            </p>
          </div>

          <div className="feature-example-block">
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

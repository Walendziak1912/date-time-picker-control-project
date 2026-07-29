import { useState } from "react";
import type { SupportedLocale } from "../index";
import { DateTimePicker, serializeBackendUtc } from "../index";
import { useAppToast } from "../../../hooks/useAppToast";
import { useFieldValidation } from "./useFieldValidation";
import "./DateTimePickerExample.css";

const EXAMPLE_TEXT = {
  "pl-PL": {
    datetime: "Data + czas",
    dateOnly: "Tylko data",
    timeOnly: "Tylko czas",
    value: "Wartość:",
    isoUtc: "ISO UTC:",
    none: "brak",
  },
  "en-US": {
    datetime: "Date + time",
    dateOnly: "Date only",
    timeOnly: "Time only",
    value: "Value:",
    isoUtc: "ISO UTC:",
    none: "none",
  },
} as const;

type DateTimePickerExampleProps = {
  locale?: SupportedLocale;
};

export function DateTimePickerExample({ locale = "pl-PL" }: DateTimePickerExampleProps) {
  const text = EXAMPLE_TEXT[locale];
  const { toastElement, showError } = useAppToast();
  const datetimeValidation = useFieldValidation(showError, locale);
  const dateValidation = useFieldValidation(showError, locale);
  const timeValidation = useFieldValidation(showError, locale);

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
              label={text.datetime}
              locale={locale}
              value={datetime}
              onChange={setDatetime}
              error={datetimeValidation.error}
              onValidationChange={datetimeValidation.onValidationChange}
              showSeconds
              showMilliseconds
            />
            <p className="selected-value">
              {text.value} <code>{datetime ? datetime.toISOString() : text.none}</code>
            </p>
            <p className="selected-value">
              {text.isoUtc}
              <code>{datetime ? serializeBackendUtc(datetime) : text.none}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimePicker
              label={text.dateOnly}
              locale={locale}
              mode="date"
              value={dateOnly}
              onChange={setDateOnly}
              error={dateValidation.error}
              onValidationChange={dateValidation.onValidationChange}
            />
            <p className="selected-value">
              {text.value} <code>{dateOnly ? dateOnly.toISOString() : text.none}</code>
            </p>
          </div>

          <div className="feature-example-block">
            <DateTimePicker
              label={text.timeOnly}
              locale={locale}
              mode="time"
              value={timeOnly}
              onChange={setTimeOnly}
              error={timeValidation.error}
              onValidationChange={timeValidation.onValidationChange}
              showSeconds
              showMilliseconds
            />
            <p className="selected-value">
              {text.value} <code>{timeOnly ? timeOnly.toISOString() : text.none}</code>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

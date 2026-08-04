import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  serializeBackendUtc,
} from "../../../components/DateTimePicker";
import { DateTimeRange } from "../../../components/DateTimeRange";
import type { DateTimeRangeValue } from "../../../components/DateTimeRange/types";

const onValidationError = (result: { valid: boolean; message?: string }) => {
  if (!result.valid) {
    toast.error(result.message);
  }
};

export const ExampleDateTimeRange: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });

  // Przypadek 48h wstecz od daty końcowej
  // data końcowa to stały punkt odniesienia
  // użytkownik może wybrać zakres cofnięty maksymalnie o 48 godzin względem tej daty
  const emissionDate = new Date("2026-07-29T12:00:00");
  const emissionMinDateTime = new Date(
    emissionDate.getTime() - 48 * 60 * 60 * 1000,
  );
  const [emissionRange, setEmissionRange] = useState<DateTimeRangeValue>({
    start: new Date(emissionDate.getTime() - 24 * 60 * 60 * 1000),
    end: emissionDate,
  });

  return (
    <>
      <section>
        <header>
          <h1>DateTimeRange</h1>
        </header>
        <div>
          <h4>
            Przełącznik precyzji 2 tryby (data oraz data + czas milisekundy)
            InputSwitch
          </h4>
          <DateTimeRange
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Przełącznik precyzji wicej niż 2 tryby </h4>
          <DateTimeRange
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTime,
              DateTimePickerPrecision.DateTimeSeconds,
              DateTimePickerPrecision.DateTimeMilliseconds,
            ]}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres podstawowy dat z czerwoną ramką i toastem</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeSeconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres dat z sekundami</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeSeconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres dat z milisekundami</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeMilliseconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres dat z milisekundami plus ogranicznik do 3 dni max</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeMilliseconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            maxRangeDays={3}
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres sam czas z sekundami</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.TimeSeconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres z presetem</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeSeconds}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            showPresets
          />
          <p>
            Wartość:{" "}
            <code>
              {dateRange.start?.toISOString()} - {dateRange.end?.toISOString()}
            </code>
          </p>
        </div>
        <div>
          <h4>Zakres "booking"</h4>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.Date}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            showFlexDates
          />
          <p>
            Wartość: <code>{JSON.stringify(dateRange)}</code>
          </p>
        </div>
        <div>
          <h4>Analiza do 48h wstecz od daty emisji</h4>
          <p>
            Data emisji: <code>{serializeBackendUtc(emissionDate)}</code> —
            dozwolony zakres od{" "}
            <code>{serializeBackendUtc(emissionMinDateTime)}</code> do{" "}
            <code>{serializeBackendUtc(emissionDate)}</code>
          </p>
          <DateTimeRange
            dateTimePrecision={DateTimePickerPrecision.DateTimeSeconds}
            value={emissionRange}
            onChange={setEmissionRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            minDateTime={emissionMinDateTime}
            maxDateTime={emissionDate}
            maxRangeHours={48}
          />
          <p>
            Wartość:{" "}
            <code>
              {emissionRange.start?.toISOString()} -{" "}
              {emissionRange.end?.toISOString()}
            </code>
          </p>
        </div>
      </section>
    </>
  );
};

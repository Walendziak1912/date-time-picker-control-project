import { useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import {
  DateTimePickerPrecision,
  FillRequired,
  serializeBackendUtc,
} from "../../../components/DateTimePicker";
import {
  DateTimeRange,
  type DateTimeRangeHandle,
} from "../../../components/DateTimeRange";
import type { DateTimeRangeValue } from "../../../components/DateTimeRange/types";

const reportTypeOptions = [
  { label: "Sprzedaż", value: "sales" },
  { label: "Magazyn", value: "warehouse" },
  { label: "Finanse", value: "finance" },
];

type ReportFormState = {
  name: string;
  type: string | null;
  rangeAll: DateTimeRangeValue;
  rangeStartOnly: DateTimeRangeValue;
};

const createInitialReportFormState = (): ReportFormState => ({
  name: "",
  type: null,
  rangeAll: {
    start: null,
    end: null,
  },
  rangeStartOnly: {
    start: null,
    end: null,
  },
});

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
  const [reportForm, setReportForm] = useState<ReportFormState>(
    createInitialReportFormState,
  );
  const [reportFormKey, setReportFormKey] = useState(0);
  const reportRangeAllRef = useRef<DateTimeRangeHandle>(null);
  const reportRangeStartRef = useRef<DateTimeRangeHandle>(null);

  const handleReportFormSave = () => {
    const rangeAllValidation =
      reportRangeAllRef.current?.validate() ?? { valid: true };
    const rangeStartValidation =
      reportRangeStartRef.current?.validate() ?? { valid: true };

    if (!rangeAllValidation.valid || !rangeStartValidation.valid) {
      return;
    }

    toast.success(
      `Zapisano raport: "${reportForm.name || "(bez nazwy)"}", typ: ${reportForm.type ?? "—"}, zakres: ${reportForm.rangeAll.start?.toISOString() ?? "—"} – ${reportForm.rangeAll.end?.toISOString() ?? "—"}`,
    );
  };

  const handleReportFormCancel = () => {
    setReportForm(createInitialReportFormState());
    setReportFormKey((current) => current + 1);
    toast.info("Formularz anulowany — przywrócono wartości początkowe");
  };

  return (
    <>
      <section>
        <header>
          <h1>DateTimeRange</h1>
        </header>
        <div>
          <h4>
            Formularz PrimeReact zakres dat, input, dropdown, Zapisz / Anuluj
          </h4>
          <form
            className="p-fluid example-prime-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleReportFormSave();
            }}
          >
            <div className="field">
              <label htmlFor="report-name">Nazwa raportu</label>
              <InputText
                id="report-name"
                value={reportForm.name}
                onChange={(event) =>
                  setReportForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="np. Raport miesięczny"
              />
            </div>
            <div className="field">
              <label htmlFor="report-type">Typ raportu</label>
              <Dropdown
                id="report-type"
                value={reportForm.type}
                options={reportTypeOptions}
                onChange={(event) =>
                  setReportForm((current) => ({
                    ...current,
                    type: event.value,
                  }))
                }
                placeholder="Wybierz typ"
              />
            </div>
            <div className="field">
              <label>Zakres dat (fillRequired=All)</label>
              <DateTimeRange
                key={`range-all-${reportFormKey}`}
                ref={reportRangeAllRef}
                dateTimePrecisions={DateTimePickerPrecision.Date}
                value={reportForm.rangeAll}
                onChange={(range) =>
                  setReportForm((current) => ({ ...current, rangeAll: range }))
                }
                onValidationChange={onValidationError}
                showBorderFieldWhenError
                fillRequired={FillRequired.All}
                validationRules={{
                  "both-dates-required":
                    "Wybierz datę początkową i końcową dla raportu",
                  "start-date-required": "Podaj datę początkową raportu",
                  "end-date-required": "Podaj datę końcową raportu",
                }}
              />
            </div>
            <div className="field">
              <label>Zakres dat z wymaganą datą początkową (fillRequired=StartDate)</label>
              <DateTimeRange
                key={`range-start-${reportFormKey}`}
                ref={reportRangeStartRef}
                dateTimePrecisions={DateTimePickerPrecision.Date}
                value={reportForm.rangeStartOnly}
                onChange={(range) =>
                  setReportForm((current) => ({
                    ...current,
                    rangeStartOnly: range,
                  }))
                }
                onValidationChange={onValidationError}
                showBorderFieldWhenError
                fillRequired={FillRequired.StartDate}
              />
            </div>
            <div className="example-prime-form-actions">
              <Button type="submit" label="Zapisz" />
              <Button
                type="button"
                label="Anuluj"
                severity="secondary"
                outlined
                onClick={handleReportFormCancel}
              />
            </div>
          </form>
          <p className="selected-value">
            Stan formularza:{" "}
            <code>
              {JSON.stringify({
                name: reportForm.name,
                type: reportForm.type,
                rangeAll: {
                  start: reportForm.rangeAll.start?.toISOString() ?? null,
                  end: reportForm.rangeAll.end?.toISOString() ?? null,
                },
                rangeStartOnly: {
                  start: reportForm.rangeStartOnly.start?.toISOString() ?? null,
                  end: reportForm.rangeStartOnly.end?.toISOString() ?? null,
                },
              })}
            </code>
          </p>
        </div>
        <div>
          <h4>
            Przełącznik precyzji 2 tryby (data oraz data + czas milisekundy)
            InputSwitch domyślnie pełny dzień
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
          <h4>
            Przełącznik precyzji z bieżącą godziną w polu końcowym
            (useEndOfDayAsRangeEnd=false)
          </h4>
          <DateTimeRange
            dateTimePrecisions={[
              DateTimePickerPrecision.Date,
              DateTimePickerPrecision.DateTimeMilliseconds,
              DateTimePickerPrecision.TimeSeconds,
            ]}
            value={dateRange}
            onChange={setDateRange}
            onValidationChange={onValidationError}
            showBorderFieldWhenError
            useEndOfDayAsRangeEnd={false}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeMilliseconds}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeMilliseconds}
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
            dateTimePrecisions={DateTimePickerPrecision.TimeSeconds}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
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
            dateTimePrecisions={DateTimePickerPrecision.Date}
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
            dateTimePrecisions={DateTimePickerPrecision.DateTimeSeconds}
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

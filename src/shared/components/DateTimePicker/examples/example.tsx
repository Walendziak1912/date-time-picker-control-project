import { useState } from "react";
import { toast } from "react-toastify";
import {
  DateTimePicker,
  serializeBackendUtc,
} from "../../../components/DateTimePicker";
import { DateTimeRange } from "../../../components/DateTimeRange";
import type { DateTimeRangeValue } from "../../../components/DateTimeRange/types/DateTimeRange.types";

export const ExampleDateTimePicker: React.FC = () => {
  const [datetime, setDatetime] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>({
    start: new Date(),
    end: new Date(),
  });
  const [flexRange, setFlexRange] = useState<DateTimeRangeValue>({
    start: new Date("2026-08-02"),
    end: new Date("2026-08-06"),
    flexibility: 0,
  });

  return (
    <>
      <section>
        <header>
          <h1>DateTimePicker</h1>
        </header>
        <div>
          <h4>Data + czas == dd.MM.yyyy HH:mm</h4>
          <DateTimePicker
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
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
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showBorderFieldWhenError //props dodający czerwoną ramkę w przypadku błędu walidacji
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Data z czasem == dd.MM.yyyy HH:mm:ss</h4>
          <DateTimePicker
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showSeconds //dla sekund w czasie dodajemy parametr showSeconds
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Data z czasem == dd.MM.yyyy HH:mm:ss:SSS</h4>
          <DateTimePicker
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showMilliseconds //dla milisekund w czasie dodajemy parametr showMilliseconds
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sama Data</h4>
          <DateTimePicker
            mode="date" //sama data
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>

        <div>
          <h4>Sam czas HH:mm</h4>
          <DateTimePicker
            mode="time" //sam czas
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
        <div>
          <h4>Sam czas HH:mm:ss</h4>
          <DateTimePicker
            mode="time" //sam czas
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showSeconds // dla sekund w czasie dodajemy parametr showSeconds
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
        <div>
          <h4>Sam czas HH:mm:ss:SSS</h4>
          <DateTimePicker
            mode="time" //sam czas
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showMilliseconds //dla milisekund w czasie dodajemy parametr showMilliseconds
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
        <div>
          <h4>Sam czas HH:mm zegar cyfrowy</h4>
          <DateTimePicker
            mode="time" //sam czas
            value={datetime}
            onChange={setDatetime}
            onValidationChange={(result) => {
              if (!result.valid) {
                toast.error(result.message);
              }
            }}
            showSeconds
            timeVariant="digital" //zegar cyfrowy
          />
          <p className="selected-value">
            Wartość: <code>{datetime?.toISOString()}</code>
          </p>
        </div>
      </section>
    </>
  );
};

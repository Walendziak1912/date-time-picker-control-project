import { useState } from "react";

import { toast } from "react-toastify";

import {

  DateTimePickerPrecision,

  serializeBackendRange,

} from "../../DateTimePicker";

import { DateTimeRange } from "../../DateTimeRange";

import type { DateTimeRangeValue } from "../types";



function RangeDemo({

  title,

  dateTimePrecisions,

}: {

  title: string;

  dateTimePrecisions: Parameters<typeof DateTimeRange>[0]["dateTimePrecisions"];

}) {

  const [range, setRange] = useState<DateTimeRangeValue>({

    start: null,

    end: null,

  });



  return (

    <div className="flex flex-column gap-3 p-4 h-full border-1 surface-border border-round surface-card">

      <h4 className="m-0">{title}</h4>

      <DateTimeRange

        dateTimePrecisions={dateTimePrecisions}

        value={range}

        onChange={setRange}

        onValidationChange={(result) => {

          if (!result.valid && result.message) {

            toast.error(result.message);

          }

        }}

        showBorderFieldWhenError

      />

      <p className="m-0 text-sm">

        Stan UI:{" "}

        <code>

          {range.start?.toISOString() ?? "null"} –{" "}

          {range.end?.toISOString() ?? "null"}

        </code>

      </p>

      <p className="m-0 text-sm">

        Payload API:{" "}

        <code>

          {serializeBackendRange(range) ?? "null"}

        </code>

      </p>

    </div>

  );

}



export function PrecisionSwitchExample() {

  return (

    <RangeDemo

      title="Przełącznik precyzji 2 tryby (data / data + czas ms), domyślnie pełny dzień"

      dateTimePrecisions={[

        DateTimePickerPrecision.Date,

        DateTimePickerPrecision.DateTimeMilliseconds,

      ]}

    />

  );

}



export function MultiPrecisionExample() {

  return (

    <RangeDemo

      title="Przełącznik precyzji więcej niż 2 tryby (dropdown)"

      dateTimePrecisions={[

        DateTimePickerPrecision.Date,

        DateTimePickerPrecision.DateTime,

        DateTimePickerPrecision.DateTimeSeconds,

        DateTimePickerPrecision.DateTimeMilliseconds,

      ]}

    />

  );

}


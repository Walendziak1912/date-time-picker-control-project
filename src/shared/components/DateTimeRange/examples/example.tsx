import { useState } from "react";
import { toast } from "react-toastify";
import { DateTimePicker, serializeBackendUtc } from "../../../components/DateTimePicker";
import { DateTimeRange } from "../../../components/DateTimeRange";
import type { DateTimeRangeValue } from "../../../components/DateTimeRange/types";

export const ExampleDateTimeRange: React.FC = () => {
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

    // Przypadek 48h wstecz od daty końcowej
    // data końcowa to stały punkt odniesienia
    // użytkownik może wybrać zakres cofnięty maksymalnie o 48 godzin względem tej daty
    const emissionDate = new Date("2026-07-29T12:00:00");
    const emissionMinDateTime = new Date(emissionDate.getTime() - 48 * 60 * 60 * 1000);
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
                    <h4>Zakres podstawowy dat z czerwoną ramką i toastem</h4>
                    <DateTimeRange
                        mode="date" //tryb same daty
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError // czerwona ramka pola w przypadku błedu
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
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError // czerwona ramka pola w przypadku błedu
                        showSeconds
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
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError // czerwona ramka pola w przypadku błedu
                        showMilliseconds
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
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError // czerwona ramka pola w przypadku błedu
                        showMilliseconds
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
                        mode="time" //tryb samego czasu
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError // czerwona ramka pola w przypadku błedu
                        showSeconds
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
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError
                        showSeconds
                        showPresets //preset
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
                        mode="date"
                        value={dateRange}
                        onChange={setDateRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError
                        showSeconds
                        showFlexDates
                    />
                    <p>
                        Wartość: <code>{JSON.stringify(dateRange)}</code>
                    </p>
                </div>
                <div>
                    <h4>Analiza do 48h wstecz od daty emisji</h4>
                    <p>
                        Data emisji: <code>{serializeBackendUtc(emissionDate)}</code> — dozwolony zakres od <code>{serializeBackendUtc(emissionMinDateTime)}</code> do{" "}
                        <code>{serializeBackendUtc(emissionDate)}</code>
                    </p>
                    <DateTimeRange
                        value={emissionRange}
                        onChange={setEmissionRange}
                        onValidationChange={(result) => {
                            if (!result.valid) {
                                toast.error(result.message);
                            }
                        }}
                        showBorderFieldWhenError
                        showSeconds
                        minDateTime={emissionMinDateTime} // dolna granica to data 48h;
                        maxDateTime={emissionDate} //górna granica to data
                        maxRangeHours={48} //zabezpieczenie zakres nie może przekroczyć 48h
                    />
                    <p>
                        Wartość:{" "}
                        <code>
                            {emissionRange.start?.toISOString()} - {emissionRange.end?.toISOString()}
                        </code>
                    </p>
                </div>
            </section>
        </>
    );
};

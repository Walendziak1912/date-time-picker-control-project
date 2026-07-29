import { useState } from "react";
import type { SupportedLocale } from "./features/DateTimePicker";
import { DateTimePickerExample } from "./features/DateTimePicker/example";
import { DateTimeRangeExample } from "./features/DateTimeRange/example";
import "./example/exampleLayout.css";

const LOCALE_OPTIONS: { value: SupportedLocale; label: string }[] = [
  { value: "pl-PL", label: "Polski (pl-PL)" },
  { value: "en-US", label: "English (en-US)" },
];

function App() {
  const [locale, setLocale] = useState<SupportedLocale>("pl-PL");

  return (
    <div className="examples-page">
      <div className="examples-locale-bar">
        <label htmlFor="examples-locale">Locale</label>
        <select
          id="examples-locale"
          value={locale}
          onChange={(event) => setLocale(event.target.value as SupportedLocale)}
        >
          {LOCALE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <DateTimePickerExample locale={locale} />
      <DateTimeRangeExample locale={locale} />
    </div>
  );
}

export default App;

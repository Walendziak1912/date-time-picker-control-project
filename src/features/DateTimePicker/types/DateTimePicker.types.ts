import type { ReactNode } from "react";

import type { SupportedLocale } from "./locale.types";
import type { DateTimePickerLocaleText } from "./localeText.types";

export type DateTimePickerTimezone = "UTC" | "system";

export type DateTimePickerView =
  | "year"
  | "month"
  | "day"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

export type TimePickerVariant = "digital" | "analog";

//sama data, sam czas, lub domyślnie oba
export type DateTimePickerMode = "date" | "time" | "datetime";

export type TimeSteps = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type DateTimeChangeContext = {
  source: "field" | "view" | "unknown";
};

export type DateTimeValidationReason = "invalidFormat";

export type DateTimeValidationResult = {
  valid: boolean;
  reason?: DateTimeValidationReason;
  message?: string;
};

export type DateTimePickerProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null, context: DateTimeChangeContext) => void;
  onAccept?: (value: Date | null, context: DateTimeChangeContext) => void;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  label?: ReactNode;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  //12h
  ampm?: boolean;
  //format tokeny yyyy MM dd HH hh mm ss a
  format?: string;
  //"date" tylko kalendarz
  //"time" tylko zegar
  //"datetime" oba (domyślnie)
  mode?: DateTimePickerMode;
  // timezone - strefa wyświetlania/edycji jak "timezone" w MUI X
  //"UTC" (domyślnie) kalendarz i zegar w UTC
  //"system" kalendarz i zegar w strefie lokalnej użytkownika
  //value/onChange zawsze operują na instant (timestamp) "timezone" wpływa tylko na render
  timezone?: DateTimePickerTimezone;
  closeOnSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
  minDateTime?: Date;
  maxDateTime?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  //skok minut w wyborze czasu domyślnie 1 (np. 1, 5, 15)
  minutesStep?: number;
  //włącza wybór sekund format "ss" na kolumna/tarcza Domyślnie na false
  showSeconds?: boolean;
  //skok sekund w wyborze czasu domyślnie 1 (timeSteps.seconds ma pierwszeństwo)
  secondsStep?: number;
  //włącza wybór milisekund format "SSS" na kolumna/tarcza Domyślnie na false
  showMilliseconds?: boolean;
  //skok milisekund w wyborze czasu domyślnie 1 (timeSteps.milliseconds ma pierwszeństwo)
  millisecondsStep?: number;
  //alternatywnie: timeSteps.minutes nadpisuje minutesStep
  timeSteps?: TimeSteps;
  shouldDisableDate?: (day: Date) => boolean;
  shouldDisableMonth?: (month: Date) => boolean;
  shouldDisableYear?: (year: Date) => boolean;
  //włącza wyłączenie wybranego czasu
  shouldDisableTime?: (
    value: Date,
    view: "hours" | "minutes" | "seconds" | "milliseconds",
  ) => boolean;
  showDaysOutsideCurrentMonth?: boolean;
  disableHighlightToday?: boolean;
  views?: DateTimePickerView[];
  openTo?: DateTimePickerView;
  onViewChange?: (view: DateTimePickerView) => void;
  onMonthChange?: (month: Date) => void;
  onYearChange?: (year: Date) => void;
  yearsOrder?: "asc" | "desc";
  yearsPerRow?: 3 | 4;
  monthsPerRow?: 3 | 4;
  //analog (default) or digital clock
  timeVariant?: TimePickerVariant;
  className?: string;
  locale?: SupportedLocale;
  //nadpisanie domyślnych etykiet
  localeText?: DateTimePickerLocaleText;
  //błąd z formularza (aria-invalid + helperText) Czerwona ramka tylko gdy "showBorderFieldWhenError"
  error?: boolean;
  //komunikat pod polem; domyślnie tekst błędu formatu z localeText
  helperText?: ReactNode;
  //tekst błędu pod polem. Domyślnie false (np. Toast u rodzica)
  showTextUnderFieldWhenError?: boolean;
  //czerwona obwódka pola przy błędzie. Domyślnie false
  showBorderFieldWhenError?: boolean;
  //raport walidacji pola tekstowego np. Toast u rodzica
  onValidationChange?: (result: DateTimeValidationResult) => void;
};

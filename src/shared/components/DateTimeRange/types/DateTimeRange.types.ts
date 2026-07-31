import type { ReactNode } from "react";

import type {
  DateTimeChangeContext,
  DateTimePickerLocaleText,
  DateTimePickerMode,
  DateTimePickerProps,
  DateTimePickerTimezone,
  DateTimeValidationResult,
  SupportedLocale,
  TimePickerVariant,
  TimeSteps,
} from "../../DateTimePicker";
import type { DateTimeRangeLocaleText } from "./rangeLocaleText.types";

export type DateTimeRangeFlexibility = 0 | 1 | 2 | 3 | 7;

export type DateTimeRangeValue = {
  start: Date | null;
  end: Date | null;
  flexibility?: DateTimeRangeFlexibility;
};

export type DateTimeRangeFlexPayload = {
  from: string;
  to: string;
  flexibility: DateTimeRangeFlexibility;
};

export type DateTimeRangeFlexOption = {
  value: DateTimeRangeFlexibility;
  label: string;
};

export type DateTimeRangeChangeContext = {
  source: "start" | "end" | "preset" | "flexDates";
  change: DateTimeChangeContext;
};

export type DateTimeRangePresetKey =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth";

export type DateTimeRangePresetOption = {
  key: DateTimeRangePresetKey;
  label: string;
};

export type DateTimeRangeValidationReason = "invalidFormat" | "invalidRange";

export type DateTimeRangeValidationResult = {
  valid: boolean;
  reason?: DateTimeRangeValidationReason;
  message?: string;
  fields?: DateTimeRangeFieldValidation;
};

export type DateTimeRangeFieldValidation = {
  start?: DateTimeValidationResult;
  end?: DateTimeValidationResult;
};

export type DateTimeRangeLimits = {
  maxRangeDays?: number;
  maxRangeHours?: number;
  maxRangeMinutes?: number;
  maxRangeMonths?: number;
  precision?: boolean;
};

type SharedPickerProps = Pick<
  DateTimePickerProps,
  | "disabled"
  | "readOnly"
  | "ampm"
  | "format"
  | "mode"
  | "dateTimePrecision"
  | "timezone"
  | "closeOnSelect"
  | "minutesStep"
  | "showSeconds"
  | "secondsStep"
  | "showMilliseconds"
  | "millisecondsStep"
  | "timeSteps"
  | "shouldDisableDate"
  | "shouldDisableMonth"
  | "shouldDisableYear"
  | "shouldDisableTime"
  | "showDaysOutsideCurrentMonth"
  | "disableHighlightToday"
  | "views"
  | "openTo"
  | "onViewChange"
  | "onMonthChange"
  | "onYearChange"
  | "yearsOrder"
  | "yearsPerRow"
  | "monthsPerRow"
  | "timeVariant"
  | "locale"
  | "localeText"
  | "minTime"
  | "maxTime"
  | "disablePast"
  | "disableFuture"
>;

export type DateTimeRangeProps = SharedPickerProps & {
  value?: DateTimeRangeValue;
  defaultValue?: DateTimeRangeValue;
  onChange?: (
    value: DateTimeRangeValue,
    context: DateTimeRangeChangeContext,
  ) => void;
  onAccept?: (
    value: DateTimeRangeValue,
    context: DateTimeRangeChangeContext,
  ) => void;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  separator?: ReactNode;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  minDateTime?: Date;
  maxDateTime?: Date;
  // Maksymalna liczba dni w zakresie (włącznie z dniem początkowym)
  // Domyślnie wyłączone. Przy precision=false dni kalendarzowe
  // przy precision=true dokładne doby (np. 2 dni = 48 h od startu)
  maxRangeDays?: number;
  // Maksymalna liczba godzin od momentu startu. Domyślnie wyłączone.
  maxRangeHours?: number;
  // Maksymalna liczba minut od momentu startu. Domyślnie wyłączone.
  maxRangeMinutes?: number;
  //Maksymalna liczba miesięcy w zakresie (włącznie z miesiącem początkowym)
  //Przy precision=false miesiące kalendarzowe; przy true ten sam dzień/godzina N miesięcy później
  maxRangeMonths?: number;
  //Domyślnie false. Gdy true, maxRangeDays/maxRangeMonths liczone są od dokładnego
  //momentu startu (np. 28.07.2026 14:00 + 2 dni = 30.07.2026 14:00)
  precision?: boolean;
  startProps?: Partial<DateTimePickerProps>;
  endProps?: Partial<DateTimePickerProps>;
  error?: boolean;
  helperText?: ReactNode;
  showTextUnderFieldWhenError?: boolean;
  showBorderFieldWhenError?: boolean;
  onValidationChange?: (result: DateTimeRangeValidationResult) => void;
  //włącza combobox z presetami obok pól zakresu Domyślnie false
  showPresets?: boolean;
  //wybrany preset (kontrolowany) null = zakres niestandardowy
  preset?: DateTimeRangePresetKey | null;
  defaultPreset?: DateTimeRangePresetKey | null;
  onPresetChange?: (preset: DateTimeRangePresetKey | null) => void;
  //nadpisanie domyślnej listy presetów
  presetOptions?: DateTimeRangePresetOption[];
  presetPlaceholder?: string;
  presetLabel?: ReactNode;
  presetClassName?: string;
  //włącza combobox z elastycznymi opcjami dat (jak Booking) Domyślnie false
  showFlexDates?: boolean;
  //wybrana elastyczność (kontrolowana). Domyślnie 0 = dokładny termin
  flexibility?: DateTimeRangeFlexibility;
  defaultFlexibility?: DateTimeRangeFlexibility;
  onFlexibilityChange?: (flexibility: DateTimeRangeFlexibility) => void;
  //nadpisanie domyślnej listy opcji elastyczności
  flexDatesOptions?: DateTimeRangeFlexOption[];
  flexDatesPlaceholder?: string;
  flexDatesLabel?: ReactNode;
  flexDatesClassName?: string;
  //nadpisanie domyślnych etykiet zakresu
  rangeLocaleText?: DateTimeRangeLocaleText;
};

export type DateTimeRangeConstraintMode = DateTimePickerMode;

export type DateTimeRangeSharedConfig = {
  mode: DateTimePickerMode;
  timezone: DateTimePickerTimezone;
  timeVariant: TimePickerVariant;
  locale: SupportedLocale;
  localeText?: DateTimePickerLocaleText;
  timeSteps?: TimeSteps;
};

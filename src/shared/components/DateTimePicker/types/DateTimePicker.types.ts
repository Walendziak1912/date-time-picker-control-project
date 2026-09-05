import type { ReactNode } from "react";

import type {
  DateTimePickerValidationCode,
  FillRequired,
  ValidationRules,
} from "./validation.types";
import type { DateTimePickerLocaleText } from "./localeText.types";
import type { SupportedLocale } from "./locale.types";
import type {
  DateTimePickerPrecisionValue,
  DateTimePrecisionsInput,
} from "./precision.types";
import type { DateBoundsRange } from "../repository/fullBounds";

export type DateTimePickerTimezone = "UTC" | "system";

export type DateTimeValidationMode = "submit" | "blur";

export type DateTimePickerView =
  | "year"
  | "month"
  | "day"
  | "hours"
  | "minutes"
  | "seconds"
  | "milliseconds";

export type TimePickerVariant = "digital" | "analog";

export type DateTimePickerMode = "date" | "time" | "datetime";

export type TimeSteps = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export type DateTimeChangeContext = {
  source: "field" | "view" | "unknown";
  precision?: DateTimePickerPrecisionValue | null;
};

export type DateTimeValidationReason = DateTimePickerValidationCode;

export type DateTimeValidationResult = {
  valid: boolean;
  reason?: DateTimeValidationReason;
  message?: string;
};

export type DateTimePickerHandle = {
  validate: () => DateTimeValidationResult;
  reset: () => void;
};

export type { DateBoundsRange };

export type DateTimePickerSharedProps = {
  referenceDate?: Date | null;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  label?: ReactNode;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  ampm?: boolean;
  format?: string;
  mode?: DateTimePickerMode;
  dateTimePrecisions?: DateTimePrecisionsInput;
  selectedDateTimePrecision?: DateTimePickerPrecisionValue;
  onDateTimePrecisionChange?: (precision: DateTimePickerPrecisionValue) => void;
  timezone?: DateTimePickerTimezone;
  /** Domyślny czas po wyborze dnia w kalendarzu: start → 00:00:00.000, end → 23:59:59.999 */
  daySelectBound?: "start" | "end";
  closeOnSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
  minDateTime?: Date;
  maxDateTime?: Date;
  disablePast?: boolean;
  disableFuture?: boolean;
  minutesStep?: number;
  showSeconds?: boolean;
  secondsStep?: number;
  showMilliseconds?: boolean;
  millisecondsStep?: number;
  timeSteps?: TimeSteps;
  shouldDisableDate?: (day: Date) => boolean;
  shouldDisableMonth?: (month: Date) => boolean;
  shouldDisableYear?: (year: Date) => boolean;
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
  timeVariant?: TimePickerVariant;
  className?: string;
  locale?: SupportedLocale;
  localeText?: DateTimePickerLocaleText;
  error?: boolean;
  helperText?: ReactNode;
  showTextUnderFieldWhenError?: boolean;
  showBorderFieldWhenError?: boolean;
  onValidationChange?: (result: DateTimeValidationResult) => void;
  fillRequired?: FillRequired;
  validationRules?: ValidationRules;
  /** Domyślnie "submit" - błędy po ref.validate(). Ustaw "blur" dla walidacji po opuszczeniu pola. */
  validationMode?: DateTimeValidationMode;
};

export type DateTimePickerProps = DateTimePickerSharedProps & {
  value?: DateBoundsRange;
  defaultValue?: DateBoundsRange;
  onChange?: (value: DateBoundsRange, context: DateTimeChangeContext) => void;
  onAccept?: (value: DateBoundsRange, context: DateTimeChangeContext) => void;
};

export type DateTimePickerFieldProps = DateTimePickerSharedProps & {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null, context: DateTimeChangeContext) => void;
  onAccept?: (value: Date | null, context: DateTimeChangeContext) => void;
};

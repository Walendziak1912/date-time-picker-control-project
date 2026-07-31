import type { SupportedLocale } from "../../DateTimePicker/types/locale.types";
import type {
  DateTimeRangeFlexibility,
  DateTimeRangeFlexOption,
  DateTimeRangePresetKey,
  DateTimeRangePresetOption,
} from "./DateTimeRange.types";

export type DateTimeRangeLocaleText = {
  startLabel?: string;
  endLabel?: string;
  presetPlaceholder?: string;
  flexDatesPlaceholder?: string;
  flexDatesLabel?: string;
  invalidFormatBoth?: string;
  invalidFormatStart?: string;
  invalidFormatEnd?: string;
  invalidRange?: string;
  presets?: Partial<Record<DateTimeRangePresetKey, string>>;
  flexDates?: Partial<Record<DateTimeRangeFlexibility, string>>;
};

export type ResolvedRangeLocaleText = {
  startLabel: string;
  endLabel: string;
  presetPlaceholder: string;
  flexDatesPlaceholder: string;
  flexDatesLabel: string;
  invalidFormatBoth: string;
  invalidFormatStart: string;
  invalidFormatEnd: string;
  invalidRange: string;
  presetOptions: DateTimeRangePresetOption[];
  flexDatesOptions: DateTimeRangeFlexOption[];
};

export type { SupportedLocale };

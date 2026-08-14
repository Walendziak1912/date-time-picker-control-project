import {
  normalizeLocale,
  type SupportedLocale,
} from "../../DateTimePicker/types/locale.types";
import type {
  DateTimeRangeFlexibility,
  DateTimeRangePresetKey,
} from "../types";
import type {
  DateTimeRangeLocaleText,
  ResolvedRangeLocaleText,
} from "../types/rangeLocaleText.types";
import { buildDefaultFlexDatesOptions } from "./flexDates";
import { buildDefaultPresetOptions } from "./rangePresets";

const PRESET_KEYS: DateTimeRangePresetKey[] = [
  "today",
  "yesterday",
  "thisWeek",
  "lastWeek",
  "thisMonth",
  "lastMonth",
];
const FLEX_VALUES: DateTimeRangeFlexibility[] = [0, 1, 2, 3, 7];

function defaultsForLocale(
  locale: SupportedLocale,
): Omit<ResolvedRangeLocaleText, "presetOptions" | "flexDatesOptions"> {
  const pl = locale === "pl-PL";

  return {
    startLabel: pl ? "Od" : "From",
    endLabel: pl ? "Do" : "To",
    presetPlaceholder: pl ? "Wybierz okres" : "Select period",
    flexDatesPlaceholder: pl ? "Wybierz elastyczność" : "Select flexibility",
    flexDatesLabel: pl ? "Elastyczne opcje dat" : "Flexible date options",
  };
}

function mergePresetOptions(
  locale: SupportedLocale,
  overrides?: Partial<Record<DateTimeRangePresetKey, string>>,
) {
  const base = buildDefaultPresetOptions(locale);
  if (!overrides) return base;

  return PRESET_KEYS.map((key) => ({
    key,
    label: overrides[key] ?? base.find((option) => option.key === key)!.label,
  }));
}

function mergeFlexDatesOptions(
  locale: SupportedLocale,
  overrides?: Partial<Record<DateTimeRangeFlexibility, string>>,
) {
  const base = buildDefaultFlexDatesOptions(locale);
  if (!overrides) return base;

  return FLEX_VALUES.map((value) => ({
    value,
    label:
      overrides[value] ?? base.find((option) => option.value === value)!.label,
  }));
}

export function resolveFieldLabel(label: unknown, fallback: string): string {
  return typeof label === "string" && label.trim().length > 0
    ? label
    : fallback;
}

export function resolveRangeLocaleText(
  locale?: string,
  overrides?: DateTimeRangeLocaleText,
): ResolvedRangeLocaleText {
  const resolvedLocale = normalizeLocale(locale);
  const base = defaultsForLocale(resolvedLocale);

  return {
    startLabel: overrides?.startLabel ?? base.startLabel,
    endLabel: overrides?.endLabel ?? base.endLabel,
    presetPlaceholder: overrides?.presetPlaceholder ?? base.presetPlaceholder,
    flexDatesPlaceholder:
      overrides?.flexDatesPlaceholder ?? base.flexDatesPlaceholder,
    flexDatesLabel: overrides?.flexDatesLabel ?? base.flexDatesLabel,
    presetOptions: mergePresetOptions(resolvedLocale, overrides?.presets),
    flexDatesOptions: mergeFlexDatesOptions(
      resolvedLocale,
      overrides?.flexDates,
    ),
  };
}

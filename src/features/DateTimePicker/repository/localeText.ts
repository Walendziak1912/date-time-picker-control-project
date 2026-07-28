import { getMonthLabels, getWeekdayLabels } from './dateUtils'
import type { DateTimePickerLocaleText, ResolvedLocaleText } from '../types/localeText.types'

function defaultsForLocale(locale: string): Omit<ResolvedLocaleText, 'weekdayLabels' | 'monthLabels'> {
  const pl = locale.toLowerCase().startsWith('pl')
  return {
    cancel: pl ? 'Anuluj' : 'Cancel',
    ok: pl ? 'Zatwierdź' : 'OK',
    today: pl ? 'Dziś' : 'Today',
    clear: pl ? 'Wyczyść' : 'Clear',
    openPicker: pl ? 'Otwórz wybór daty i godziny' : 'Open date and time picker',
    dialog: pl ? 'Wybór daty i godziny' : 'Date and time picker',
    prev: pl ? 'Wstecz' : 'Previous',
    next: pl ? 'Dalej' : 'Next',
    switchCalendarView: pl ? 'Zmień widok kalendarza' : 'Change calendar view',
    month: pl ? 'Miesiąc' : 'Month',
    year: pl ? 'Rok' : 'Year',
    hours: pl ? 'Godziny' : 'Hours',
    minutes: pl ? 'Minuty' : 'Minutes',
    seconds: pl ? 'Sekundy' : 'Seconds',
    milliseconds: pl ? 'Milisekundy' : 'Milliseconds',
    meridiem: pl ? 'Południe' : 'Meridiem',
    invalidFormat: pl ? 'Nieprawidłowy format ({format})' : 'Invalid format ({format})',
  }
}

export function resolveLocaleText(
  locale: string,
  overrides?: DateTimePickerLocaleText,
): ResolvedLocaleText {
  const base = defaultsForLocale(locale)
  return {
    weekdayLabels: overrides?.weekdayLabels ?? getWeekdayLabels(locale),
    monthLabels: overrides?.monthLabels ?? getMonthLabels(locale),
    cancel: overrides?.cancel ?? base.cancel,
    ok: overrides?.ok ?? base.ok,
    today: overrides?.today ?? base.today,
    clear: overrides?.clear ?? base.clear,
    openPicker: overrides?.openPicker ?? base.openPicker,
    dialog: overrides?.dialog ?? base.dialog,
    prev: overrides?.prev ?? base.prev,
    next: overrides?.next ?? base.next,
    switchCalendarView: overrides?.switchCalendarView ?? base.switchCalendarView,
    month: overrides?.month ?? base.month,
    year: overrides?.year ?? base.year,
    hours: overrides?.hours ?? base.hours,
    minutes: overrides?.minutes ?? base.minutes,
    seconds: overrides?.seconds ?? base.seconds,
    milliseconds: overrides?.milliseconds ?? base.milliseconds,
    meridiem: overrides?.meridiem ?? base.meridiem,
    invalidFormat: overrides?.invalidFormat ?? base.invalidFormat,
  }
}

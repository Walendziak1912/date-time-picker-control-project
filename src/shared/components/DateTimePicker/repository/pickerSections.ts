import type { DateTimePickerMode, DateTimePickerView } from '../types'

type ResolvedSections = {
  calendarViews: Array<'year' | 'month' | 'day'>
  showCalendar: boolean
  showTime: boolean
}

const DEFAULT_CALENDAR_VIEWS = ['year', 'month', 'day'] as const

export function resolvePickerSections(
  mode: DateTimePickerMode,
  views: DateTimePickerView[],
  showSeconds: boolean,
  showMilliseconds: boolean,
): ResolvedSections {
  const calendarViews = views.filter(
    (v): v is 'year' | 'month' | 'day' => v === 'year' || v === 'month' || v === 'day',
  )
  const hasTimeViews =
    views.includes('hours') ||
    views.includes('minutes') ||
    views.includes('seconds') ||
    views.includes('milliseconds') ||
    showSeconds ||
    showMilliseconds

  if (mode === 'date') {
    return {
      calendarViews: calendarViews.length > 0 ? calendarViews : [...DEFAULT_CALENDAR_VIEWS],
      showCalendar: true,
      showTime: false,
    }
  }

  if (mode === 'time') {
    return {
      calendarViews: [],
      showCalendar: false,
      showTime: true,
    }
  }

  return {
    calendarViews: calendarViews.length > 0 ? calendarViews : [...DEFAULT_CALENDAR_VIEWS],
    showCalendar: calendarViews.length > 0,
    showTime: hasTimeViews,
  }
}

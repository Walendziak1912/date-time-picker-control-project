import { useState } from 'react'
import { isDateDisabled, isMonthDisabled, isYearDisabled } from '../repository'
import {
  addMonthsTz,
  addYearsTz,
  buildCalendarDaysTz,
  getDate,
  getYear,
  isSameDayTz,
  isSameMonthTz,
  isSameYearTz,
  setMonthPartTz,
  setYearPartTz,
} from '../repository'
import type {
  DateDisableConstraints,
  DateTimePickerTimezone,
  DateTimePickerView,
  ResolvedLocaleText,
} from '../types'

type CalendarView = Extract<DateTimePickerView, 'year' | 'month' | 'day'>

type CalendarProps = {
  month: Date
  value: Date | null
  locale: string
  timezone: DateTimePickerTimezone
  text: ResolvedLocaleText
  showDaysOutsideCurrentMonth: boolean
  disableHighlightToday: boolean
  enabledViews: CalendarView[]
  openTo?: CalendarView
  yearsOrder?: 'asc' | 'desc'
  yearsPerRow?: 3 | 4
  monthsPerRow?: 3 | 4
  dateConstraints: DateDisableConstraints
  onMonthChange: (month: Date) => void
  onSelectDay: (day: Date) => void
  onViewChange?: (view: CalendarView) => void
  onYearChange?: (year: Date) => void
}

export function Calendar({
  month,
  value,
  locale,
  timezone,
  text,
  showDaysOutsideCurrentMonth,
  disableHighlightToday,
  enabledViews,
  openTo,
  yearsOrder = 'asc',
  yearsPerRow = 4,
  monthsPerRow = 3,
  dateConstraints,
  onMonthChange,
  onSelectDay,
  onViewChange,
  onYearChange,
}: CalendarProps) {
  const initialView: CalendarView =
    openTo && enabledViews.includes(openTo)
      ? openTo
      : enabledViews.includes('day')
        ? 'day'
        : enabledViews[0] ?? 'day'

  const [view, setView] = useState<CalendarView>(initialView)
  const weekdays = text.weekdayLabels
  const monthLabels = text.monthLabels
  const days = buildCalendarDaysTz(month, showDaysOutsideCurrentMonth, timezone)
  const today = new Date()
  const monthYear = getYear(month, timezone)

  const disableOpts = dateConstraints

  const switchView = (next: CalendarView) => {
    setView(next)
    onViewChange?.(next)
  }

  const canSwitchTo = (target: CalendarView) => enabledViews.includes(target)

  const title =
    view === 'year'
      ? `${Math.floor(monthYear / 12) * 12} – ${Math.floor(monthYear / 12) * 12 + 11}`
      : view === 'month'
        ? String(monthYear)
        : new Intl.DateTimeFormat(locale, {
            month: 'long',
            year: 'numeric',
            timeZone: timezone === 'UTC' ? 'UTC' : undefined,
          }).format(month)

  const onTitleClick = () => {
    if (view === 'day' && canSwitchTo('month')) switchView('month')
    else if (view === 'month' && canSwitchTo('year')) switchView('year')
    else if (view === 'year' && canSwitchTo('day')) switchView('day')
    else if (view === 'year' && canSwitchTo('month')) switchView('month')
  }

  const onPrev = () => {
    if (view === 'day') onMonthChange(addMonthsTz(month, -1, timezone))
    else if (view === 'month') onMonthChange(addYearsTz(month, -1, timezone))
    else onMonthChange(addYearsTz(month, -12, timezone))
  }

  const onNext = () => {
    if (view === 'day') onMonthChange(addMonthsTz(month, 1, timezone))
    else if (view === 'month') onMonthChange(addYearsTz(month, 1, timezone))
    else onMonthChange(addYearsTz(month, 12, timezone))
  }

  const selectMonth = (monthIndex: number) => {
    const next = setMonthPartTz(month, monthIndex, timezone)
    onMonthChange(next)
    if (canSwitchTo('day')) switchView('day')
  }

  const selectYear = (year: number) => {
    const next = setYearPartTz(month, year, timezone)
    onMonthChange(next)
    onYearChange?.(next)
    if (canSwitchTo('month')) switchView('month')
    else if (canSwitchTo('day')) switchView('day')
  }

  const yearStart = Math.floor(monthYear / 12) * 12
  let years = Array.from({ length: 12 }, (_, i) => yearStart + i)
  if (yearsOrder === 'desc') years = [...years].reverse()

  return (
    <div className="dtp-calendar">
      <div className="dtp-calendar-header">
        <button
          type="button"
          className="dtp-icon-btn"
          aria-label={text.prev}
          onClick={onPrev}
        >
          ‹
        </button>
        <button
          type="button"
          className="dtp-calendar-title"
          onClick={onTitleClick}
          aria-label={text.switchCalendarView}
        >
          {title}
        </button>
        <button
          type="button"
          className="dtp-icon-btn"
          aria-label={text.next}
          onClick={onNext}
        >
          ›
        </button>
      </div>

      {view === 'day' && (
        <>
          <div className="dtp-weekdays">
            {weekdays.map((label) => (
              <div key={label} className="dtp-weekday">
                {label}
              </div>
            ))}
          </div>
          <div className="dtp-days" role="grid">
            {days.map((day) => {
              const outside = !isSameMonthTz(day, month, timezone)
              if (outside && !showDaysOutsideCurrentMonth) {
                return <div key={day.toISOString()} className="dtp-day dtp-day--empty" />
              }

              const selected = value ? isSameDayTz(day, value, timezone) : false
              const isToday = !disableHighlightToday && isSameDayTz(day, today, timezone)
              const disabled = isDateDisabled(day, disableOpts)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  role="gridcell"
                  disabled={disabled}
                  aria-selected={selected}
                  className={[
                    'dtp-day',
                    outside ? 'dtp-day--outside' : '',
                    selected ? 'dtp-day--selected' : '',
                    isToday ? 'dtp-day--today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectDay(day)}
                >
                  {getDate(day, timezone)}
                </button>
              )
            })}
          </div>
        </>
      )}

      {view === 'month' && (
        <div
          className="dtp-month-grid"
          style={{ gridTemplateColumns: `repeat(${monthsPerRow}, 1fr)` }}
          role="listbox"
          aria-label={text.month}
        >
          {monthLabels.map((label, index) => {
            const candidate = setMonthPartTz(month, index, timezone)
            const selected = value
              ? isSameMonthTz(candidate, value, timezone)
              : isSameMonthTz(candidate, month, timezone)
            const disabled = isMonthDisabled(candidate, disableOpts)
            return (
              <button
                key={label}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className={[
                  'dtp-month-btn',
                  selected ? 'dtp-month-btn--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectMonth(index)}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {view === 'year' && (
        <div
          className="dtp-year-grid"
          style={{ gridTemplateColumns: `repeat(${yearsPerRow}, 1fr)` }}
          role="listbox"
          aria-label={text.year}
        >
          {years.map((year) => {
            const candidate = setYearPartTz(month, year, timezone)
            const selected = value
              ? isSameYearTz(candidate, value, timezone)
              : isSameYearTz(candidate, month, timezone)
            const isCurrent = year === getYear(today, timezone)
            const disabled = isYearDisabled(candidate, disableOpts)
            return (
              <button
                key={year}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                className={[
                  'dtp-year-btn',
                  selected ? 'dtp-year-btn--selected' : '',
                  isCurrent ? 'dtp-year-btn--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => selectYear(year)}
              >
                {year}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

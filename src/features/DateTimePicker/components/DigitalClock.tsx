import { useEffect, useRef, useState, type RefObject } from 'react'
import { isTimeDisabled, range } from '../repository'
import {
  getHours,
  getMilliseconds,
  getMinutes,
  getSeconds,
  setTimePartTz,
} from '../repository'
import type {
  DateTimePickerTimezone,
  ResolvedLocaleText,
  TimeDisableConstraints,
} from '../types'

type ClockView = 'hours' | 'minutes' | 'seconds' | 'milliseconds'

type DigitalClockProps = {
  value: Date | null
  timezone: DateTimePickerTimezone
  ampm: boolean
  showSeconds: boolean
  showMilliseconds: boolean
  hourStep: number
  minuteStep: number
  secondStep: number
  millisecondStep: number
  text: ResolvedLocaleText
  timeConstraints: TimeDisableConstraints
  onChange: (next: Date) => void
}

export function DigitalClock({
  value,
  timezone,
  ampm,
  showSeconds,
  showMilliseconds,
  hourStep,
  minuteStep,
  secondStep,
  millisecondStep,
  timeConstraints,
  onChange,
  text,
}: DigitalClockProps) {
  const base = value ?? new Date()
  const hours24 = getHours(base, timezone)
  const minutes = getMinutes(base, timezone)
  const seconds = getSeconds(base, timezone)
  const milliseconds = getMilliseconds(base, timezone)
  const resolvedSeconds = showSeconds ? seconds : 0
  const resolvedMilliseconds = showMilliseconds ? milliseconds : 0
  const isPm = hours24 >= 12
  const displayHour = ampm ? hours24 % 12 || 12 : hours24

  const [activeView, setActiveView] = useState<ClockView>('hours')
  const hoursRef = useRef<HTMLUListElement>(null)
  const minutesRef = useRef<HTMLUListElement>(null)
  const secondsRef = useRef<HTMLUListElement>(null)
  const millisecondsRef = useRef<HTMLUListElement>(null)

  const disableOpts = timeConstraints

  const hourValues = ampm
    ? range(12, hourStep).map((h) => (h === 0 ? 12 : h))
    : range(24, hourStep)

  const minuteValues = range(60, minuteStep)
  const secondValues = range(60, secondStep)
  const millisecondValues = range(1000, millisecondStep)

  const columnRef = (view: ClockView) => {
    if (view === 'hours') return hoursRef
    if (view === 'minutes') return minutesRef
    if (view === 'seconds') return secondsRef
    return millisecondsRef
  }

  const scrollToSelected = (view: ClockView) => {
    const list = columnRef(view).current
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    selected?.scrollIntoView({ block: 'center' })
  }

  useEffect(() => {
    scrollToSelected(activeView)
  }, [activeView, hours24, minutes, seconds, milliseconds])

  const to24Hour = (hourLabel: number, pm: boolean) => {
    if (!ampm) return hourLabel
    if (hourLabel === 12) return pm ? 12 : 0
    return pm ? hourLabel + 12 : hourLabel
  }

  const selectHour = (hourLabel: number) => {
    onChange(
      setTimePartTz(
        base,
        to24Hour(hourLabel, isPm),
        minutes,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      ),
    )
    setActiveView('minutes')
  }

  const selectMeridiem = (pm: boolean) => {
    const hour12 = hours24 % 12 || 12
    onChange(
      setTimePartTz(
        base,
        to24Hour(hour12, pm),
        minutes,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      ),
    )
  }

  const candidateFor = (view: ClockView, item: number): Date => {
    if (view === 'hours') {
      return setTimePartTz(
        base,
        to24Hour(item, isPm),
        minutes,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      )
    }
    if (view === 'minutes') {
      return setTimePartTz(
        base,
        hours24,
        item,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      )
    }
    if (view === 'seconds') {
      return setTimePartTz(base, hours24, minutes, item, timezone, resolvedMilliseconds)
    }
    return setTimePartTz(base, hours24, minutes, resolvedSeconds, timezone, item)
  }

  const viewLabel = (view: ClockView) => {
    if (view === 'hours') return text.hours
    if (view === 'minutes') return text.minutes
    if (view === 'seconds') return text.seconds
    return text.milliseconds
  }

  const renderColumn = (
    items: number[],
    selected: number,
    view: ClockView,
    listRef: RefObject<HTMLUListElement | null>,
    onSelect: (n: number) => void,
    pad = 2,
  ) => (
    <ul
      ref={listRef}
      className="dtp-time-column"
      role="listbox"
      aria-label={viewLabel(view)}
    >
      {items.map((item) => {
        const disabled = isTimeDisabled(candidateFor(view, item), view, disableOpts)

        return (
          <li key={`${view}-${item}`}>
            <button
              type="button"
              role="option"
              aria-selected={item === selected}
              disabled={disabled}
              className={[
                'dtp-time-item',
                item === selected ? 'dtp-time-item--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(item)}
            >
              {String(item).padStart(pad, '0')}
            </button>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="dtp-time">
      <div className="dtp-time-header">
        <div className="dtp-time-toolbar">
          <button
            type="button"
            className={['dtp-time-tab', activeView === 'hours' ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveView('hours')}
          >
            {String(displayHour).padStart(2, '0')}
          </button>
          <span className="dtp-time-separator">:</span>
          <button
            type="button"
            className={['dtp-time-tab', activeView === 'minutes' ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setActiveView('minutes')}
          >
            {String(minutes).padStart(2, '0')}
          </button>
          {showSeconds && (
            <>
              <span className="dtp-time-separator">:</span>
              <button
                type="button"
                className={['dtp-time-tab', activeView === 'seconds' ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveView('seconds')}
              >
                {String(seconds).padStart(2, '0')}
              </button>
            </>
          )}
          {showMilliseconds && (
            <>
              <span className="dtp-time-separator">:</span>
              <button
                type="button"
                className={[
                  'dtp-time-tab',
                  activeView === 'milliseconds' ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setActiveView('milliseconds')}
              >
                {String(milliseconds).padStart(3, '0')}
              </button>
            </>
          )}
          {ampm && (
            <div className="dtp-time-meridiem">
              {(['AM', 'PM'] as const).map((label) => {
                const pm = label === 'PM'
                return (
                  <button
                    key={label}
                    type="button"
                    className={[
                      'dtp-time-meridiem-btn',
                      pm === isPm ? 'is-active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => selectMeridiem(pm)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div className="dtp-time-columns">
        {renderColumn(hourValues, displayHour, 'hours', hoursRef, selectHour)}
        {renderColumn(minuteValues, minutes, 'minutes', minutesRef, (m) => {
          onChange(
            setTimePartTz(
              base,
              hours24,
              m,
              resolvedSeconds,
              timezone,
              resolvedMilliseconds,
            ),
          )
          if (showSeconds) setActiveView('seconds')
          else if (showMilliseconds) setActiveView('milliseconds')
        })}
        {showSeconds &&
          renderColumn(secondValues, seconds, 'seconds', secondsRef, (s) => {
            onChange(
              setTimePartTz(base, hours24, minutes, s, timezone, resolvedMilliseconds),
            )
            if (showMilliseconds) setActiveView('milliseconds')
          })}
        {showMilliseconds &&
          renderColumn(
            millisecondValues,
            milliseconds,
            'milliseconds',
            millisecondsRef,
            (ms) => onChange(setTimePartTz(base, hours24, minutes, resolvedSeconds, timezone, ms)),
            3,
          )}
        {ampm && (
          <ul className="dtp-time-column dtp-time-column--meridiem" role="listbox" aria-label={text.meridiem}>
            {(['AM', 'PM'] as const).map((label) => {
              const pm = label === 'PM'
              return (
                <li key={label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={pm === isPm}
                    className={[
                      'dtp-time-item',
                      pm === isPm ? 'dtp-time-item--selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => selectMeridiem(pm)}
                  >
                    {label}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

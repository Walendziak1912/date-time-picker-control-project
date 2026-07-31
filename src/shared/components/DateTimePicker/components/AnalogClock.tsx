import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { isTimeDisabled, snapToStep } from '../repository'
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

type AnalogClockProps = {
  value: Date | null
  timezone: DateTimePickerTimezone
  ampm: boolean
  showSeconds: boolean
  showMilliseconds: boolean
  minuteStep: number
  secondStep: number
  millisecondStep: number
  text: ResolvedLocaleText
  timeConstraints: TimeDisableConstraints
  onChange: (next: Date) => void
}

const SIZE = 200
const CENTER = SIZE / 2
const OUTER_R = 82
const INNER_R = 52

export function AnalogClock({
  value,
  timezone,
  ampm,
  showSeconds,
  showMilliseconds,
  minuteStep,
  secondStep,
  millisecondStep,
  timeConstraints,
  onChange,
  text,
}: AnalogClockProps) {
  const base = value ?? new Date()
  const [clockView, setClockView] = useState<ClockView>('hours')
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const hours24 = getHours(base, timezone)
  const minutes = getMinutes(base, timezone)
  const seconds = getSeconds(base, timezone)
  const milliseconds = getMilliseconds(base, timezone)
  const resolvedSeconds = showSeconds ? seconds : 0
  const resolvedMilliseconds = showMilliseconds ? milliseconds : 0
  const isPm = hours24 >= 12

  const disableOpts = timeConstraints

  const selectedValue =
    clockView === 'hours'
      ? ampm
        ? hours24 % 12 || 12
        : hours24
      : clockView === 'minutes'
        ? minutes
        : clockView === 'seconds'
          ? seconds
          : milliseconds

  const angleFor = (valueNum: number, max: number) => {
    const unit = 360 / max
    return valueNum * unit - 90
  }

  const handAngle =
    clockView === 'hours'
      ? angleFor(hours24 % 12, 12)
      : clockView === 'minutes'
        ? angleFor(minutes, 60)
        : clockView === 'seconds'
          ? angleFor(seconds, 60)
          : angleFor(milliseconds, 1000)

  const handRadius = (): number => {
    if (clockView === 'minutes' || clockView === 'seconds' || clockView === 'milliseconds') {
      return OUTER_R
    }
    if (ampm) return OUTER_R
    return hours24 < 12 ? INNER_R : OUTER_R
  }

  const radius = handRadius()

  const applyFromPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    let deg = (Math.atan2(y, x) * 180) / Math.PI + 90
    if (deg < 0) deg += 360

    if (clockView === 'hours') {
      const index = Math.round(deg / 30) % 12
      let nextHours: number
      if (ampm) {
        const hour12 = index === 0 ? 12 : index
        nextHours = hour12 === 12 ? (isPm ? 12 : 0) : isPm ? hour12 + 12 : hour12
      } else {
        const useInner = Math.hypot(x, y) < (INNER_R + OUTER_R) / 2
        nextHours = useInner ? index : index === 0 ? 12 : index + 12
      }
      const next = setTimePartTz(
        base,
        nextHours,
        minutes,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      )
      if (!isTimeDisabled(next, 'hours', disableOpts)) onChange(next)
    } else if (clockView === 'minutes') {
      const raw = Math.round(deg / 6) % 60
      const snapped = snapToStep(raw, minuteStep, 60)
      const next = setTimePartTz(
        base,
        hours24,
        snapped,
        resolvedSeconds,
        timezone,
        resolvedMilliseconds,
      )
      if (!isTimeDisabled(next, 'minutes', disableOpts)) onChange(next)
    } else if (clockView === 'seconds') {
      const raw = Math.round(deg / 6) % 60
      const snapped = snapToStep(raw, secondStep, 60)
      const next = setTimePartTz(
        base,
        hours24,
        minutes,
        snapped,
        timezone,
        resolvedMilliseconds,
      )
      if (!isTimeDisabled(next, 'seconds', disableOpts)) onChange(next)
    } else {
      const raw = Math.round(deg / 0.36) % 1000
      const snapped = snapToStep(raw, millisecondStep, 1000)
      const next = setTimePartTz(
        base,
        hours24,
        minutes,
        resolvedSeconds,
        timezone,
        snapped,
      )
      if (!isTimeDisabled(next, 'milliseconds', disableOpts)) onChange(next)
    }
  }

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    applyFromPointer(event.clientX, event.clientY)
  }

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return
    applyFromPointer(event.clientX, event.clientY)
  }

  const onPointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (clockView === 'hours') setClockView('minutes')
    else if (clockView === 'minutes' && showSeconds) setClockView('seconds')
    else if (clockView === 'seconds' && showMilliseconds) setClockView('milliseconds')
  }

  const hourNumbers = ampm
    ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
    : null

  const handRad = (handAngle * Math.PI) / 180
  const handX = CENTER + Math.cos(handRad) * radius
  const handY = CENTER + Math.sin(handRad) * radius

  const display =
    clockView === 'hours'
      ? String(ampm ? hours24 % 12 || 12 : hours24).padStart(2, '0')
      : clockView === 'milliseconds'
        ? String(selectedValue).padStart(3, '0')
        : String(selectedValue).padStart(2, '0')

  const clockViewLabel =
    clockView === 'hours'
      ? text.hours
      : clockView === 'minutes'
        ? text.minutes
        : clockView === 'seconds'
          ? text.seconds
          : text.milliseconds

  return (
    <div className="dtp-analog">
      <div className="dtp-time-header">
        <div className="dtp-time-toolbar">
          <button
            type="button"
            className={['dtp-time-tab', clockView === 'hours' ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setClockView('hours')}
          >
            {String(ampm ? hours24 % 12 || 12 : hours24).padStart(2, '0')}
          </button>
          <span className="dtp-time-separator">:</span>
          <button
            type="button"
            className={['dtp-time-tab', clockView === 'minutes' ? 'is-active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setClockView('minutes')}
          >
            {String(minutes).padStart(2, '0')}
          </button>
          {showSeconds && (
            <>
              <span className="dtp-time-separator">:</span>
              <button
                type="button"
                className={['dtp-time-tab', clockView === 'seconds' ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setClockView('seconds')}
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
                  clockView === 'milliseconds' ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setClockView('milliseconds')}
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
                    onClick={() => {
                      const hour12 = hours24 % 12 || 12
                      const nextHours = hour12 === 12 ? (pm ? 12 : 0) : pm ? hour12 + 12 : hour12
                      onChange(
                        setTimePartTz(
                          base,
                          nextHours,
                          minutes,
                          resolvedSeconds,
                          timezone,
                          resolvedMilliseconds,
                        ),
                      )
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <svg
        ref={svgRef}
        className="dtp-analog-face"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="slider"
        aria-label={clockViewLabel}
        aria-valuetext={display}
      >
        <circle cx={CENTER} cy={CENTER} r={OUTER_R + 8} className="dtp-analog-disk" />

        {clockView === 'hours' && ampm &&
          hourNumbers!.map((n) => {
            const idx = n % 12
            const angle = (idx * 30 - 90) * (Math.PI / 180)
            const x = CENTER + Math.cos(angle) * OUTER_R
            const y = CENTER + Math.sin(angle) * OUTER_R
            return (
              <text
                key={n}
                x={x}
                y={y}
                className={[
                  'dtp-analog-number',
                  n === (hours24 % 12 || 12) ? 'is-selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {n}
              </text>
            )
          })}

        {clockView === 'hours' && !ampm &&
          Array.from({ length: 12 }, (_, i) => {
            const outer = i === 0 ? 12 : i + 12
            const inner = i
            const angle = (i * 30 - 90) * (Math.PI / 180)
            const ox = CENTER + Math.cos(angle) * OUTER_R
            const oy = CENTER + Math.sin(angle) * OUTER_R
            const ix = CENTER + Math.cos(angle) * INNER_R
            const iy = CENTER + Math.sin(angle) * INNER_R
            return (
              <g key={i}>
                <text
                  x={ox}
                  y={oy}
                  className={[
                    'dtp-analog-number',
                    hours24 === outer ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {String(outer).padStart(2, '0')}
                </text>
                <text
                  x={ix}
                  y={iy}
                  className={[
                    'dtp-analog-number dtp-analog-number--inner',
                    hours24 === inner ? 'is-selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {String(inner).padStart(2, '0')}
                </text>
              </g>
            )
          })}

        {(clockView === 'minutes' || clockView === 'seconds') &&
          Array.from({ length: 12 }, (_, i) => {
            const n = i * 5
            const angle = (n * 6 - 90) * (Math.PI / 180)
            const x = CENTER + Math.cos(angle) * OUTER_R
            const y = CENTER + Math.sin(angle) * OUTER_R
            const current = clockView === 'minutes' ? minutes : seconds
            return (
              <text
                key={n}
                x={x}
                y={y}
                className={[
                  'dtp-analog-number',
                  current === n ? 'is-selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {String(n).padStart(2, '0')}
              </text>
            )
          })}

        {clockView === 'milliseconds' &&
          Array.from({ length: 10 }, (_, i) => {
            const n = i * 100
            const angle = (n * 0.36 - 90) * (Math.PI / 180)
            const x = CENTER + Math.cos(angle) * OUTER_R
            const y = CENTER + Math.sin(angle) * OUTER_R
            return (
              <text
                key={n}
                x={x}
                y={y}
                className={[
                  'dtp-analog-number',
                  milliseconds === n ? 'is-selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {String(n).padStart(3, '0')}
              </text>
            )
          })}

        <line
          x1={CENTER}
          y1={CENTER}
          x2={handX}
          y2={handY}
          className="dtp-analog-hand"
        />
        <circle cx={CENTER} cy={CENTER} r={5} className="dtp-analog-pin" />
        <circle cx={handX} cy={handY} r={14} className="dtp-analog-thumb" />
      </svg>
    </div>
  )
}

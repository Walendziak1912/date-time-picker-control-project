import { Dropdown } from 'primereact/dropdown'
import type { ReactNode } from 'react'

import type { DateTimeRangeFlexibility, DateTimeRangeFlexOption } from '../types'

type DateTimeRangeFlexDatesProps = {
  label?: ReactNode
  value: DateTimeRangeFlexibility
  options: DateTimeRangeFlexOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  onChange: (flexibility: DateTimeRangeFlexibility) => void
}

export function DateTimeRangeFlexDates({
  label,
  value,
  options,
  placeholder,
  disabled = false,
  className,
  onChange,
}: DateTimeRangeFlexDatesProps) {
  return (
    <div className={['dtr-flex-dates', className].filter(Boolean).join(' ')}>
      {label != null && <span className="dtr-flex-dates-label">{label}</span>}
      <Dropdown
        value={value}
        options={options}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        disabled={disabled}
        className="dtr-flex-dates-dropdown"
        onChange={(event) => {
          if (event.value != null) {
            onChange(event.value as DateTimeRangeFlexibility)
          }
        }}
      />
    </div>
  )
}

import { Dropdown } from 'primereact/dropdown'
import type { ReactNode } from 'react'

import type { DateTimeRangePresetKey, DateTimeRangePresetOption } from '../types'

type DateTimeRangePresetsProps = {
  label?: ReactNode
  value: DateTimeRangePresetKey | null
  options: DateTimeRangePresetOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  onChange: (preset: DateTimeRangePresetKey) => void
}

export function DateTimeRangePresets({
  label,
  value,
  options,
  placeholder = 'Wybierz okres',
  disabled = false,
  className,
  onChange,
}: DateTimeRangePresetsProps) {
  return (
    <div className={['dtr-presets', className].filter(Boolean).join(' ')}>
      {label != null && <span className="dtr-presets-label">{label}</span>}
      <Dropdown
        value={value}
        options={options}
        optionLabel="label"
        optionValue="key"
        placeholder={placeholder}
        disabled={disabled}
        className="dtr-presets-dropdown"
        onChange={(event) => {
          if (event.value != null) {
            onChange(event.value as DateTimeRangePresetKey)
          }
        }}
      />
    </div>
  )
}

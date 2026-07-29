import { useCallback, useEffect, useMemo, useState } from 'react'

import { DEFAULT_PRESET_OPTIONS, getPresetRange, matchPreset } from '../repository'
import type {
  DateTimeRangePresetKey,
  DateTimeRangePresetOption,
  DateTimeRangeValue,
} from '../types'
import type { DateTimePickerTimezone } from '../../DateTimePicker'

type UseDateTimeRangePresetsOptions = {
  enabled: boolean
  preset?: DateTimeRangePresetKey | null
  defaultPreset?: DateTimeRangePresetKey | null
  onPresetChange?: (preset: DateTimeRangePresetKey | null) => void
  presetOptions?: DateTimeRangePresetOption[]
  timezone: DateTimePickerTimezone
  value: DateTimeRangeValue
}

export function useDateTimeRangePresets({
  enabled,
  preset: presetProp,
  defaultPreset = null,
  onPresetChange,
  presetOptions = DEFAULT_PRESET_OPTIONS,
  timezone,
  value,
}: UseDateTimeRangePresetsOptions) {
  const isControlled = presetProp !== undefined
  const [internalPreset, setInternalPreset] = useState<DateTimeRangePresetKey | null>(
    defaultPreset,
  )

  const preset = isControlled ? (presetProp ?? null) : internalPreset

  const syncPresetFromValue = useCallback(() => {
    if (!enabled) return
    const matched = matchPreset(value, timezone, presetOptions)
    if (matched === preset) return

    if (!isControlled) {
      setInternalPreset(matched)
    }
    onPresetChange?.(matched)
  }, [enabled, isControlled, onPresetChange, preset, presetOptions, timezone, value])

  useEffect(() => {
    syncPresetFromValue()
  }, [syncPresetFromValue])

  const setPreset = useCallback(
    (next: DateTimeRangePresetKey | null) => {
      if (!isControlled) {
        setInternalPreset(next)
      }
      onPresetChange?.(next)
    },
    [isControlled, onPresetChange],
  )

  const resolvePresetRange = useCallback(
    (key: DateTimeRangePresetKey) => getPresetRange(key, timezone),
    [timezone],
  )

  const options = useMemo(() => presetOptions, [presetOptions])

  return {
    preset,
    options,
    setPreset,
    resolvePresetRange,
  }
}

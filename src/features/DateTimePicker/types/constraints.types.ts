export type DateDisableConstraints = {
  minDate?: Date
  maxDate?: Date
  minDateTime?: Date
  maxDateTime?: Date
  disablePast?: boolean
  disableFuture?: boolean
  shouldDisableDate?: (day: Date) => boolean
  shouldDisableMonth?: (month: Date) => boolean
  shouldDisableYear?: (year: Date) => boolean
}

export type TimeDisableConstraints = {
  minTime?: Date
  maxTime?: Date
  minDateTime?: Date
  maxDateTime?: Date
  disablePast?: boolean
  disableFuture?: boolean
  shouldDisableTime?: (
    value: Date,
    view: 'hours' | 'minutes' | 'seconds' | 'milliseconds',
  ) => boolean
}

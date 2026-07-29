export type SupportedLocale = 'pl-PL' | 'en-US'

export const DEFAULT_LOCALE: SupportedLocale = 'pl-PL'

export function normalizeLocale(locale?: string): SupportedLocale {
  return locale === 'en-US' ? 'en-US' : 'pl-PL'
}

export type PopoverAppendTarget = HTMLElement | 'inline'

/** Domyślnie `document.body` (jak PrimeReact Calendar); `'self'` — panel w drzewie komponentu. */
export function resolvePopoverAppendTarget(
  appendTo?: HTMLElement | 'self',
): PopoverAppendTarget {
  if (appendTo === 'self') return 'inline'
  if (appendTo != null) return appendTo
  if (typeof document !== 'undefined') return document.body
  return 'inline'
}

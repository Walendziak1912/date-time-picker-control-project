import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

export type PopoverPlacement = 'bottom' | 'top'

export type PopoverLayout = {
  placement: PopoverPlacement
  /** Ustawiane przy renderze w portalu (`position: fixed`). */
  fixedStyle?: CSSProperties
}

const VIEWPORT_MARGIN = 8
const POPOVER_GAP_PX = 4
/** Nad typowymi overlay PrimeReact (np. Dialog ~1100). */
export const POPOVER_PORTAL_Z_INDEX = 1101

export function usePopoverPlacement(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  portaled: boolean,
): PopoverLayout {
  const [layout, setLayout] = useState<PopoverLayout>({ placement: 'bottom' })

  const updatePlacement = useCallback(() => {
    const root = rootRef.current
    const popover = popoverRef.current
    if (!root || !popover) return

    const fieldRect = root.getBoundingClientRect()
    const popoverHeight = popover.offsetHeight
    const viewportHeight = window.innerHeight

    const spaceBelow = viewportHeight - fieldRect.bottom - VIEWPORT_MARGIN
    const spaceAbove = fieldRect.top - VIEWPORT_MARGIN

    // Rozwiń w górę tylko gdy poniżej brakuje miejsca, a powyżej jest go więcej
    const placement: PopoverPlacement =
      popoverHeight > spaceBelow && spaceAbove > spaceBelow ? 'top' : 'bottom'

    if (!portaled) {
      setLayout({ placement })
      return
    }

    const top =
      placement === 'bottom'
        ? fieldRect.bottom + POPOVER_GAP_PX
        : fieldRect.top - popoverHeight - POPOVER_GAP_PX

    setLayout({
      placement,
      fixedStyle: {
        position: 'fixed',
        top,
        left: fieldRect.left,
        minWidth: fieldRect.width,
        zIndex: POPOVER_PORTAL_Z_INDEX,
      },
    })
  }, [rootRef, popoverRef, portaled])

  useLayoutEffect(() => {
    if (!open) {
      setLayout({ placement: 'bottom' })
      return
    }
    updatePlacement()
  }, [open, updatePlacement])

  useEffect(() => {
    if (!open) return

    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)
    return () => {
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [open, updatePlacement])

  return layout
}

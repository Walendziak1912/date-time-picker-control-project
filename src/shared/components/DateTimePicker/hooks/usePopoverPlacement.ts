import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react'

export type PopoverPlacement = 'bottom' | 'top'

const VIEWPORT_MARGIN = 8
export function usePopoverPlacement(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
): PopoverPlacement {
  const [placement, setPlacement] = useState<PopoverPlacement>('bottom')

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
    if (popoverHeight > spaceBelow && spaceAbove > spaceBelow) {
      setPlacement('top')
    } else {
      setPlacement('bottom')
    }
  }, [rootRef, popoverRef])

  useLayoutEffect(() => {
    if (!open) {
      setPlacement('bottom')
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

  return placement
}

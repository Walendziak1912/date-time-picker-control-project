import { useEffect, type RefObject } from 'react'

function isInsideOverlayPortal(target: Node): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('.p-dropdown-panel, .p-multiselect-panel, .p-connected-overlay'),
  )
}

export function usePopoverDismiss(
  open: boolean,
  rootRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (isInsideOverlayPortal(target)) return
      onDismiss()
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, rootRef, onDismiss])
}

import { useCallback, useRef } from 'react'
import { Toast } from 'primereact/toast'
import type { ToastMessage } from 'primereact/toast'

export function useAppToast() {
  const toastRef = useRef<Toast>(null)

  const showToast = useCallback((message: ToastMessage) => {
    toastRef.current?.show(message)
  }, [])

  const showError = useCallback(
    (detail: string, summary = 'Błąd') => {
      showToast({
        severity: 'error',
        summary,
        detail,
        life: 4000,
      })
    },
    [showToast],
  )

  const toastElement = <Toast ref={toastRef} position="top-right" />

  return { toastElement, showToast, showError }
}

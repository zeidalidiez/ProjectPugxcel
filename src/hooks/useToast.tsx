import { useState } from 'react'
import Toast from '../components/Toast'

export function useToast() {
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

  return {
    toast,
    showToast: (message: string, variant: 'success' | 'error' = 'success') => setToast({ message, variant }),
    ToastComponent: toast ? (
      <Toast message={toast.message} variant={toast.variant} onDone={() => setToast(null)} />
    ) : null,
  }
}

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  variant: 'success' | 'error'
  onDone: () => void
}

function Toast({ message, variant, onDone }: ToastProps) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000)
    return () => clearTimeout(id)
  }, [onDone])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded border text-sm font-mono font-bold shadow-lg animate-toast-in ${
        variant === 'success'
          ? 'bg-terminal-pass/10 border-terminal-pass text-terminal-pass'
          : 'bg-terminal-fail/10 border-terminal-fail text-terminal-fail'
      }`}
    >
      {message}
    </div>
  )
}

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

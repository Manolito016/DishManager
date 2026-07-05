import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: ((v: boolean) => void) } | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = (value: boolean) => {
    confirmState?.resolve(value);
    setConfirmState(null);
  };

  const removeToast = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const iconMap = {
    success: <CheckCircle size={16} className="text-success shrink-0" />,
    error: <XCircle size={16} className="text-danger shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
    info: <AlertTriangle size={16} className="text-primary shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-lg text-sm text-text dark:text-text-dark animate-[slideIn_0.2s_ease-out]"
          >
            {iconMap[t.type]}
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-1 text-muted hover:text-text cursor-pointer">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40" onClick={() => handleConfirm(false)}>
          <div
            className="bg-surface dark:bg-surface-dark rounded-2xl border border-border dark:border-border-dark shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-text dark:text-text-dark text-base mb-5">{confirmState.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleConfirm(false)}
                className="px-4 py-2 text-sm rounded-xl border border-border dark:border-border-dark text-text dark:text-text-dark hover:bg-bg dark:hover:bg-bg-dark transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="px-4 py-2 text-sm rounded-xl bg-danger text-white hover:opacity-90 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

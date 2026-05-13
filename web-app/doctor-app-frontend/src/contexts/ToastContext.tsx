import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  message: string;
  severity: Severity;
}

type ToastFn = (message: string, severity?: Severity) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, severity: Severity = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, severity }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {toasts.map((t, index) => (
        <Snackbar
          key={t.id}
          open
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ top: `${16 + index * 72}px !important` }}
        >
          <Alert
            severity={t.severity}
            onClose={() => remove(t.id)}
            variant="filled"
            sx={{ minWidth: 280, boxShadow: 3 }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

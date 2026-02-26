"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastVariant = "default" | "destructive" | "success";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastInternal = ToastOptions & {
  id: number;
};

type ToastContextValue = {
  toast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random();
      const duration = options.duration ?? 3500;

      setToasts((prev) => [...prev, { id, ...options }]);

      if (duration > 0) {
        window.setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Viewport */}
      <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => remove(t.id)}
            className={`w-full max-w-sm rounded-lg border px-4 py-3 text-left shadow-lg transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background/95 backdrop-blur ${
              t.variant === "destructive"
                ? "border-red-300 bg-red-50 text-red-900"
                : t.variant === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                : "border-gray-200 bg-white text-gray-900"
            }`}
          >
            {t.title && (
              <p className="text-sm font-semibold leading-snug">{t.title}</p>
            )}
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

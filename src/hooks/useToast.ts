/**
 * Hook personalizado para gestionar notificaciones Toast
 */

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({
        message,
        type,
        isVisible: true,
      });
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    setToast({
      message,
      type: "success",
      isVisible: true,
    });
  }, []);

  const showError = useCallback((message: string) => {
    setToast({
      message,
      type: "error",
      isVisible: true,
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    setToast({
      message,
      type: "warning",
      isVisible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return {
    toast,
    showToast,
    showSuccess,
    showError,
    showWarning,
    hideToast,
  };
}

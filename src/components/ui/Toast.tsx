/**
 * Componente de notificaciones Toast
 * Notificaciones elegantes y animadas para feedback al usuario
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={24} className="text-green-500" />;
      case "error":
        return <XCircle size={24} className="text-red-500" />;
      case "warning":
        return <AlertCircle size={24} className="text-yellow-500" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  const getProgressBarColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -50, x: "-50%" }}
          className="fixed top-6 left-1/2 z-[9999] w-full max-w-md px-4"
        >
          <div
            className={`relative rounded-xl border-2 shadow-xl ${getStyles()} overflow-hidden`}
          >
            {/* Contenido */}
            <div className="flex items-start gap-3 p-4">
              <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Barra de progreso */}
            {duration > 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`h-1 ${getProgressBarColor()}`}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";

interface SuccessMessageProps {
  show: boolean;
}

export const SuccessMessage = ({ show }: SuccessMessageProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
        >
          <Check className="w-5 h-5" />
          Producto agregado al carrito
        </motion.div>
      )}
    </AnimatePresence>
  );
};

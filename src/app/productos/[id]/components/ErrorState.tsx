import { AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
  onBackToProducts: () => void;
}

export const ErrorState = ({ error, onRetry, onBackToProducts }: ErrorStateProps) => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar producto
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "No se pudo encontrar el producto"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRetry}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600"
            >
              Reintentar
            </button>
            <button
              onClick={onBackToProducts}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Volver a productos
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

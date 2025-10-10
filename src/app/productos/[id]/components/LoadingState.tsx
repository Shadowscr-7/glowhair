import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export const LoadingState = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-rose-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    </>
  );
};

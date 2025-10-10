import { ShampooIcon, ConditionerIcon, MaskIcon, SerumIcon, OilIcon } from "@/components/ui/ProductIcons";

// Helper para seleccionar icono según categoría
export const getCategoryIcon = (categoryName: string) => {
  const lower = categoryName.toLowerCase();
  
  if (lower.includes('shampoo') || lower.includes('champú')) {
    return <ShampooIcon className="w-full h-full" />;
  }
  if (lower.includes('acondicionador') || lower.includes('conditioner')) {
    return <ConditionerIcon className="w-full h-full" />;
  }
  if (lower.includes('mascarilla') || lower.includes('mask')) {
    return <MaskIcon className="w-full h-full" />;
  }
  if (lower.includes('serum')) {
    return <SerumIcon className="w-full h-full" />;
  }
  if (lower.includes('aceite') || lower.includes('oil')) {
    return <OilIcon className="w-full h-full" />;
  }
  
  // Default: gradient placeholder
  return (
    <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center">
      <span className="text-white text-6xl font-bold">
        {categoryName.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

import { useState } from "react";

export const useQuantity = (maxStock: number) => {
  const [quantity, setQuantity] = useState(1);

  const increase = () => {
    setQuantity(prev => Math.min(maxStock, prev + 1));
  };

  const decrease = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const reset = () => {
    setQuantity(1);
  };

  return { quantity, increase, decrease, reset };
};

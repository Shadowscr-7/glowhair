import { Minus, Plus, ShoppingCart, Heart, Loader2 } from "lucide-react";

interface ProductActionsProps {
  quantity: number;
  stock: number;
  isFavorite: boolean;
  addingToCart: boolean;
  togglingFavorite: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddToCart: () => void;
  onToggleFavorite: () => void;
}

export const ProductActions = ({
  quantity,
  stock,
  isFavorite,
  addingToCart,
  togglingFavorite,
  onIncrease,
  onDecrease,
  onAddToCart,
  onToggleFavorite
}: ProductActionsProps) => {
  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={onIncrease}
            disabled={quantity >= stock || stock === 0}
            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={addingToCart || stock === 0}
          className="flex-1 bg-rose-500 text-white py-4 rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
        >
          {addingToCart ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Agregando...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              {stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </>
          )}
        </button>

        {/* Favorite button */}
        <button
          onClick={onToggleFavorite}
          disabled={togglingFavorite}
          className={`p-4 rounded-lg border-2 transition-colors ${
            isFavorite
              ? "bg-rose-50 border-rose-500 text-rose-500"
              : "border-gray-300 text-gray-400 hover:border-rose-500 hover:text-rose-500"
          } disabled:opacity-50`}
        >
          {togglingFavorite ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
          )}
        </button>
      </div>

      {/* Stock info */}
      <p className="text-sm text-gray-600">
        {stock > 10 ? (
          <span className="text-green-600 font-medium">✓ En stock</span>
        ) : stock > 0 ? (
          <span className="text-orange-600 font-medium">
            ⚠ Solo quedan {stock} unidades
          </span>
        ) : (
          <span className="text-red-600 font-medium">✗ Agotado</span>
        )}
      </p>
    </div>
  );
};

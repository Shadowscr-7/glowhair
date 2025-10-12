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
      {/* Quantity selector - Mejorado para mayor visibilidad */}
      <div className="bg-gradient-to-br from-purple-50 to-rose-50 rounded-lg p-4 border-2 border-purple-200 shadow-sm">
        <label className="block text-xs font-semibold text-gray-700 mb-2">
          Cantidad
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-purple-500 text-gray-700 hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 border border-gray-200 hover:border-transparent"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex-1 bg-white rounded-lg shadow-sm border-2 border-purple-300 px-3 py-2">
            <span className="block text-xl font-bold text-center bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              {quantity}
            </span>
            <span className="block text-[10px] text-center text-gray-500">
              {quantity === 1 ? 'unidad' : 'unidades'}
            </span>
          </div>
          
          <button
            onClick={onIncrease}
            disabled={quantity >= stock || stock === 0}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gradient-to-br hover:from-rose-500 hover:to-purple-500 text-gray-700 hover:text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 border border-gray-200 hover:border-transparent"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {stock > 0 && (
          <p className="text-[10px] text-center text-gray-500 mt-2">
            Máximo disponible: <span className="font-semibold text-purple-600">{stock}</span>
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">{/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={addingToCart || stock === 0}
          className="flex-1 bg-gradient-to-r from-rose-500 to-purple-500 text-white py-3.5 rounded-lg hover:from-rose-600 hover:to-purple-600 flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all transform hover:scale-[1.01]"
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
          className={`p-3.5 rounded-lg border-2 transition-all shadow-md hover:shadow-lg ${
            isFavorite
              ? "bg-rose-50 border-rose-500 text-rose-500"
              : "bg-white border-gray-300 text-gray-400 hover:border-rose-500 hover:text-rose-500"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
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

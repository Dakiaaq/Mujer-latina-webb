import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

interface WishlistViewProps {
  controller: StoreController;
}

export const WishlistView: React.FC<WishlistViewProps> = ({ controller }) => {
  const {
    wishlist,
    wishlistProducts,
    toggleWishlist,
    clearWishlist,
    addToCart,
    navigateToProduct,
    setActiveView,
  } = controller;

  // Auto clean if wishlist has IDs that don't match any real products
  React.useEffect(() => {
    if (wishlist && wishlist.length > 0 && wishlistProducts.length === 0) {
      clearWishlist();
    }
  }, [wishlist, wishlistProducts.length, clearWishlist]);

  if (wishlistProducts.length === 0) {
    return (
      <div className="bg-[#fcfcfc] min-h-[55vh] sm:min-h-[65vh] py-10 sm:py-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-3 sm:space-y-4 px-4">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
            <Heart size={26} className="sm:w-9 sm:h-9" />
          </div>
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-800">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Guarda aquí los productos que amas haciendo clic en el corazón para encontrarlos en cualquier momento.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="mt-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#d4af37] text-black font-bold text-xs sm:text-sm rounded-full shadow hover:bg-[#c29e2f] transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explorar Colecciones</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-4 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header - Compact on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-2.5 sm:gap-4">
          <div>
            <h1 className="font-serif-title text-xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
              <span>Mis Favoritos</span>
              <Heart size={18} className="fill-[#d4af37] text-[#d4af37] sm:w-6 sm:h-6" />
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              Tienes {wishlistProducts.length} producto{wishlistProducts.length > 1 ? 's' : ''} guardado{wishlistProducts.length > 1 ? 's' : ''} en tu lista personal.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-4">
            <button
              onClick={clearWishlist}
              className="text-[11px] sm:text-xs text-stone-500 hover:text-rose-600 transition flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-stone-200 hover:border-rose-200 bg-white cursor-pointer"
              title="Vaciar todos los productos guardados"
            >
              <Trash2 size={12} />
              <span>Vaciar lista</span>
            </button>
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs sm:text-sm font-semibold text-[#b58d24] hover:underline cursor-pointer"
            >
              + Seguir agregando
            </button>
          </div>
        </div>

        {/* Wishlist Grid: 2 columns on mobile (scaled down), 3-4 on tablet/desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {wishlistProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition duration-300 flex flex-col group relative"
                id={`wishlist-card-${product.sku}`}
              >
                {/* Image: Compact aspect ratio on mobile so it doesn't take the full screen */}
                <div
                  onClick={() => navigateToProduct(product)}
                  className="relative aspect-[4/3] sm:aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />

                  {/* Remove from wishlist button (Compact for mobile) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow flex items-center justify-center text-stone-400 hover:text-red-500 transition cursor-pointer"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>

                  {/* Stock status badge */}
                  <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3">
                    {isOutOfStock ? (
                      <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-rose-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full">
                        Agotado
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-600 text-white text-[8px] sm:text-[10px] font-bold rounded-full">
                        En Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Details (Compact text and padding) */}
                <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2.5">
                  <div>
                    <span className="text-[9px] sm:text-[11px] text-[#b58d24] font-semibold uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3
                      onClick={() => navigateToProduct(product)}
                      className="font-serif-title text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#b58d24] transition cursor-pointer line-clamp-1 mt-0.5"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between gap-1">
                    <span className="text-xs sm:text-base font-bold text-stone-900">
                      ${Math.round(product.price).toLocaleString('es-CO')}
                    </span>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-900 hover:bg-[#d4af37] disabled:bg-stone-200 text-white hover:text-black disabled:text-stone-400 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    >
                      <ShoppingBag size={11} className="sm:w-3 sm:h-3" />
                      <span className="hidden xs:inline">{isOutOfStock ? 'Agotado' : 'Bolsa'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

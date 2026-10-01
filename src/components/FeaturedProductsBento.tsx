import React, { useState, useMemo } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Star, ShoppingBag, Heart, ArrowRight, Sparkles, Check } from 'lucide-react';

interface FeaturedProductsBentoProps {
  controller: StoreController;
}

export const FeaturedProductsBento: React.FC<FeaturedProductsBentoProps> = ({ controller }) => {
  const {
    products,
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    setCategoryFilter,
  } = controller;

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Available filter tabs from existing categories
  const filterTabs = [
    { id: 'all', label: 'Todos los Destacados' },
    { id: 'cuidado-facial', label: 'Cuidado Facial' },
    { id: 'joyeria', label: 'Joyería' },
    { id: 'bolsos', label: 'Bolsos' },
    { id: 'tratamientos', label: 'Tratamientos' },
    { id: 'cosmeticos', label: 'Cosméticos' },
    { id: 'esmaltes', label: 'Esmaltes' },
  ];

  // Filter products for this section: featured products or category filtered
  const displayedProducts = useMemo(() => {
    let list = products.filter((p) => p.isFeatured);
    if (selectedCategoryTab !== 'all') {
      list = list.filter((p) => p.categorySlug === selectedCategoryTab);
      // If none featured in that category, take first 4 from that category
      if (list.length === 0) {
        list = products.filter((p) => p.categorySlug === selectedCategoryTab);
      }
    }
    return list.slice(0, 8);
  }, [products, selectedCategoryTab]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToast(`✨ "${product.name}" añadido al carrito`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <section className="py-6 sm:py-14 bg-[#f8f7f4] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Toast alert */}
        {addedToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-[#d4af37] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn">
            <Check size={16} className="text-[#d4af37]" />
            <span>{addedToast}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-8 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#b58d24] font-bold">
              <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Edición De Lujo</span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-0.5 sm:mt-1">
              Colección Destacada
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              Productos seleccionados por su alta calidad, ingredientes botánicos y acabados exclusivos.
            </p>
          </div>

          <button
            onClick={() => {
              setCategoryFilter('all');
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start md:self-auto text-xs sm:text-sm font-semibold text-[#b58d24] hover:text-[#8e6e19] flex items-center gap-1.5 group cursor-pointer"
          >
            <span>Ver catálogo completo ({products.length})</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Filter Tabs (Compact scrollable on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategoryTab(tab.id)}
              className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategoryTab === tab.id
                  ? 'bg-[#d4af37] text-black shadow-xs font-bold'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Compact & Responsive Products Grid */}
        {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {displayedProducts.map((product) => {
            const favorite = isInWishlist(product.id);
            const isLowStock = product.stock <= 5 && product.stock > 0;

            return (
              <div
                key={product.id}
                onClick={() => navigateToProduct(product)}
                className="bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 hover:border-[#d4af37] overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group relative cursor-pointer"
                id={`bento-product-${product.sku}`}
              >
                {/* Compact Image Container */}
                <div className="relative aspect-[4/3] sm:aspect-square w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  
                  {/* Subtle Badge */}
                  {isLowStock ? (
                    <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-amber-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full shadow-xs">
                      Últimas {product.stock}
                    </span>
                  ) : product.isNew ? (
                    <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-[#d4af37] text-black text-[8px] sm:text-[10px] font-bold rounded-full shadow-xs">
                      Nuevo
                    </span>
                  ) : null}

                  {/* Wishlist quick toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow flex items-center justify-center text-stone-500 hover:text-rose-500 transition cursor-pointer"
                    title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    <Heart
                      size={13}
                      className={favorite ? 'fill-rose-500 text-rose-500' : ''}
                    />
                  </button>
                </div>

                {/* Card Body (Compact & Proportional) */}
                <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[11px] text-[#b58d24] font-bold uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h4 className="font-serif-title text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#b58d24] transition line-clamp-1 mt-0.5">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-stone-500">
                      <Star size={11} className="fill-[#d4af37] text-[#d4af37]" />
                      <span className="font-semibold text-stone-800">{product.rating}</span>
                      <span className="text-stone-400">({product.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Price & Add Button */}
                  <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-stone-400 block -mt-0.5">
                        COP
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-1 sm:p-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black rounded-lg sm:rounded-xl transition cursor-pointer shadow-xs"
                      title="Añadir al Carrito"
                    >
                      <ShoppingBag size={13} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* View all bottom CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setCategoryFilter('all');
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-2.5 rounded-full border border-stone-300 hover:border-[#d4af37] bg-white hover:bg-stone-50 text-stone-800 hover:text-stone-900 text-xs sm:text-sm font-semibold transition inline-flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <span>Explorar catálogo completo de Mujer Latina</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
};


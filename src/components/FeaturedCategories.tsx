import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Sparkles, ArrowRight, Layers } from 'lucide-react';

interface FeaturedCategoriesProps {
  controller: StoreController;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ controller }) => {
  const { categories, products, setCategoryFilter, setActiveView } = controller;

  const handleCategoryClick = (slug: string) => {
    setCategoryFilter(slug);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductCountForCategory = (slug: string) => {
    const count = products.filter((p) => p.categorySlug === slug).length;
    return count > 0 ? `${count} productos` : 'Colección';
  };

  return (
    <section className="py-6 sm:py-16 bg-[#fcfcfc] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-10 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#b58d24] font-bold">
              <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Explora Nuestras Líneas</span>
            </div>
            <h2 className="font-serif-title text-xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-0.5 sm:mt-1">
              Categorías Principales
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5 max-w-xl">
              Navega por nuestras colecciones especializadas en belleza, cuidado personal y accesorios.
            </p>
          </div>

          <button
            onClick={() => {
              setCategoryFilter('all');
              setActiveView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="self-start md:self-auto text-xs sm:text-sm font-semibold text-[#b58d24] hover:text-[#8e6e19] flex items-center gap-1.5 transition group cursor-pointer"
          >
            <Layers size={14} className="sm:w-3.5 sm:h-3.5" />
            <span>Ver todo el catálogo</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Organized Categories Grid (Responsive: 2 cols on mobile, 4 on tablet, 8 on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-stone-200/90 hover:border-[#d4af37] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
              id={`cat-card-${cat.slug}`}
            >
              {/* Circular image container with animated gold ring */}
              <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#d4af37] via-amber-200 to-stone-200 group-hover:from-[#d4af37] group-hover:to-[#f3e5ab] transition duration-300 shadow-xs group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500 ease-out"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Title & Product Count */}
              <h3 className="mt-2 text-[11px] sm:text-sm font-bold text-stone-900 group-hover:text-[#b58d24] transition font-serif-title line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[9px] sm:text-[11px] text-stone-500 font-medium group-hover:text-[#b58d24] transition mt-0.5">
                {getProductCountForCategory(cat.slug)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};


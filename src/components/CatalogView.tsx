import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Product } from '../types';
import {
  Search,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Heart,
  Check,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CatalogViewProps {
  controller: StoreController;
}

/**
 * Formats numeric values into standard Colombian Pesos (COP).
 * Examples:
 *   formatPriceCOP(25000)  -> "$ 25.000"
 *   formatPriceCOP(35000)  -> "$ 35.000"
 *   formatPriceCOP(49900)  -> "$ 49.900"
 *   formatPriceCOP(120000) -> "$ 120.000"
 */
function formatPriceCOP(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$ 0';
  }
  const rounded = Math.round(amount);
  return '$ ' + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const CatalogView: React.FC<CatalogViewProps> = ({ controller }) => {
  const {
    products,
    categories,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    onlyInStock,
    setOnlyInStock,
    minRating,
    setMinRating,
    sortBy,
    setSortBy,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateToProduct,
    setActiveView,
  } = controller;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Price range settings for COP (default range up to $ 300.000 COP)
  const [priceMaxCOP, setPriceMaxCOP] = useState<number>(300000);
  const minPossiblePrice = 20000;
  const maxPossiblePrice = 300000;

  // Filtered products computed against COP prices and criteria
  const displayedProducts = useMemo(() => {
    return products
      .filter((p: Product) => {
        // Category filter
        if (categoryFilter !== 'all') {
          if (p.categorySlug !== categoryFilter && p.category !== categoryFilter) {
            return false;
          }
        }
        // Search query (within Catalog only: checks name, sku, category, description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q));
          if (!matches) return false;
        }
        // Price filter in Colombian Pesos
        if (p.price > priceMaxCOP) return false;
        // In stock filter
        if (onlyInStock && p.stock <= 0) return false;
        // Rating filter
        if (minRating > 0 && p.rating < minRating) return false;

        return true;
      })
      .sort((a: Product, b: Product) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        // Default: featured first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [
    products,
    categoryFilter,
    searchQuery,
    priceMaxCOP,
    onlyInStock,
    minRating,
    sortBy,
  ]);

  // Pagination (8 items per page by default for a balanced 4x2 desktop / 2x4 mobile grid)
  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage) || 1;

  // Ensure currentPage doesn't exceed totalPages when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Lock body scroll cleanly when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [mobileFilterOpen]);

  const paginatedProducts = useMemo(() => {
    return displayedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [displayedProducts, currentPage, itemsPerPage]);

  const startItem = displayedProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, displayedProducts.length);

  const scrollToCatalogTop = () => {
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
    setPriceMaxCOP(300000);
    setOnlyInStock(false);
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
    setRecentlyAddedId(product.id);
    setTimeout(() => {
      setRecentlyAddedId((current) => (current === product.id ? null : current));
    }, 1400);
  };

  const activeFiltersCount =
    (categoryFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0) +
    (priceMaxCOP < 300000 ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-6 sm:py-8 border-b border-stone-200" id="catalog-page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="text-xs text-stone-500 uppercase tracking-wider flex items-center gap-2">
            <button
              onClick={() => setActiveView('home')}
              className="hover:text-stone-900 transition font-medium cursor-pointer"
            >
              Inicio
            </button>
            <span className="text-stone-300">/</span>
            <span className="text-stone-900 font-semibold">Catálogo</span>
          </nav>
        </div>

        {/* Catalog Header & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 pb-3 sm:pb-5 border-b border-stone-200/80 mb-4 sm:mb-6">
          <div>
            <h1 className="font-serif-title text-xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight">
              Catálogo de Productos
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5 max-w-xl">
              Fórmulas y productos de alta gama diseñados para realzar tu belleza con sofisticación.
            </p>
          </div>

          {/* Mobile filter button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="w-full sm:w-auto px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs flex items-center justify-center gap-1.5 font-medium shadow-2xs hover:bg-[#d4af37] hover:text-black transition"
              id="catalog-mobile-filter-toggle"
            >
              <SlidersHorizontal size={14} />
              <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout: [Left Filters] + [Right Products Grid] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================= */}
          {/* 1. LEFT SIDEBAR: FILTROS (Compacto, Ordenado y Claro) */}
          {/* ========================================================= */}
          <aside
            className={`lg:col-span-3 ${
              mobileFilterOpen
                ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:static lg:z-auto lg:bg-transparent overscroll-contain'
                : 'hidden lg:block'
            }`}
            onClick={(e) => {
              if (mobileFilterOpen && e.target === e.currentTarget) {
                setMobileFilterOpen(false);
              }
            }}
            onTouchMove={(e) => {
              if (mobileFilterOpen && e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
            id="catalog-filters-sidebar"
          >
            <div
              className={`w-full max-w-xs sm:max-w-sm lg:max-w-none h-full lg:h-auto overflow-y-auto lg:overflow-visible bg-white p-5 sm:p-6 lg:rounded-2xl border border-stone-200/90 shadow-sm space-y-6 overscroll-contain ${
                mobileFilterOpen ? 'ml-auto rounded-l-2xl' : ''
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header de Filtros */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#d4af37]" />
                  <h2 className="font-serif-title text-base font-bold text-stone-900">
                    Filtros
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] text-stone-400 hover:text-stone-800 flex items-center gap-1 font-medium transition cursor-pointer"
                      title="Restablecer todos los filtros"
                    >
                      <RotateCcw size={11} />
                      <span>Limpiar</span>
                    </button>
                  )}
                  {mobileFilterOpen && (
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                      aria-label="Cerrar filtros"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filtro 1: Categorías */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Categorías
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {categories.length} categorías
                  </span>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${
                      categoryFilter === 'all'
                        ? 'bg-stone-900 text-white font-medium shadow-xs'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span>Todas las categorías</span>
                    <span className={`text-[11px] ${categoryFilter === 'all' ? 'text-stone-300' : 'text-stone-400'}`}>
                      {products.length}
                    </span>
                  </button>

                  {categories.map((cat) => {
                    const count = products.filter(
                      (p: Product) => p.categorySlug === cat.slug || p.category === cat.name
                    ).length;
                    const isSelected = categoryFilter === cat.slug || categoryFilter === cat.name;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategoryFilter(cat.slug);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white font-medium shadow-xs'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro 2: Precio en Pesos Colombianos (COP) */}
              <div className="border-t border-stone-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    Precio (COP)
                  </label>
                  <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                    Hasta {formatPriceCOP(priceMaxCOP)}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={minPossiblePrice}
                  max={maxPossiblePrice}
                  step={5000}
                  value={priceMaxCOP}
                  onChange={(e) => {
                    setPriceMaxCOP(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#d4af37] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                  id="catalog-price-slider"
                />

                <div className="flex justify-between text-[11px] text-stone-400 font-medium">
                  <span>{formatPriceCOP(minPossiblePrice)}</span>
                  <span>{formatPriceCOP(maxPossiblePrice)}</span>
                </div>

                {/* Quick Price Shortcuts */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {[50000, 100000, 150000, 300000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setPriceMaxCOP(preset);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border text-center transition cursor-pointer ${
                        priceMaxCOP === preset
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {preset === 300000 ? 'Sin límite' : `≤ ${formatPriceCOP(preset)}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro 3: Disponibilidad */}
              <div className="border-t border-stone-100 pt-5 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  Disponibilidad
                </label>
                <label className="flex items-center gap-2.5 text-xs sm:text-sm text-stone-700 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => {
                      setOnlyInStock(e.target.checked);
                      setCurrentPage(1);
                    }}
                    className="w-4 h-4 rounded text-stone-900 accent-stone-900 focus:ring-stone-900 border-stone-300 cursor-pointer"
                    id="catalog-stock-filter-checkbox"
                  />
                  <span className="group-hover:text-stone-900">Solo productos en stock</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ml-auto" title="En stock" />
                </label>
              </div>

              {/* Filtro 4: Calificación */}
              <div className="border-t border-stone-100 pt-5 space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  Calificación
                </label>
                <div className="space-y-1">
                  {[
                    { val: 0, label: 'Todas las calificaciones' },
                    { val: 4.5, label: '4.5 estrellas o más' },
                    { val: 4.0, label: '4.0 estrellas o más' },
                  ].map((option) => (
                    <button
                      key={option.val}
                      onClick={() => {
                        setMinRating(option.val);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        minRating === option.val
                          ? 'bg-amber-50 text-stone-900 font-bold border border-amber-200/80'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {option.val > 0 ? (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className={
                                  i < Math.floor(option.val)
                                    ? 'fill-[#d4af37] text-[#d4af37]'
                                    : 'text-stone-300'
                                }
                              />
                            ))}
                          </div>
                        ) : null}
                        <span>{option.label}</span>
                      </div>
                      {minRating === option.val && (
                        <Check size={12} className="text-[#d4af37]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Aplicar en Móvil */}
              {mobileFilterOpen && (
                <div className="pt-4 border-t border-stone-100 lg:hidden">
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="w-full py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Ver {displayedProducts.length} productos
                  </button>
                </div>
              )}

            </div>
          </aside>

          {/* ========================================================= */}
          {/* 2. MAIN SECTION: TOOLBAR & COMPACT PRODUCT GRID */}
          {/* ========================================================= */}
          <main ref={catalogTopRef} className="lg:col-span-9 space-y-5">
            
            {/* Toolbar: Búsqueda, Paginación y Ordenamiento */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Búsqueda dentro de Catálogo */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar en el catálogo..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition"
                  id="catalog-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                    title="Limpiar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Conteo de Productos, Paginación y Selector de Ordenamiento */}
              <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5 sm:gap-3 text-xs sm:text-sm">
                <span className="text-stone-500 whitespace-nowrap text-xs">
                  Mostrando <strong className="text-stone-900 font-bold">{startItem} - {endItem}</strong> de <strong className="text-stone-900 font-bold">{displayedProducts.length}</strong>
                </span>

                {/* Selector de productos por página */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-stone-50 border border-stone-200 rounded-xl pl-2.5 pr-7 py-2 text-stone-800 text-xs font-semibold focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    id="catalog-items-per-page-select"
                    title="Cantidad de productos por página"
                  >
                    <option value={12}>12 por pág</option>
                    <option value={16}>16 por pág</option>
                    <option value={24}>24 por pág</option>
                    <option value={32}>32 por pág</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  />
                </div>

                {/* Selector de Ordenamiento */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="appearance-none bg-stone-50 border border-stone-200 rounded-xl pl-3 pr-8 py-2 text-stone-800 text-xs font-semibold focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    id="catalog-sort-select"
                  >
                    <option value="featured">Destacados</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                    <option value="rating">Mejor valorados</option>
                    <option value="newest">Más recientes</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                  />
                </div>
              </div>

            </div>

            {/* Badges de filtros activos (si existen) */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-stone-400 text-[11px] font-medium mr-1">Filtros activos:</span>
                {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    Categoría: {categoryFilter}
                    <button onClick={() => setCategoryFilter('all')} className="hover:text-stone-900">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {searchQuery.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-stone-900">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {priceMaxCOP < 300000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    ≤ {formatPriceCOP(priceMaxCOP)}
                    <button onClick={() => setPriceMaxCOP(300000)} className="hover:text-stone-900">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {onlyInStock && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    En stock
                    <button onClick={() => setOnlyInStock(false)} className="hover:text-stone-900">
                      <X size={11} />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    ≥ {minRating} ★
                    <button onClick={() => setMinRating(0)} className="hover:text-stone-900">
                      <X size={11} />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-stone-500 hover:text-stone-900 underline ml-1 cursor-pointer font-medium"
                >
                  Borrar todos
                </button>
              </div>
            )}

            {/* Cuadrícula de Tarjetas de Productos (Grid Compacto y Elegante) */}
            {displayedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-10 sm:p-14 text-center space-y-4">
                <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                  <Search size={24} />
                </div>
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-stone-900">
                    No se encontraron productos
                  </h3>
                  <p className="text-stone-500 text-xs sm:text-sm max-w-sm mx-auto mt-1">
                    No hay productos que coincidan con los filtros seleccionados. Prueba a modificar tus criterios o restablecer los filtros.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-full text-xs font-bold hover:bg-[#d4af37] hover:text-black transition shadow-xs"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-3.5">
                {paginatedProducts.map((product: Product) => {
                  const favorite = isInWishlist(product.id);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= (product.stockThreshold || 5);
                  const isJustAdded = recentlyAddedId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl sm:rounded-2xl border border-stone-200/80 hover:border-stone-300 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col group relative"
                      id={`product-card-${product.sku}`}
                    >
                      {/* Imagen del Producto en la parte superior (proporción compacta refinada) */}
                      <div
                        onClick={() => navigateToProduct(product)}
                        className="relative w-full aspect-[4/3.3] sm:aspect-[1/0.95] bg-stone-100 overflow-hidden cursor-pointer select-none"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />

                        {/* Badges de estado / stock */}
                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-0.5 sm:gap-1 z-10">
                          {isOutOfStock && (
                            <span className="px-1.5 py-0.5 bg-stone-900/95 text-white text-[7px] sm:text-[9px] font-bold rounded-md uppercase tracking-wider shadow-xs">
                              Agotado
                            </span>
                          )}
                          {isLowStock && !isOutOfStock && (
                            <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[7px] sm:text-[9px] font-semibold rounded-md uppercase tracking-wider shadow-xs">
                              Últimas {product.stock}
                            </span>
                          )}
                          {product.isNew && !isOutOfStock && !isLowStock && (
                            <span className="px-1.5 py-0.5 bg-[#d4af37] text-stone-950 text-[7px] sm:text-[9px] font-bold rounded-md uppercase tracking-wider shadow-xs">
                              Nuevo
                            </span>
                          )}
                        </div>

                        {/* Icono de Favoritos ❤️ / ♡ en la esquina superior */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(product.id);
                          }}
                          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-stone-600 hover:text-rose-500 transition-colors z-10 cursor-pointer"
                          title={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          id={`wishlist-toggle-${product.sku}`}
                        >
                          <Heart
                            size={12}
                            className={favorite ? 'fill-rose-500 text-rose-500' : 'text-stone-500 hover:text-rose-500'}
                          />
                        </button>
                      </div>

                      {/* Información de la Tarjeta */}
                      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between gap-1 sm:gap-1.5">
                        
                        <div>
                          {/* Categoría / Información secundaria y Estado */}
                          <div className="flex items-center justify-between text-[8px] sm:text-[10px] text-stone-500 mb-0.5">
                            <span className="font-semibold text-[#b58d24] uppercase tracking-wider truncate mr-1">
                              {product.category}
                            </span>
                            
                            {/* Estado de disponibilidad / stock */}
                            {isOutOfStock ? (
                              <span className="text-[8px] sm:text-[9px] text-stone-400 font-medium whitespace-nowrap">
                                Sin stock
                              </span>
                            ) : (
                              <span className="text-[8px] sm:text-[9px] text-emerald-700 font-semibold flex items-center gap-1 whitespace-nowrap">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 inline-block" />
                                Disponible
                              </span>
                            )}
                          </div>

                          {/* Nombre del Producto */}
                          <h3
                            onClick={() => navigateToProduct(product)}
                            className="font-serif-title text-[11px] sm:text-[13px] font-bold text-stone-900 group-hover:text-[#b58d24] transition-colors cursor-pointer line-clamp-1 sm:line-clamp-2 leading-snug"
                            title={product.name}
                          >
                            {product.name}
                          </h3>

                          {/* Calificación mediante Estrellas */}
                          <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-stone-500">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={9}
                                  className={
                                    i < Math.floor(product.rating)
                                      ? 'fill-[#d4af37] text-[#d4af37]'
                                      : 'text-stone-200'
                                  }
                                />
                              ))}
                            </div>
                            <span className="font-bold text-stone-700 text-[9px] sm:text-[10px]">
                              {product.rating}
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-stone-400">
                              ({product.reviewsCount})
                            </span>
                          </div>
                        </div>

                        {/* Sección Inferior: Precio en Pesos Colombianos y Botón Añadir */}
                        <div className="pt-1 sm:pt-1.5 border-t border-stone-100 flex flex-col gap-1 sm:gap-1.5">
                          
                          {/* Precio en PESOS COLOMBIANOS (COP) */}
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="font-serif-title text-xs sm:text-sm font-bold text-stone-950 tracking-tight">
                                {formatPriceCOP(product.price)}
                              </span>
                              <span className="text-[8px] sm:text-[9px] text-stone-400 font-semibold uppercase">
                                COP
                              </span>
                            </div>
                          </div>

                          {/* Botón Añadir al Carrito */}
                          <button
                            disabled={isOutOfStock}
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`w-full py-1 sm:py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isOutOfStock
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : isJustAdded
                                ? 'bg-emerald-700 text-white'
                                : 'bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black shadow-xs'
                            }`}
                            id={`add-to-cart-btn-${product.sku}`}
                          >
                            {isOutOfStock ? (
                              <span>Agotado</span>
                            ) : isJustAdded ? (
                              <>
                                <Check size={11} />
                                <span>¡Añadido!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={11} />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación del Catálogo de Productos */}
            {totalPages > 1 && (
              <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/80 mt-6" id="catalog-pagination">
                <span className="text-xs text-stone-500 order-2 sm:order-1">
                  Página <strong className="text-stone-900 font-bold">{currentPage}</strong> de <strong className="text-stone-900 font-bold">{totalPages}</strong> (mostrando {startItem}-{endItem} de {displayedProducts.length} productos)
                </span>

                <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      scrollToCatalogTop();
                    }}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition cursor-pointer text-stone-700 flex items-center gap-1"
                    id="catalog-pagination-prev-btn"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToCatalogTop();
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                        id={`catalog-pagination-page-${pageNum}-btn`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      scrollToCatalogTop();
                    }}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition cursor-pointer text-stone-700 flex items-center gap-1"
                    id="catalog-pagination-next-btn"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};


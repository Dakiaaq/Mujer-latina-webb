import React, { useState, useEffect, useMemo } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { Product } from '../../types';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Pencil, 
  Trash2, 
  Boxes, 
  AlertTriangle, 
  AlertCircle, 
  ChevronLeft,
  ChevronRight,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { EditProductModal } from './EditProductModal';
import { NewProductModal } from './NewProductModal';

interface AdminInventoryViewProps {
  controller: StoreController;
}

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({ controller }) => {
  const {
    products,
    categories,
    createProduct,
    addProduct,
    updateProduct,
    deleteProduct,
  } = controller;

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lock body scroll cleanly when delete confirmation modal is open
  useEffect(() => {
    if (deletingProductId) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [deletingProductId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Format currency in COP style (e.g. $120.000)
  const formatCOP = (val: number) => {
    return `$${Math.round(val).toLocaleString('es-CO')}`;
  };

  // Metrics calculation
  const totalProductsCount = products.length;
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= (p.stockThreshold || 5)).length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 0).length;
  }, [products]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search by name or SKU
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat) return false;
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        if (p.category !== selectedCategory && p.categorySlug !== selectedCategory) {
          return false;
        }
      }

      // Filter by stock status
      if (stockStatusFilter === 'available') {
        if (p.stock <= (p.stockThreshold || 5)) return false;
      } else if (stockStatusFilter === 'low') {
        if (p.stock <= 0 || p.stock > (p.stockThreshold || 5)) return false;
      } else if (stockStatusFilter === 'out') {
        if (p.stock > 0) return false;
      }

      return true;
    });
  }, [products, search, selectedCategory, stockStatusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Active filter count
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) + 
    (stockStatusFilter !== 'all' ? 1 : 0);

  // Handle Edit Save
  const handleSaveEditedProduct = (updated: Product) => {
    const isDuplicate = products.some(
      (p) => p.id !== updated.id && p.sku.toUpperCase().trim() === updated.sku.toUpperCase().trim()
    );
    if (isDuplicate) {
      showToast(`Error: El SKU "${updated.sku}" ya está registrado en otro producto.`);
      return;
    }
    updateProduct(updated);
    setEditingProduct(null);
    showToast(`Producto "${updated.name}" actualizado correctamente.`);
  };

  // Handle New Product Save
  const handleSaveNewProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const isDuplicate = products.some(
      (p) => p.sku.toUpperCase().trim() === newProd.sku.toUpperCase().trim()
    );
    if (isDuplicate) {
      showToast(`Error: El código SKU "${newProd.sku}" ya existe en el inventario.`);
      return;
    }
    if (createProduct) {
      createProduct(newProd);
    } else if (addProduct) {
      addProduct(newProd);
    }
    setIsNewModalOpen(false);
    showToast(`Producto "${newProd.name}" creado con éxito.`);
  };

  // Handle Delete Confirmation
  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
    setDeletingProductId(null);
    showToast('Producto eliminado del inventario.');
  };

  const productToDelete = products.find((p) => p.id === deletingProductId);

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-[#fcfcfc] min-h-screen text-stone-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs sm:text-sm">
          <div className="w-5 h-5 rounded-full bg-[#d4af37] text-stone-950 flex items-center justify-center flex-shrink-0 font-bold">
            ✓
          </div>
          <span className="font-medium">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Controls - Compact on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif-title text-xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Gestión de Inventario
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Administra el catálogo completo y existencias en tiempo real.
          </p>
        </div>

        {/* Search, Filters and New Product CTA */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[140px] sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-7 py-1.5 sm:py-2 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 shadow-2xs transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Button & Popover */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                activeFiltersCount > 0
                  ? 'border-[#d4af37] text-stone-900 bg-[#d4af37]/5 font-semibold'
                  : 'border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal size={13} className={activeFiltersCount > 0 ? 'text-[#d4af37]' : 'text-stone-500'} />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-[#d4af37] text-stone-950 font-bold text-[9px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Popover */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-40 space-y-3.5 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-bold text-stone-900">Filtrar Inventario</span>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setStockStatusFilter('all');
                      setShowFilterDropdown(false);
                    }}
                    className="text-[11px] text-[#d4af37] hover:underline font-semibold cursor-pointer"
                  >
                    Restablecer
                  </button>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="all">Todas las categorías ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estado de Stock */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Estado de Stock
                  </label>
                  <select
                    value={stockStatusFilter}
                    onChange={(e) => {
                      setStockStatusFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="available">Disponible</option>
                    <option value="low">Bajo Stock</option>
                    <option value="out">Agotado</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-3 py-1 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* + Agregar Producto CTA */}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black hover:bg-stone-900 text-[#d4af37] font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-1 shadow-xs border border-stone-800 flex-shrink-0 cursor-pointer"
          >
            <Plus size={15} className="text-[#d4af37]" />
            <span>+ Agregar</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Metric Cards - Compact row on mobile (grid-cols-3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        
        {/* Card 1: Total Productos */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center flex-shrink-0">
            <Boxes size={16} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
              Total
            </p>
            <p className="font-serif-title text-base sm:text-2xl font-bold text-stone-900 leading-tight">
              {totalProductsCount}
            </p>
          </div>
        </div>

        {/* Card 2: Bajo Stock */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
              Bajo Stock
            </p>
            <p className="font-serif-title text-base sm:text-2xl font-bold text-stone-900 leading-tight">
              {lowStockCount}
            </p>
          </div>
        </div>

        {/* Card 3: Agotados */}
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-4 text-center sm:text-left">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={16} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
              Agotados
            </p>
            <p className="font-serif-title text-base sm:text-2xl font-bold text-stone-900 leading-tight">
              {outOfStockCount}
            </p>
          </div>
        </div>

      </div>

      {/* Mobile Card List View (Phones only: block sm:hidden) */}
      <div className="block sm:hidden space-y-2.5">
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map((p) => {
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.stockThreshold || 5);

            return (
              <div 
                key={p.id}
                className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs flex items-center gap-3 justify-between"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon size={16} className="text-stone-300" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-stone-400 bg-stone-100 px-1 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <span className="text-[10px] text-[#b58d24] font-semibold truncate">
                      {p.category}
                    </span>
                  </div>

                  <h4 className="font-serif-title text-xs font-bold text-stone-900 truncate mt-0.5">
                    {p.name}
                  </h4>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-stone-900">
                      {formatCOP(p.price)}
                    </span>
                    
                    {isOutOfStock ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                        Agotado (0)
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                        Stock: {p.stock}
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Stock: {p.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 transition cursor-pointer"
                    title="Editar producto"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeletingProductId(p.id)}
                    className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-stone-400 transition cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-400">
            <p className="font-serif-title text-sm font-semibold text-stone-600">
              No se encontraron productos
            </p>
            <p className="text-xs mt-1">
              Prueba modificando la búsqueda o restableciendo los filtros.
            </p>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Table Container (hidden on mobile, visible on sm and above) */}
      <div className="hidden sm:block bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            
            {/* Table Header */}
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">IMAGEN</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-4">NOMBRE</th>
                <th className="py-3 px-3">CATEGORÍA</th>
                <th className="py-3 px-3">PRECIO</th>
                <th className="py-3 px-3">STOCK</th>
                <th className="py-3 px-3">ESTADO</th>
                <th className="py-3 px-4 text-right">ACCIONES</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= (p.stockThreshold || 5);

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition">
                      
                      {/* IMAGEN */}
                      <td className="py-2.5 px-4">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ImageIcon size={16} className="text-stone-300" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono font-medium text-xs text-stone-700 whitespace-nowrap">
                        {p.sku}
                      </td>

                      {/* NOMBRE */}
                      <td className="py-2.5 px-4 font-semibold text-stone-900">
                        {p.name}
                      </td>

                      {/* CATEGORÍA */}
                      <td className="py-2.5 px-3 text-stone-600">
                        {p.category}
                      </td>

                      {/* PRECIO */}
                      <td className="py-2.5 px-3 font-semibold text-stone-900 whitespace-nowrap">
                        {formatCOP(p.price)}
                      </td>

                      {/* STOCK */}
                      <td className="py-2.5 px-3 text-stone-800 font-medium">
                        {p.stock}
                      </td>

                      {/* ESTADO BADGE */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Bajo Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Disponible
                          </span>
                        )}
                      </td>

                      {/* ACCIONES */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Botón Editar */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="border border-stone-200 hover:border-stone-300 hover:bg-stone-50 rounded-lg px-2.5 py-1 text-xs text-stone-700 font-medium flex items-center gap-1 transition shadow-2xs cursor-pointer"
                            title="Editar información del producto"
                          >
                            <Pencil size={12} className="text-stone-600" />
                            <span>Editar</span>
                          </button>

                          {/* Botón Borrar */}
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="border border-stone-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 rounded-lg px-2.5 py-1 text-xs text-stone-600 font-medium flex items-center gap-1 transition shadow-2xs cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 size={12} />
                            <span>Borrar</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <p className="font-serif-title text-base font-medium text-stone-600">
                      No se encontraron productos
                    </p>
                    <p className="text-xs mt-1">
                      Intenta con otros términos de búsqueda o elimina los filtros aplicados.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer (Available on both mobile and desktop) */}
      <div className="bg-white p-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-stone-500 shadow-2xs">
        <div>
          Mostrando{' '}
          <span className="font-semibold text-stone-800">
            {filteredProducts.length === 0 ? 0 : startIndex + 1}
          </span>{' '}
          a{' '}
          <span className="font-semibold text-stone-800">
            {Math.min(endIndex, filteredProducts.length)}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-stone-800">
            {filteredProducts.length}
          </span>{' '}
          productos
        </div>

        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={validCurrentPage <= 1}
            className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft size={13} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition cursor-pointer ${
                validCurrentPage === num
                  ? 'bg-black text-white'
                  : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={validCurrentPage >= totalPages}
            className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Modal: Editar Producto */}
      <EditProductModal
        isOpen={Boolean(editingProduct)}
        product={editingProduct}
        categories={categories}
        existingProducts={products}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEditedProduct}
      />

      {/* Modal: Nuevo Producto */}
      <NewProductModal
        isOpen={isNewModalOpen}
        categories={categories}
        existingProducts={products}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleSaveNewProduct}
      />

      {/* Modal: Confirmar Eliminación */}
      {deletingProductId && productToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overscroll-contain"
          onClick={() => setDeletingProductId(null)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-100 overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <Trash2 size={20} />
            </div>
            <div>
              <h3 className="font-serif-title font-bold text-lg text-stone-900">
                ¿Eliminar este producto?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Estás a punto de eliminar <span className="font-semibold text-stone-800">"{productToDelete.name}"</span> ({productToDelete.sku}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

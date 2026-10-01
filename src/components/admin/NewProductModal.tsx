import React, { useState, useRef } from 'react';
import { Product, Category } from '../../types';
import { 
  X, 
  Plus, 
  Save, 
  UploadCloud, 
  CheckCircle2, 
  Trash2,
  AlertCircle
} from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  categories: Category[];
  existingProducts?: Product[];
  onClose: () => void;
  onSave: (newProd: Omit<Product, 'id' | 'createdAt'>) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  categories,
  existingProducts = [],
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Cosméticos');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('10');
  const [unitMeasure, setUnitMeasure] = useState('Unidades');
  const [stockThreshold, setStockThreshold] = useState('5');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Duplicate SKU detection (Business rule + PostgreSQL UNIQUE constraint)
  const normalizedInputSku = sku.toUpperCase().trim();
  const conflictingProduct = existingProducts.find(
    (p) => p.sku.toUpperCase().trim() === normalizedInputSku
  );
  const isSkuDuplicate = Boolean(normalizedInputSku && conflictingProduct);

  // Lock body scroll cleanly when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('El nombre del producto es obligatorio.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('El código del producto (SKU) es obligatorio.');
      return;
    }
    if (isSkuDuplicate) {
      setErrorMsg(`No se puede guardar: El código SKU "${normalizedInputSku}" ya está registrado en "${conflictingProduct?.name}". Cada producto debe tener un SKU único.`);
      return;
    }

    const parsedSalePrice = parseFloat(salePrice.replace(/[^0-9.]/g, '')) || 0;
    const parsedCostPrice = parseFloat(costPrice.replace(/[^0-9.]/g, '')) || 0;
    const parsedStock = parseInt(stock.replace(/[^0-9]/g, ''), 10) || 0;
    const parsedThreshold = parseInt(stockThreshold.replace(/[^0-9]/g, ''), 10) || 5;

    // Find category slug
    const matchedCategory = categories.find((c) => c.name === category);
    const categorySlug = matchedCategory?.slug || category.toLowerCase().replace(/\s+/g, '-');

    const defaultImg =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAMScOdi90ZmP1G4lwi71yLWO3yeBfQiCBsHKG0df60ApArJRRQxYGlCaHxRjtGjawlqySg6oqbo4IMA11wZul3ebxWZir7mqJO5kzD1ATBQGqbK8v_53AobnHFXqTrZHVyjc2o5_F4AqKdKQ9Mk7_2mO-BCv-eqXIQHPATBZ6OdS0XFcsepHiw0gKtGGhzV6SG_Uku5R4lcnT6LDun2K1kq0_RRrqwcNxn-wR5dBYgcio_Cl4WZGlv';

    onSave({
      sku: sku.toUpperCase().trim(),
      name: name.trim(),
      category: category.trim(),
      categorySlug,
      brand: brand.trim() || 'Mujer Latina',
      supplier: supplier.trim() || 'Distribuciones Beauty',
      price: parsedSalePrice,
      costPrice: parsedCostPrice,
      stock: parsedStock,
      unitMeasure: unitMeasure.trim() || 'Unidades',
      stockThreshold: parsedThreshold,
      batchNumber: batchNumber.trim() || `LT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      expirationDate: expirationDate.trim() || '2028-12-31',
      storageLocation: storageLocation.trim() || 'Bodega Principal',
      description: description.trim() || 'Fórmula exclusiva y certificada para estética profesional.',
      imageUrl: imageUrl || defaultImg,
      galleryUrls: [],
      rating: 5.0,
      reviewsCount: 1,
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain"
      onClick={onClose}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center flex-shrink-0">
              <Plus size={18} />
            </div>
            <h2 className="font-serif-title font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
              Nuevo Producto
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Image Upload Dropzone */}
          {imageUrl ? (
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-800 truncate">
                    {imageFileName || 'imagen-seleccionada.jpg'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={13} />
                    <span>Imagen cargada con éxito</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImageUrl('');
                  setImageFileName('');
                }}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Quitar imagen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#d4af37] bg-[#d4af37]/5'
                  : 'border-stone-200 bg-stone-50/70 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-2xs mb-1">
                <UploadCloud size={24} />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-800">
                Haz clic para subir o arrastra una imagen
              </p>
              <p className="text-[11px] text-stone-400">
                PNG, JPG, WEBP hasta 5MB
              </p>
            </div>
          )}

          {/* Grid: Nombre del producto & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Crema hidratante facial"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Código del producto & Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Código del producto (SKU) *
                </label>
                {isSkuDuplicate && (
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={11} /> SKU en uso
                  </span>
                )}
              </div>
              <input
                type="text"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej: CF-002"
                required
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-stone-800 font-mono placeholder-stone-400 focus:outline-none transition ${
                  isSkuDuplicate 
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-rose-50/20' 
                    : 'border-stone-200 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20'
                }`}
              />
              {isSkuDuplicate ? (
                <p className="mt-1.5 text-[11px] text-rose-600 font-medium flex items-start gap-1 animate-in fade-in duration-150">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>
                    El SKU "{normalizedInputSku}" ya existe en: <strong>"{conflictingProduct?.name}"</strong>. Ingresa un código único.
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-stone-400">
                  Código único comercial obligatorio (Restricción UNIQUE en PostgreSQL).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Marca
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Natura"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>
          </div>

          {/* Grid: Proveedor & Unidad de medida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Proveedor
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ej: Distribuciones Beauty"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Unidad de medida
              </label>
              <input
                type="text"
                value={unitMeasure}
                onChange={(e) => setUnitMeasure(e.target.value)}
                placeholder="Unidades"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>
          </div>

          {/* Grid: Precio de compra & Precio de venta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Precio de compra ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="25000"
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Precio de venta ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="40000"
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Grid: Cantidad disponible & Cantidad mínima para alerta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Cantidad disponible *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Cantidad mínima para alerta
              </label>
              <input
                type="number"
                min="0"
                value={stockThreshold}
                onChange={(e) => setStockThreshold(e.target.value)}
                placeholder="5"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>
          </div>

          {/* Grid: Número de lote & Fecha de vencimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Número de lote
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="LT-2026-0415"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
              />
            </div>
          </div>

          {/* Lugar de almacenamiento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Lugar de almacenamiento
            </label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
              placeholder="Estante A-2"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
            />
          </div>

          {/* Descripción del producto */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Descripción del producto
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del producto, propiedades y beneficios..."
              className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-semibold rounded-xl text-xs sm:text-sm transition shadow-2xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSkuDuplicate}
              className={`px-6 py-2.5 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center gap-2 shadow-md ${
                isSkuDuplicate
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                  : 'bg-black hover:bg-stone-900 text-[#d4af37] hover:shadow-lg cursor-pointer'
              }`}
            >
              <Save size={15} />
              <span>{isSkuDuplicate ? 'SKU Duplicado' : 'Guardar Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

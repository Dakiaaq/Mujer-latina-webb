import React, { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../../types';
import { 
  X, 
  Pencil, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface EditProductModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  existingProducts?: Product[];
  onClose: () => void;
  onSave: (updated: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  product,
  categories,
  existingProducts = [],
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [supplier, setSupplier] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('Unidades');
  const [stockThreshold, setStockThreshold] = useState('5');
  const [batchNumber, setBatchNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFileName, setImageFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill form whenever selected product changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setCategory(product.category || (categories[0]?.name ?? 'Cosméticos'));
      setBrand(product.brand || 'Natura');
      setSupplier(product.supplier || 'Distribuciones Beauty');
      setCostPrice(product.costPrice ? product.costPrice.toString() : Math.round(product.price * 0.6).toString());
      setSalePrice(product.price ? product.price.toString() : '0');
      setStock(product.stock !== undefined ? product.stock.toString() : '0');
      setUnitMeasure(product.unitMeasure || 'Unidades');
      setStockThreshold(product.stockThreshold !== undefined ? product.stockThreshold.toString() : '5');
      setBatchNumber(product.batchNumber || 'LT-2026-0415');
      setExpirationDate(product.expirationDate || '2027-08-15');
      setStorageLocation(product.storageLocation || 'Estante A-2');
      setDescription(product.description || '');
      setImageUrl(product.imageUrl || '');
      
      // Determine image label/filename
      try {
        const urlParts = product.imageUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart.length < 35 && lastPart.includes('.')) {
          setImageFileName(lastPart);
        } else {
          setImageFileName(`${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`);
        }
      } catch {
        setImageFileName('producto-imagen.jpg');
      }
      setErrorMsg('');
    }
  }, [product, categories]);

  // Lock body scroll cleanly when modal is open
  useEffect(() => {
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

  // Duplicate SKU detection (Business rule + PostgreSQL UNIQUE constraint)
  const normalizedInputSku = sku.toUpperCase().trim();
  const conflictingProduct = existingProducts.find(
    (p) => p.id !== product?.id && p.sku.toUpperCase().trim() === normalizedInputSku
  );
  const isSkuDuplicate = Boolean(normalizedInputSku && conflictingProduct);

  if (!isOpen || !product) return null;

  // Handle local image upload via file browser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePromptUrlChange = () => {
    const newUrl = window.prompt('Ingresa la URL de la imagen del producto:', imageUrl);
    if (newUrl && newUrl.trim()) {
      setImageUrl(newUrl.trim());
      try {
        const parts = newUrl.trim().split('/');
        setImageFileName(parts[parts.length - 1] || 'nueva-imagen.jpg');
      } catch {
        setImageFileName('nueva-imagen.jpg');
      }
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

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      sku: sku.toUpperCase().trim(),
      category: category.trim(),
      categorySlug,
      brand: brand.trim(),
      supplier: supplier.trim(),
      price: parsedSalePrice,
      costPrice: parsedCostPrice,
      stock: parsedStock,
      unitMeasure: unitMeasure.trim(),
      stockThreshold: parsedThreshold,
      batchNumber: batchNumber.trim(),
      expirationDate: expirationDate.trim(),
      storageLocation: storageLocation.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || product.imageUrl,
    };

    onSave(updatedProduct);
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
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] flex items-center justify-center flex-shrink-0">
              <Pencil size={16} />
            </div>
            <h2 className="font-serif-title font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
              Editar Producto
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

          {/* Image Preview & Change Card */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-white border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name || 'Preview'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon size={22} className="text-stone-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-800 truncate">
                  {imageFileName || 'imagen-producto.jpg'}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={13} />
                  <span>Imagen cargada</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw size={13} />
                <span>Cambiar Imagen</span>
              </button>
              <button
                type="button"
                onClick={handlePromptUrlChange}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-xl border border-transparent hover:border-stone-200 transition text-xs"
                title="Ingresar URL web"
              >
                URL
              </button>
            </div>
          </div>

          {/* Field: Nombre del producto */}
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

          {/* Grid 2 cols: Código del producto (SKU) & Categoría */}
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
                placeholder="Ej: CF-001"
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
                    El SKU "{normalizedInputSku}" ya pertenece a: <strong>"{conflictingProduct?.name}"</strong>.
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-stone-400">
                  Identificador comercial único (PostgreSQL UNIQUE constraint).
                </p>
              )}
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

          {/* Grid 2 cols: Marca & Proveedor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Grid 2 cols: Precio de compra & Precio de venta */}
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

          {/* Grid 2 cols: Cantidad disponible & Unidad de medida */}
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
                placeholder="15"
                required
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

          {/* Grid 2 cols: Cantidad mínima para alerta & Número de lote */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Grid 2 cols: Fecha de vencimiento & Lugar de almacenamiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Fecha de vencimiento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 transition"
                />
              </div>
            </div>

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
              placeholder="Detalles sobre el producto, formulación o modo de uso..."
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
              <span>{isSkuDuplicate ? 'SKU Duplicado' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Product } from '../types';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ProductDetailViewProps {
  controller: StoreController;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ controller }) => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setActiveView,
    navigateToProduct,
    products,
  } = controller;

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 text-sm">Producto no seleccionado.</p>
        <button
          onClick={() => setActiveView('catalog')}
          className="mt-4 px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs font-semibold hover:bg-[#d4af37] hover:text-black transition cursor-pointer"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  // Thumbnails: main image + galleryUrls
  const allImages = [
    selectedProduct.imageUrl,
    ...(selectedProduct.galleryUrls && selectedProduct.galleryUrls.length > 0
      ? selectedProduct.galleryUrls
      : []),
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [addedToast, setAddedToast] = useState(false);

  // Reviews form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'Isabella Gómez',
      rating: 5,
      date: 'Hace 3 días',
      comment: '¡Absolutamente maravilloso! La textura y el brillo que deja en el cabello es como salir de un salón de belleza de lujo. Repetiré sin duda.',
    },
    {
      id: 'rev-2',
      name: 'Mariana Duarte',
      rating: 5,
      date: 'Hace 1 semana',
      comment: 'El aroma es delicioso y los resultados se notan desde la primera aplicación. Me encantó el empaque y la atención por WhatsApp.',
    },
  ]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    setReviewsList((prev) => [
      {
        id: `rev-${Date.now()}`,
        name: reviewerName.trim(),
        rating: reviewerRating,
        date: 'Reciente',
        comment: reviewerComment.trim(),
      },
      ...prev,
    ]);

    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const favorite = isInWishlist(selectedProduct.id);

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-4 sm:py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Back and Breadcrumbs - Compact on mobile */}
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <button
            onClick={() => setActiveView('catalog')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition cursor-pointer"
          >
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
            <span>Volver al Catálogo</span>
          </button>

          <nav className="hidden sm:flex text-xs text-stone-400 gap-2">
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('home')}>Inicio</span>
            <span>/</span>
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('catalog')}>Catálogo</span>
            <span>/</span>
            <span className="hover:text-stone-600 cursor-pointer" onClick={() => setActiveView('catalog')}>{selectedProduct.category}</span>
            <span>/</span>
            <span className="text-[#b58d24] font-medium truncate max-w-[200px]">{selectedProduct.name}</span>
          </nav>
        </div>

        {/* Product Grid: Compact on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 bg-white p-3.5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs">
          
          {/* Left: Gallery Column (6 cols) */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {/* Main Stage Image: On mobile, capped at 250px-280px so it doesn't push the content far down */}
            <div className="relative aspect-[4/3] sm:aspect-square max-h-[260px] sm:max-h-none w-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
              <img
                src={allImages[activeImageIndex] || selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover transition duration-300"
                referrerPolicy="no-referrer"
              />

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-xs shadow flex items-center justify-center text-stone-700 hover:text-red-500 transition cursor-pointer"
                title="Añadir a lista de deseos"
              >
                <Heart size={16} className={`sm:w-5 sm:h-5 ${favorite ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnails Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 sm:w-18 sm:h-18 rounded-lg sm:rounded-xl overflow-hidden border-2 transition flex-shrink-0 bg-stone-100 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#d4af37] ring-1 ring-[#d4af37]/40 scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Buy Box & Details (6 cols) */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-5 flex flex-col justify-between">
            <div className="space-y-2.5 sm:space-y-4">
              
              <div className="flex items-center justify-between text-[11px] sm:text-xs">
                <span className="font-bold text-[#b58d24] uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <span className="font-mono text-stone-400">SKU: {selectedProduct.sku}</span>
              </div>

              <h1 className="font-serif-title text-xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-snug">
                {selectedProduct.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex text-[#d4af37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(selectedProduct.rating)
                          ? 'fill-[#d4af37] text-[#d4af37]'
                          : 'text-stone-300'
                      }
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{selectedProduct.rating}</span>
                <span className="text-stone-400 text-[11px] sm:text-xs">({reviewsList.length + selectedProduct.reviewsCount} reseñas)</span>
              </div>

              {/* Price & Stock */}
              <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-4 pt-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900">
                  ${Math.round(selectedProduct.price).toLocaleString('es-CO')}
                </span>
                <span className="text-stone-400 text-xs sm:text-sm font-normal">COP</span>

                {selectedProduct.stock > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] sm:text-xs font-semibold rounded-full">
                    <CheckCircle2 size={12} />
                    {selectedProduct.stock <= 5 ? `¡Solo quedan ${selectedProduct.stock} unidades!` : 'En Stock'}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-rose-50 border border-rose-200 text-rose-700 text-[10px] sm:text-xs font-semibold rounded-full">
                    Agotado
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-xs sm:text-sm sm:leading-relaxed pt-1">
                {selectedProduct.description}
              </p>

              {/* Quantity Selector & Add to Cart */}
              <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-4">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-stone-50 flex-shrink-0">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-stone-600 hover:bg-stone-200 transition font-bold text-xs sm:text-sm disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-stone-900 font-bold text-xs sm:text-sm select-none">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= selectedProduct.stock}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-stone-600 hover:bg-stone-200 transition font-bold text-xs sm:text-sm disabled:opacity-30 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    disabled={selectedProduct.stock <= 0}
                    onClick={handleAddToCart}
                    id="product-detail-add-cart"
                    className="flex-1 py-2.5 sm:py-3.5 px-4 sm:px-6 bg-[#d4af37] hover:bg-[#c29e2f] disabled:bg-stone-300 text-black disabled:text-stone-500 font-bold rounded-full shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-1.5 sm:gap-2 transition duration-200 text-xs sm:text-sm cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>{selectedProduct.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}</span>
                  </button>
                </div>

                {/* Toast Notification */}
                {addedToast && (
                  <div className="p-2.5 sm:p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span className="truncate max-w-[200px] sm:max-w-none">¡Añadido a tu carrito!</span>
                    </div>
                    <button
                      onClick={() => setActiveView('cart')}
                      className="underline hover:text-emerald-950 font-bold ml-2 whitespace-nowrap cursor-pointer"
                    >
                      Ver Carrito →
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Trust highlights */}
            <div className="pt-3 sm:pt-6 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#b58d24] flex-shrink-0" />
                <span>Envío express nacional</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#b58d24] flex-shrink-0" />
                <span>Garantía de originalidad</span>
              </div>
            </div>

          </div>

        </div>

        {/* Tabs: Description, Specs, Reviews - Compact on mobile */}
        <div className="mt-6 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xs p-3.5 sm:p-8 lg:p-10">
          
          <div className="flex border-b border-stone-200 gap-3 sm:gap-8 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2.5 sm:pb-4 text-xs sm:text-base font-serif-title font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'desc'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Descripción
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2.5 sm:pb-4 text-xs sm:text-base font-serif-title font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Especificaciones
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2.5 sm:pb-4 text-xs sm:text-base font-serif-title font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#d4af37] text-stone-900'
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Reseñas ({reviewsList.length})
            </button>
          </div>

          <div className="pt-4 sm:pt-6">
            {activeTab === 'desc' && (
              <div className="space-y-2.5 sm:space-y-4 text-stone-700 text-xs sm:text-sm sm:leading-relaxed max-w-4xl">
                <p>{selectedProduct.description}</p>
                <p>
                  Cada lote de producción es testeado dermatológicamente y formulado sin crueldad animal. Nuestro compromiso con los estándares de pureza garantiza una aplicación uniforme, sedosa y de larga persistencia aromática y visual.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-stone-50 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-200 text-xs sm:text-sm text-stone-700 max-w-2xl space-y-2 sm:space-y-3">
                <p><strong>SKU de Fabricación:</strong> {selectedProduct.sku}</p>
                <p><strong>Categoría Principal:</strong> {selectedProduct.category}</p>
                <p><strong>Especificaciones Técnicas:</strong> {selectedProduct.specifications || 'Fórmula concentrada de alta cosmética.'}</p>
                <p><strong>Certificación:</strong> Aprobación de control de calidad para cosméticos.</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
                {/* Reviews list */}
                <div className="lg:col-span-7 space-y-3">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-3 sm:p-4 rounded-xl border border-stone-100 bg-stone-50 space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-stone-900">{rev.name}</span>
                        <span className="text-[10px] sm:text-xs text-stone-400">{rev.date}</span>
                      </div>
                      <div className="flex text-[#d4af37]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < rev.rating ? 'fill-[#d4af37]' : 'text-stone-300'}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stone-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Form to leave a review */}
                <div className="lg:col-span-5 bg-stone-50 p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-stone-200">
                  <h4 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 mb-2 sm:mb-3">
                    Deja tu Valoración
                  </h4>
                  <form onSubmit={handleAddReview} className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm">
                    <div>
                      <label className="block text-stone-600 font-semibold mb-1 text-[11px] sm:text-xs">Tu Nombre</label>
                      <input
                        type="text"
                        required
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Ej. Sofía Morales"
                        className="w-full px-3 py-1.5 sm:py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1 text-[11px] sm:text-xs">Calificación</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewerRating(star)}
                            className="p-0.5 hover:scale-110 transition cursor-pointer"
                          >
                            <Star
                              size={17}
                              className={
                                star <= reviewerRating
                                  ? 'fill-[#d4af37] text-[#d4af37]'
                                  : 'text-stone-300'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-600 font-semibold mb-1 text-[11px] sm:text-xs">Tu Comentario</label>
                      <textarea
                        rows={2}
                        required
                        value={reviewerComment}
                        onChange={(e) => setReviewerComment(e.target.value)}
                        placeholder="Cuéntanos tu experiencia con este producto..."
                        className="w-full px-3 py-1.5 sm:py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-semibold rounded-lg text-xs transition cursor-pointer"
                    >
                      Publicar Reseña
                    </button>
                  </form>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Related Products: 2 columns on mobile */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 sm:mt-14">
            <h3 className="font-serif-title text-lg sm:text-2xl font-bold text-stone-900 mb-3 sm:mb-6">
              También te podría gustar
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigateToProduct(rel)}
                  className="bg-white rounded-xl sm:rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col"
                >
                  <div className="aspect-[4/3] sm:aspect-square w-full bg-stone-100 overflow-hidden">
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="font-serif-title text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#b58d24] transition line-clamp-1">
                      {rel.name}
                    </h4>
                    <span className="text-xs sm:text-sm font-bold text-stone-800 mt-1">
                      ${Math.round(rel.price).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  ShoppingBag,
  Flame
} from 'lucide-react';

interface HeroSectionProps {
  controller: StoreController;
}

interface HeroSlide {
  id: string;
  productId: string;
  badge: string;
  badgeType: 'discount' | 'new' | 'flash';
  discountText: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  imageUrl: string;
  category: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    productId: 'prod-1',
    badge: 'MÁS VENDIDO • 25% OFF',
    badgeType: 'discount',
    discountText: 'Ahorra $30.100 COP',
    title: 'Tratamiento Capilar Oro Líquido 24K',
    subtitle: 'Infusión botánica con partículas de oro puro para sellado y brillo espejo',
    price: '$89.900',
    originalPrice: '$120.000',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=900&auto=format&fit=crop&q=80',
    category: 'Tratamientos',
  },
  {
    id: 'slide-2',
    productId: 'prod-cuidado-1',
    badge: 'OFERTA FLASH • 30% OFF',
    badgeType: 'flash',
    discountText: '¡Descuento Exclusivo!',
    title: 'Serum Facial Botánico Iluminador',
    subtitle: 'Ácido hialurónico vegetal y Vitamina C pura de absorción ultrarrápida',
    price: '$75.000',
    originalPrice: '$107.000',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-573e04558230?w=900&auto=format&fit=crop&q=80',
    category: 'Cuidado facial',
  },
  {
    id: 'slide-3',
    productId: 'prod-joyeria-1',
    badge: 'NUEVA COLECCIÓN 2026',
    badgeType: 'new',
    discountText: 'Oro Laminado 18K',
    title: 'Collar Flor de Loto Oro 18K',
    subtitle: 'Diseño artesanal hipoalergénico con baño de oro certificado y circones',
    price: '$145.000',
    originalPrice: '$165.000',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&auto=format&fit=crop&q=80',
    category: 'Joyería',
  },
  {
    id: 'slide-4',
    productId: 'prod-bolsos-1',
    badge: 'DESCUENTO 20% OFF',
    badgeType: 'discount',
    discountText: 'Envío Gratis Incluido',
    title: 'Bolso Tote Elegance Cuero Vegano',
    subtitle: 'Confección premium por artesanas colombianas con herrajes dorados',
    price: '$198.000',
    originalPrice: '$248.000',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&auto=format&fit=crop&q=80',
    category: 'Bolsos',
  },
  {
    id: 'slide-5',
    productId: 'prod-esmaltes-1',
    badge: 'PROMO 2X1 • TENDENCIA',
    badgeType: 'flash',
    discountText: 'Lleva 2 Paga 1',
    title: 'Colección Esmaltes Oro Rosa',
    subtitle: 'Acabado semipermanente de máxima duración con brillo diamante',
    price: '$42.000',
    originalPrice: '$84.000',
    imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=900&auto=format&fit=crop&q=80',
    category: 'Esmaltes',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({ controller }) => {
  const { setActiveView, products, navigateToProduct, addToCart } = controller;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 4500);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused]);

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentSlideIndex];
  const matchedProduct = products.find((p) => p.id === activeSlide.productId) || products[0];

  const handleActionClick = () => {
    if (matchedProduct) {
      navigateToProduct(matchedProduct);
    } else {
      setActiveView('catalog');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchedProduct) {
      addToCart(matchedProduct, 1);
      setToastMessage(`✨ ¡"${activeSlide.title}" añadido al carrito!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <section className="relative bg-[#111111] text-white overflow-hidden border-b border-stone-800">
      {/* Toast message inside hero */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-stone-900 border border-[#d4af37] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Sparkles size={16} className="text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Background ambient gold gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-5 text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#201d14] border border-[#d4af37]/40 text-[#d4af37] text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles size={11} className="text-[#d4af37]" />
              <span>Colección Exclusiva 2026</span>
            </div>

            <h1 className="font-serif-title text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Belleza que <br />
              <span className="text-[#d4af37] italic font-serif">Empodera</span> Tu Esencia
            </h1>

            <p className="text-stone-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg">
              Fórmulas de alta pigmentación y tratamientos botánicos de lujo creados para celebrar la riqueza de nuestros tonos, texturas y elegancia natural.
            </p>

            {/* Action buttons */}
            <div className="pt-0.5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setActiveView('catalog')}
                id="hero-cta-collection"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-semibold rounded-full shadow-md shadow-[#d4af37]/20 hover:shadow-lg hover:scale-[1.01] transition duration-200 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Ver Colección</span>
                <ArrowRight size={13} className="sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={() => setActiveView('about')}
                id="hero-cta-about"
                className="px-3.5 sm:px-5 py-2 sm:py-3 bg-transparent hover:bg-stone-900 text-stone-200 border border-stone-700 hover:border-stone-500 font-medium rounded-full transition duration-200 text-xs sm:text-sm cursor-pointer"
              >
                Nuestra Historia
              </button>
            </div>

            {/* Trust Badges (Compact) */}
            <div className="pt-3 sm:pt-5 border-t border-stone-800/80 grid grid-cols-3 gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-stone-300">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle2 size={12} className="text-[#d4af37] flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">Botánicos</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Shield size={12} className="text-[#d4af37] flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">Cruelty-free</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Sparkles size={12} className="text-[#d4af37] flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                <span className="truncate">Envío Seguro</span>
              </div>
            </div>
          </div>

          {/* Right Column: Compact Luxury Carousel */}
          <div 
            className="lg:col-span-5 relative z-10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-[340px] xl:max-w-[360px]">
              {/* Outer decorative gold frame glow */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-[#d4af37]/30 via-transparent to-[#d4af37]/15 blur-sm -z-10" />
              
              <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/40 shadow-xl bg-stone-950 aspect-[16/11] sm:aspect-[4/4.5] max-h-[250px] sm:max-h-[410px] flex flex-col justify-between">
                
                {/* Active Slide Image */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    key={activeSlide.id}
                    src={activeSlide.imageUrl}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle luxury gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/40 pointer-events-none" />
                </div>

                {/* Top Overlay: Category, Discount Badge & Slide Counter */}
                <div className="relative p-3 sm:p-3.5 z-10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#d4af37] text-black shadow-xs">
                      {activeSlide.badgeType === 'flash' ? (
                        <Flame size={11} className="text-black" />
                      ) : (
                        <Tag size={11} className="text-black" />
                      )}
                      <span>{activeSlide.badge}</span>
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold bg-black/60 backdrop-blur-xs text-stone-200 border border-white/10">
                      {activeSlide.category}
                    </span>
                  </div>

                  {/* Slide Counter */}
                  <div className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs border border-white/15 text-[10px] font-mono font-bold text-stone-300">
                    <span className="text-[#d4af37]">0{currentSlideIndex + 1}</span> / 0{HERO_SLIDES.length}
                  </div>
                </div>

                {/* Carousel Navigation Arrow Buttons */}
                <div className="relative z-10 px-2 sm:px-3 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black backdrop-blur-xs border border-white/15 shadow flex items-center justify-center transition-all duration-200 cursor-pointer"
                    title="Anterior producto destacado"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/60 hover:bg-[#d4af37] text-white hover:text-black backdrop-blur-xs border border-white/15 shadow flex items-center justify-center transition-all duration-200 cursor-pointer"
                    title="Siguiente producto destacado"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>

                {/* Bottom Overlay: Compact Product Information Card & CTAs */}
                <div className="relative p-3 sm:p-3.5 z-10 space-y-2">
                  <div 
                    onClick={handleActionClick}
                    className="p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white hover:border-[#d4af37]/60 transition cursor-pointer shadow-lg"
                  >
                    <div>
                      <span className="text-[10px] text-[#d4af37] font-bold uppercase tracking-wider block">
                        {activeSlide.discountText}
                      </span>
                      <h3 className="font-serif-title text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 mt-0.5">
                        {activeSlide.title}
                      </h3>
                      <p className="text-stone-300 text-[11px] line-clamp-1 mt-0.5">
                        {activeSlide.subtitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-[#d4af37]">
                          {activeSlide.price}
                        </span>
                        {activeSlide.originalPrice && (
                          <span className="text-[10px] text-stone-400 line-through">
                            {activeSlide.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleQuickAdd}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#d4af37] text-white hover:text-black text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Añadir directo al carrito"
                        >
                          <ShoppingBag size={13} />
                          <span className="hidden sm:inline">Añadir</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleActionClick}
                          className="px-3 py-1 rounded-lg bg-[#d4af37] hover:bg-[#c29e2f] text-black text-[11px] font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <span>Ver</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Carousel Pagination Dots */}
                  <div className="flex items-center justify-center gap-1 pt-0.5">
                    {HERO_SLIDES.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          currentSlideIndex === idx
                            ? 'w-5 bg-[#d4af37]'
                            : 'w-1.5 bg-stone-600 hover:bg-stone-400'
                        }`}
                        title={`Ir a ${slide.title}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};


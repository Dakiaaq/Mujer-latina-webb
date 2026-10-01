import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OurStorySectionProps {
  controller: StoreController;
}

export const OurStorySection: React.FC<OurStorySectionProps> = ({ controller }) => {
  const { setActiveView } = controller;

  const storyImgUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD8k11gOXdrBwN5ATOyaIeByyisa7i6sOfTxzlrMg1MyCEw5COmvYKRsya3IL00K0a0M5rKWWVnjNSugpi7w9z4GqH7HV-kTwzjVP7R58vk3Cgue7c33oXLf3cIdA-ESBg1-My2OlJmICOmgCBYkTgS9j10wilmgj7BcJo6j0CdK2K1DdrJSNFCP69nj9hXEY5q78ntwK6rHcBLwzctpZ7mZhdQnXMak_mlCZWq_fs2OtRIEwBfi7v0';

  return (
    <section className="py-8 sm:py-16 lg:py-20 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
          
          {/* Visual Column - Compact image on mobile */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200">
              <img
                src={storyImgUrl}
                alt="Nuestra Historia - Mujer Latina"
                className="w-full h-[180px] sm:h-[280px] lg:h-[400px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#d4af37] font-bold">
                  Desde 2023
                </span>
                <p className="font-serif-title text-sm sm:text-lg lg:text-xl font-bold leading-tight mt-0.5">
                  Diseñado en Latinoamérica con estándares internacionales.
                </p>
              </div>
            </div>

            {/* Decorative accent element */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 sm:w-32 sm:h-32 border-2 border-[#d4af37] rounded-2xl -z-10 hidden sm:block" />
          </div>

          {/* Narrative Content - Compact & readable on mobile */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-5">
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#b58d24] font-bold">
              <Sparkles size={13} />
              <span>Manifiesto de Marca</span>
            </div>

            <h2 className="font-serif-title text-xl sm:text-3xl lg:text-4xl font-bold text-stone-900 leading-snug">
              Creemos en una belleza sin estereotipos, creada por y para nosotras.
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed">
              Mujer Latina nació de la convicción de que los cosméticos de alta gama debían reflejar la extraordinaria diversidad de nuestra piel y cabello. Durante décadas, el mercado tradicional ofreció fórmulas genéricas que no respondían a los climas, tonos cálidos ni necesidades de hidratación profunda de nuestra región.
            </p>

            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed hidden sm:block">
              Combinamos ingredientes botánicos ancestrales —como el aceite de argán puro, la rosa mosqueta y mantecas tropicales— con biotecnología avanzada y pigmentos de máxima fijación. Cada producto es una celebración de tu poder, identidad y estilo.
            </p>

            <div className="pt-1 sm:pt-2">
              <button
                onClick={() => {
                  setActiveView('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 sm:px-7 sm:py-3.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-semibold rounded-full shadow-sm sm:shadow-md transition duration-200 flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <span>Conoce Más de Nosotros</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

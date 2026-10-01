import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { ShieldCheck, Send, Sparkles, BookOpen, Lock } from 'lucide-react';

interface FooterProps {
  controller: StoreController;
}

export const Footer: React.FC<FooterProps> = ({ controller }) => {
  const { setActiveView, setCategoryFilter, storeSettings } = controller;

  const handleCategoryNav = (catSlug: string) => {
    setCategoryFilter(catSlug);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappCleanNumber = storeSettings?.whatsappNumber.replace(/[^0-9]/g, '') || '573108924110';
  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=Hola%20${encodeURIComponent(storeSettings?.storeName || 'Mujer Latina')},%20deseo%20asesoría%20sobre%20sus%20productos.`;

  return (
    <footer className="bg-[#111111] text-stone-300 border-t border-stone-800 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Manifesto (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] flex items-center justify-center font-serif font-bold text-lg">
                M
              </div>
              <span className="font-serif-title text-xl font-bold tracking-wider text-white">
                {storeSettings?.storeName || 'Mujer Latina'}
              </span>
            </div>
            
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {storeSettings?.storeSlogan || 'Cosméticos de alta pigmentación y tratamientos botánicos diseñados para empoderar la diversidad y elegancia de la mujer latina.'}
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1">
                <Lock size={13} className="text-[#d4af37]" /> Cifrado SSL 256-bit
              </span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck size={13} className="text-[#d4af37]" /> Supabase RLS
              </span>
            </div>
          </div>

          {/* Colecciones */}
          <div className="space-y-3">
            <h4 className="font-serif-title font-bold text-white text-sm tracking-wider uppercase">
              Colecciones
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => handleCategoryNav('cosmeticos')}
                  className="hover:text-[#d4af37] transition"
                >
                  Cosméticos & Maquillaje
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('esmaltes')}
                  className="hover:text-[#d4af37] transition"
                >
                  Esmaltes & Cuidado Uñas
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('tratamientos')}
                  className="hover:text-[#d4af37] transition"
                >
                  Tratamientos Botánicos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('accesorios')}
                  className="hover:text-[#d4af37] transition"
                >
                  Accesorios & Joyería
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryNav('tintes')}
                  className="hover:text-[#d4af37] transition"
                >
                  Tintes Profesionales
                </button>
              </li>
            </ul>
          </div>

          {/* Enlaces de Marca */}
          <div className="space-y-3">
            <h4 className="font-serif-title font-bold text-white text-sm tracking-wider uppercase">
              Compañía
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => { setActiveView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#d4af37] transition"
                >
                  Nuestra Historia
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('wishlist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#d4af37] transition"
                >
                  Lista de Deseos
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('profile'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#d4af37] transition"
                >
                  Mi Cuenta & Pedidos
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveView('docs'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#d4af37] transition inline-flex items-center gap-1"
                >
                  <BookOpen size={12} />
                  <span>Documentación del Sistema</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contacto & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-serif-title font-bold text-white text-sm tracking-wider uppercase">
              Asistencia Inmediata
            </h4>
            <p className="text-stone-400 text-xs">
              Atención personalizada para cotizaciones al por mayor y pedidos:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs transition shadow-md"
            >
              <Send size={14} />
              <span>Chatear por WhatsApp</span>
            </a>
            {controller.currentUser?.role === 'admin' && (
              <div className="pt-2">
                <button
                  onClick={() => { setActiveView('admin_dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-[11px] text-[#d4af37] hover:underline transition flex items-center gap-1"
                >
                  <span>Panel Administrador &rarr;</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Copyright & Sub-bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Mujer Latina Beauty Inc. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-stone-400 cursor-pointer" onClick={() => setActiveView('docs')}>Políticas RLS</span>
            <span>•</span>
            <span className="hover:text-stone-400 cursor-pointer" onClick={() => setActiveView('docs')}>Términos del Servicio</span>
            <span>•</span>
            <span className="text-[#d4af37]">Prestige Collection</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

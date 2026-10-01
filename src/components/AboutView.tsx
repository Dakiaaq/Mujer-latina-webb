import React, { useState } from 'react';
import { StoreController } from '../controllers/useStoreController';
import {
  Sparkles,
  Award,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  ShieldCheck,
  Truck,
  ExternalLink,
  Navigation,
  Compass,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

interface AboutViewProps {
  controller?: StoreController;
}

export const AboutView: React.FC<AboutViewProps> = ({ controller }) => {
  const settings = controller?.storeSettings || {
    storeName: 'Mujer Latina',
    storeSlogan: 'Belleza y Alta Cosmética inspirada en nuestra identidad',
    whatsappNumber: '+57 310 892 4110',
    whatsappDisplay: '+57 (310) 892-4110',
    supportEmail: 'contacto@mujerlatina.com',
    supportPhone: '+57 (604) 448-9210',
    storeAddress: 'Calle 10 # 40-20, El Poblado',
    storeCity: 'Medellín',
    storeDepartment: 'Antioquia',
    businessHours: 'Lunes a Sábado: 8:00 AM - 7:00 PM | Dom: 10:00 AM - 4:00 PM',
  };

  // Quick form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    reason: 'asesoria',
    message: '',
  });
  const [sentToast, setSentToast] = useState(false);

  const cleanWhatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '573108924110';

  const handleQuickFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    const reasonLabels: { [key: string]: string } = {
      asesoria: 'Asesoría de Productos y Tono',
      showroom: 'Cita / Visita al Showroom',
      pedido: 'Estado de Pedido o Envíos',
      mayorista: 'Ventas Mayoristas y Alianzas',
    };

    const text = `Hola *${settings.storeName}*, me contacto desde la web.%0A%0A*Nombre:* ${encodeURIComponent(
      formData.name
    )}%0A*Teléfono:* ${encodeURIComponent(formData.phone || 'No especificado')}%0A*Motivo:* ${encodeURIComponent(
      reasonLabels[formData.reason] || formData.reason
    )}%0A*Mensaje:* ${encodeURIComponent(formData.message)}`;

    setSentToast(true);
    setTimeout(() => {
      setSentToast(false);
      window.open(`https://wa.me/${cleanWhatsappNumber}?text=${text}`, '_blank');
    }, 600);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.storeAddress}, ${settings.storeCity}, Colombia`
  )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    `${settings.storeAddress}, ${settings.storeCity}, Colombia`
  )}`;

  return (
    <div className="bg-[#fbfbfa] min-h-screen pb-20">
      
      {/* 1. In-page Quick Navigation Bar ("Para que las personas no se pierdan") */}
      <div className="sticky top-14 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 sm:py-2.5 overflow-x-auto scrollbar-none gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 shrink-0 mr-1 hidden sm:flex">
              <Compass size={14} className="text-[#d4af37]" />
              <span className="font-semibold text-stone-700">Secciones:</span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => scrollToSection('historia')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-[#d4af37]/20 hover:text-[#9a761a] text-stone-700 font-medium transition cursor-pointer"
              >
                Nuestra Historia
              </button>
              <button
                onClick={() => scrollToSection('pilares')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-[#d4af37]/20 hover:text-[#9a761a] text-stone-700 font-medium transition cursor-pointer"
              >
                Calidad & Pilares
              </button>
              <button
                onClick={() => scrollToSection('galeria')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-[#d4af37]/20 hover:text-[#9a761a] text-stone-700 font-medium transition cursor-pointer"
              >
                Galería
              </button>
              <button
                onClick={() => scrollToSection('empresa')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-[#d4af37]/20 hover:text-[#9a761a] text-stone-700 font-medium transition cursor-pointer"
              >
                Empresa
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-stone-100 hover:bg-[#d4af37]/20 hover:text-[#9a761a] text-stone-700 font-medium transition cursor-pointer"
              >
                Contacto
              </button>
              <button
                onClick={() => scrollToSection('mapa')}
                className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#d4af37] text-black font-bold hover:bg-[#c39e2d] transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <MapPin size={11} />
                <span>Showroom & Mapa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-6 sm:pt-14 space-y-10 sm:space-y-20">
        
        {/* 2. Hero Section: Identidad & Visión */}
        <section id="historia" className="scroll-mt-36">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/15 border border-[#d4af37]/60 text-[#9a761a] rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Nuestra Esencia & Showroom</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
              {settings.storeName}: Belleza que Inspira y Empodera
            </h1>
            <p className="text-stone-600 text-xs sm:text-base lg:text-lg leading-relaxed">
              Nacimos con el propósito de transformar la cosmética y el cuidado capilar en Colombia y Latinoamérica. 
              Formulamos productos de prestigio con biotecnología avanzada y activos botánicos puros, adaptados a los tonos cálidos, texturas vibrantes y climas de nuestra región.
            </p>
          </div>
        </section>

        {/* 3. Pilares de Calidad y Compromiso */}
        <section id="pilares" className="scroll-mt-36 space-y-4 sm:space-y-6">
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Nuestros Fundamentos
            </span>
            <h2 className="font-serif-title text-xl sm:text-3xl font-bold text-stone-900 mt-0.5">
              Pilares de Calidad y Confianza
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-[#d4af37] transition duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 text-[#9a761a] flex items-center justify-center">
                <Sparkles size={22} />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Belleza Auténtica Latina
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Desarrollamos paletas, bases y pigmentos micronizados que realzan subtonos dorados, canela, oliva y profundos característicos de nuestra identidad.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-[#d4af37] transition duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 text-[#9a761a] flex items-center justify-center">
                <Award size={22} />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Pureza Botánica & Cruelty-Free
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Ingredientes certificados como aceite de argán virgen, keratina hidrolizada y extractos botánicos puros, 100% libres de crueldad animal y parabenos dañinos.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-3 hover:border-[#d4af37] transition duration-300">
              <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 text-[#9a761a] flex items-center justify-center">
                <Users size={22} />
              </div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Asesoría Humana & Showroom
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Acompañamiento personalizado en colorimetría y rutinas de cuidado tanto en nuestro showroom presencial como vía WhatsApp con expertas de belleza.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Galería "Nuestro Entorno & Creación" (IMÁGENES MÁS PEQUEÑAS Y PROPORCIONALES) */}
        <section id="galeria" className="scroll-mt-36 space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Detrás de Cada Detalle
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Nuestro Entorno & Creación
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto mt-1">
              Procesos rigurosos de formulación, selección botánica y empaque de alta cosmética.
            </p>
          </div>

          {/* Compact gallery: 2 columns on mobile, 4 columns on tablet/desktop, smaller height */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            
            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs group hover:border-[#d4af37] transition duration-300">
              <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-stone-100 relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBRtAH_hUp93_iZeEYPYvrjfIJviUJkihzYTY1-tfSfJRy4Qh7CNjechCZ1WzCA4ubl_gHvFTyIRCp85rX7Q1vHzl-DILpvThVo5A1g7lRoR1IEFCnXPzC-k2baU0oLlRO_-QbJzXxEj6hVCg5I8jFUASNjpgt98TgIBlWzLK9HH_w78LZZiECn4Kt7NY9jp7uIAj0Pj3nzTWqGh_OCaMLYRV7q4A3biJHyJaJtVMDCSVmGcvju_Va"
                  alt="Laboratorio de formulación"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="pt-2 px-1 text-center">
                <h4 className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-1">Formulación Bio-activa</h4>
                <p className="text-[10px] text-stone-400">Estándar internacional</p>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs group hover:border-[#d4af37] transition duration-300">
              <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-stone-100 relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG3GgHGosoACKiWUwym4DMdIdIAOKVz82WSFC8mKD2UKoucclsltVhv0mWUgKICIP39Zrixf4lcL_VPrg0EL235aKJJJBEdxggerW0OCb75FoCnZ1t7o30Gq2N93eL9UpHeNxisAUM-dhM3dLTKmBEAuG8q_stBAo1uTXG5hAr4822UFUQxZjWICGwXe4upvtjkY_mQkMdDIC9x6QD_MktBV8em-hMMnwiuJQR4uRoE6SpY0JuWMeP"
                  alt="Aceites botánicos puros"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="pt-2 px-1 text-center">
                <h4 className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-1">Extractos Botánicos</h4>
                <p className="text-[10px] text-stone-400">Aceite de argán y rosa</p>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs group hover:border-[#d4af37] transition duration-300">
              <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-stone-100 relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2nA4WAjjWtq6PsHo3g3RRZP4Ew3mf4DmPeTw4XK6ut71TSVxCShe61EgB1dfXpX1ekoKz2uwK0SPaxbtig7HYdaABnbMQtigxg3pVapTEdS2EKg24fy46UB9JpWnlyL9zpHbrmvCrQTlpCbjuQ7h0zCPT05G1a2E90Nh8a5JrcohoLrFqF3xMWpJkvSG6u-6JCtBkR1EvKCU-vHyRUPfI7u5THaIlEg-7nYmqn3gPP3vX5JAcmfQ0"
                  alt="Envasado artesanal"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="pt-2 px-1 text-center">
                <h4 className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-1">Envasado Artesanal</h4>
                <p className="text-[10px] text-stone-400">Control de calidad fino</p>
              </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs group hover:border-[#d4af37] transition duration-300">
              <div className="w-full h-28 sm:h-36 rounded-xl overflow-hidden bg-stone-100 relative">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMScOdi90ZmP1G4lwi71yLWO3yeBfQiCBsHKG0df60ApArJRRQxYGlCaHxRjtGjawlqySg6oqbo4IMA11wZul3ebxWZir7mqJO5kzD1ATBQGqbK8v_53AobnHFXqTrZHVyjc2o5_F4AqKdKQ9Mk7_2mO-BCv-eqXIQHPATBZ6OdS0XFcsepHiw0gKtGGhzV6SG_Uku5R4lcnT6LDun2K1kq0_RRrqwcNxn-wR5dBYgcio_Cl4WZGlv"
                  alt="Sesiones editoriales"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="pt-2 px-1 text-center">
                <h4 className="text-[11px] sm:text-xs font-bold text-stone-800 line-clamp-1">Colección Editorial</h4>
                <p className="text-[10px] text-stone-400">Diseñado en Colombia</p>
              </div>
            </div>

          </div>
        </section>

        {/* 5. Bloque de Datos Legales & Registro de la Empresa */}
        <section id="empresa" className="scroll-mt-36 space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Transparencia Institucional
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Datos Corporativos & Legales
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto mt-1">
              Toda la información reglamentaria y fiscal para tu tranquilidad y confianza.
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-8 lg:p-10 shadow-xs space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              
              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-stone-100 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Building2 size={13} className="text-[#d4af37]" />
                  Razón Social
                </span>
                <p className="font-serif-title font-bold text-stone-900 text-base">
                  {settings.storeName} Cosmética S.A.S.
                </p>
                <p className="text-stone-500 text-xs">Sociedad comercial legalmente constituida</p>
              </div>

              <div className="space-y-1.5 border-b sm:border-b-0 lg:border-r border-stone-100 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#d4af37]" />
                  Identificación Tributaria
                </span>
                <p className="font-mono font-bold text-stone-900 text-base">
                  NIT: 901.584.219-3
                </p>
                <p className="text-stone-500 text-xs">Cámara de Comercio de Medellín</p>
              </div>

              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-stone-100 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <MapPin size={13} className="text-[#d4af37]" />
                  Sede Principal Showroom
                </span>
                <p className="font-medium text-stone-900 text-sm">
                  {settings.storeAddress}
                </p>
                <p className="text-stone-500 text-xs">{settings.storeCity}, {settings.storeDepartment} - Colombia</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Truck size={13} className="text-[#d4af37]" />
                  Cobertura Logística
                </span>
                <p className="font-medium text-stone-900 text-sm">
                  Nacional 100% Colombia
                </p>
                <p className="text-stone-500 text-xs">Servientrega, Envía, Coordinadora</p>
              </div>

            </div>

            {/* Badges de Garantía & Cumplimiento */}
            <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Registro Sanitario INVIMA
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Facturación Electrónica DIAN
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-50 border border-stone-200 rounded-full font-medium">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Garantía de Satisfacción 30 Días
                </span>
              </div>

              <span className="text-[11px] text-stone-400 italic">
                Regulados bajo el estatuto del consumidor Ley 1480
              </span>
            </div>
          </div>
        </section>

        {/* 6. Formas de Contacto Directo */}
        <section id="contacto" className="scroll-mt-36 space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Siempre a Tu Disposición
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Canales de Contacto Directo
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto mt-1">
              Elige tu canal preferido. Nuestro equipo responde en cuestión de minutos en horario laboral.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* WhatsApp */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#25D366] transition duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-serif-title text-base font-bold text-stone-900">
                  WhatsApp Oficial
                </h3>
                <p className="text-stone-500 text-xs">
                  Atención prioritaria para asesorías, cotizaciones y pedidos directos.
                </p>
                <p className="font-mono text-xs font-bold text-stone-800">
                  {settings.whatsappDisplay}
                </p>
              </div>
              <a
                href={`https://wa.me/${cleanWhatsappNumber}?text=Hola%20${encodeURIComponent(
                  settings.storeName
                )},%20quisiera%20asesoría%20sobre%20un%20producto.`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1faa4f] text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Chatear al WhatsApp</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Teléfono */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#d4af37] transition duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#9a761a] flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <h3 className="font-serif-title text-base font-bold text-stone-900">
                  Línea Telefónica
                </h3>
                <p className="text-stone-500 text-xs">
                  Atención directa para consultas corporativas y servicio al cliente.
                </p>
                <p className="font-mono text-xs font-bold text-stone-800">
                  {settings.supportPhone}
                </p>
              </div>
              <a
                href={`tel:${settings.supportPhone.replace(/[^0-9+]/g, '')}`}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Llamar ahora</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Email */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#d4af37] transition duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#9a761a] flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <h3 className="font-serif-title text-base font-bold text-stone-900">
                  Correo Electrónico
                </h3>
                <p className="text-stone-500 text-xs">
                  Consultas comerciales, peticiones, quejas y cotizaciones formales.
                </p>
                <p className="text-xs font-bold text-stone-800 truncate">
                  {settings.supportEmail}
                </p>
              </div>
              <a
                href={`mailto:${settings.supportEmail}?subject=Consulta%20desde%20la%20Web%20Mujer%20Latina`}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 hover:border-[#d4af37] text-stone-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-white"
              >
                <span>Enviar correo</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Horarios */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-[#d4af37] transition duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h3 className="font-serif-title text-base font-bold text-stone-900">
                  Horarios de Atención
                </h3>
                <p className="text-stone-500 text-xs leading-relaxed">
                  Lunes a Sábado: 8:00 AM – 7:00 PM<br />
                  Domingos & Festivos: 10:00 AM – 4:00 PM
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Showroom Abierto</span>
                </div>
              </div>
              <button
                onClick={() => scrollToSection('mapa')}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-[#d4af37]/20 text-stone-800 hover:text-[#9a761a] text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Ver cómo llegar</span>
                <ChevronRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* 7. Showroom Físico & Ubicación en Google Maps (ESPECIALMENTE OPTIMIZADO) */}
        <section id="mapa" className="scroll-mt-36 space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58d24]">
              Visítanos en Persona
            </span>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Ubicación Showroom en Google Maps
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto mt-1">
              Experimenta los aromas, texturas y recibe asesoría de colorimetría personalizada en nuestro exclusivo espacio.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Columna Izquierda: Información de cómo llegar y facilidades (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-stone-200">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 text-[#9a761a] text-xs font-bold">
                  <MapPin size={13} />
                  <span>Showroom Principal {settings.storeCity}</span>
                </div>

                <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">
                  {settings.storeAddress}
                </h3>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  Ubicado en el corazón de El Poblado, un sector seguro, accesible y de fácil acceso vehicular y peatonal.
                </p>

                {/* Puntos de Referencia y Servicios */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-stone-600">
                    <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Puntos de referencia:</strong> A 2 cuadras del Parque de El Poblado y cerca de la Calle 10.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-stone-600">
                    <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Transporte público:</strong> A 7 minutos a pie de la Estación Metro Poblado (Línea A).</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-stone-600">
                    <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Parqueadero gratuito:</strong> Contamos con bahía privada y vigilancia para clientas.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-stone-600">
                    <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                    <span><strong>Probadores de maquillaje:</strong> Prueba tonos de bases, iluminadores y fragancias en vivo.</span>
                  </div>
                </div>
              </div>

              {/* Botones de Navegación GPS Externa */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Abrir en Google Maps (Navegación GPS)</span>
                  <ExternalLink size={12} className="opacity-70" />
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={wazeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-stone-300 hover:border-cyan-500 text-stone-800 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 bg-stone-50 hover:bg-white"
                  >
                    <span>Llegar con Waze</span>
                    <ExternalLink size={11} className="opacity-60" />
                  </a>

                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}?text=Hola%20${encodeURIComponent(
                      settings.storeName
                    )},%20voy%20de%20camino%20al%20showroom.%20%C2%BFMe%20pueden%20compartir%20su%20ubicaci%C3%B3n%20en%20tiempo%20real%3F`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold text-center transition flex items-center justify-center gap-1.5 bg-white"
                  >
                    <span>Pedir por WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Columna Derecha: Iframe de Google Maps Integrado (7 cols) */}
            <div className="lg:col-span-7 bg-stone-100 relative min-h-[350px] sm:min-h-[420px]">
              <iframe
                title={`Ubicación ${settings.storeName} - ${settings.storeCity}`}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.368383921867!2d-75.57022062402128!3d6.214987026685897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e44282a5c9f5db7%3A0x6b1897c57c427352!2sCl.%2010%20%2340-20%2C%20El%20Poblado%2C%20Medell%C3%ADn%2C%20El%20Poblado%2C%20Medell%C3%ADn%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1710000000000!5m2!1ses!2sco"
                className="w-full h-full border-0 min-h-[350px] sm:min-h-[420px]"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Pin flotante informativo sobre el mapa */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-200 flex items-center gap-2 pointer-events-none text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                <div>
                  <p className="font-bold text-stone-900">{settings.storeName} Showroom</p>
                  <p className="text-[10px] text-stone-500">{settings.storeAddress}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 8. Formulario Rápido de Consulta Directa */}
        <section className="bg-gradient-to-br from-stone-900 via-stone-800 to-black text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-stone-700">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37] text-[#d4af37] rounded-full text-xs font-bold">
                <Sparkles size={13} />
                <span>Atención Personalizada</span>
              </div>
              <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-white leading-tight">
                ¿Tienes alguna duda sobre fórmulas o necesitas asesoría?
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Envíanos tu consulta. Te conectaremos de inmediato con una asesora experta en colorimetría y cuidado capilar sin ningún compromiso.
              </p>
              
              <div className="pt-2 space-y-2 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#d4af37]" />
                  <span>Respuesta rápida en minutos por WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#d4af37]" />
                  <span>Recomendación personalizada para tu tono de piel y cabello</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-white text-stone-800 p-6 sm:p-8 rounded-2xl shadow-lg space-y-4">
              {sentToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Redirigiendo a WhatsApp con tu consulta...</span>
                </div>
              )}

              <form onSubmit={handleQuickFormSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Camila Gómez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 300 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Motivo de Contacto
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs outline-none bg-white transition"
                    >
                      <option value="asesoria">Asesoría de Producto & Tono</option>
                      <option value="showroom">Visita / Cita en Showroom</option>
                      <option value="pedido">Estado de Pedido o Envío</option>
                      <option value="mayorista">Ventas al Por Mayor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    ¿En qué podemos colaborarte hoy? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Cuéntanos qué producto te interesa o qué inquietud tienes..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-xs outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1faa4f] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Enviar Mensaje al WhatsApp Oficial</span>
                </button>
              </form>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

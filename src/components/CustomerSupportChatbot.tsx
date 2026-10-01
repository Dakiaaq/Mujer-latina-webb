import React, { useState, useRef, useEffect } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  HelpCircle,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface CustomerSupportChatbotProps {
  controller: StoreController;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickAction?: {
    label: string;
    actionType: 'navigate_catalog' | 'navigate_category' | 'whatsapp' | 'view_product';
    payload?: string;
  };
}

export const CustomerSupportChatbot: React.FC<CustomerSupportChatbotProps> = ({ controller }) => {
  const { 
    activeView, 
    setActiveView, 
    setCategoryFilter, 
    storeSettings, 
    cartTotalCount,
    products,
    navigateToProduct
  } = controller;

  // Do not render chatbot in the admin panel
  if (activeView.startsWith('admin_')) {
    return null;
  }

  // Ref to the outer chatbot container for click-outside detection
  const chatbotRef = useRef<HTMLElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Chatbot state
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const formatCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: '¡Hola! 🌸 Bienvenida a Mujer Latina. Soy Valentina, tu asesora virtual de compras y belleza.\n\nPuedo responderte sobre nuestros envíos, medios de pago, rastreo de pedidos, garantías o detalles de nuestros productos. ¿En qué te puedo asesorar hoy?',
      timestamp: formatCurrentTime(),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll chat internally WITHOUT touching window scroll
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [isOpen, messages, isTyping]);

  // Click outside listener: Closes the chatbot when clicking or tapping anywhere outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Use mousedown and touchstart for instant response across devices
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Suggested quick prompts
  const quickPrompts = [
    {
      icon: <Truck size={13} />,
      label: '¿Envíos y tiempos de entrega?',
      query: '¿Cuánto tarda el envío y cuánto cuesta?',
    },
    {
      icon: <CreditCard size={13} />,
      label: '¿Qué medios de pago aceptan?',
      query: '¿Qué medios de pago tienen disponibles?',
    },
    {
      icon: <PackageCheck size={13} />,
      label: '¿Cómo rastreo mi pedido?',
      query: '¿Cómo hago seguimiento a mi guía o pedido?',
    },
    {
      icon: <Sparkles size={13} />,
      label: '¿Tratamiento capilar de oro?',
      query: '¿Cuál es el mejor tratamiento para recuperar el cabello?',
    },
    {
      icon: <ShieldCheck size={13} />,
      label: '¿Tienen garantía los productos?',
      query: '¿Cómo funciona la política de garantía y devoluciones?',
    },
    {
      icon: <MessageCircle size={13} />,
      label: 'Asesora en WhatsApp',
      query: 'Deseo hablar directamente con una asesora por WhatsApp',
    },
  ];

  // Helper to normalize and match queries
  const getBotResponse = (userQuery: string): { text: string; quickAction?: ChatMessage['quickAction'] } => {
    const q = userQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const phone = storeSettings?.whatsappNumber || '573168953895';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // 1. Direct request to speak with a human or open WhatsApp
    if (
      q.includes('whatsapp') || 
      q.includes('humano') || 
      q.includes('asesor') || 
      q.includes('asesora') || 
      q.includes('persona') || 
      q.includes('llamar') || 
      q.includes('telefono') || 
      q.includes('hablar') || 
      q.includes('contacto') ||
      q.includes('chat directo')
    ) {
      return {
        text: '¡Con mucho gusto! Puedes chatear en tiempo real con una de nuestras asesoras por WhatsApp para resolver dudas personalizadas o coordinar tu compra directamente.',
        quickAction: {
          label: 'Chatear con Asesora en WhatsApp',
          actionType: 'whatsapp',
          payload: `https://wa.me/${cleanPhone}?text=${encodeURIComponent('¡Hola Mujer Latina! Vengo desde el chat de la tienda y requiero asesoría personalizada.')}`,
        },
      };
    }

    // 2. Greetings
    if (
      q === 'hola' || 
      q === 'buenas' || 
      q.startsWith('hola ') || 
      q.includes('buenos dias') || 
      q.includes('buenas tardes') || 
      q.includes('buenas noches') || 
      q === 'hey' || 
      q === 'que tal'
    ) {
      return {
        text: '¡Hola! 🌸 Qué alegría saludarte. Soy Valentina, asesora oficial de Mujer Latina. ¿En qué puedo orientarte hoy? Puedes preguntarme sobre envíos, pagos, rastreo de pedidos o recomendaciones de nuestros productos.',
        quickAction: {
          label: 'Ver Catálogo Completo',
          actionType: 'navigate_catalog',
        },
      };
    }

    // 3. Shipping & Delivery
    if (
      q.includes('envio') || 
      q.includes('tarda') || 
      q.includes('cuanto demora') || 
      q.includes('domicilio') || 
      q.includes('entrega') || 
      q.includes('flete') || 
      q.includes('transportadora') || 
      q.includes('costo envio') || 
      q.includes('cuando llega')
    ) {
      return {
        text: '📦 **Envíos y Tiempos de Entrega a toda Colombia**:\n\n• **Ciudades principales:** 1 a 3 días hábiles.\n• **Resto del país:** 3 a 5 días hábiles.\n• **Costo estándar:** $15.000 COP (¡o **GRATIS** en pedidos con promociones especiales!).\n• **Transportadoras:** Despachamos con Interrapidísimo, Servientrega, Envía, Coordinadora o repartidores urbanos locales.',
        quickAction: {
          label: 'Explorar Catálogo',
          actionType: 'navigate_catalog',
        },
      };
    }

    // 4. Payment Methods
    if (
      q.includes('pago') || 
      q.includes('pagar') || 
      q.includes('nequi') || 
      q.includes('bancolombia') || 
      q.includes('tarjeta') || 
      q.includes('pse') || 
      q.includes('wompi') || 
      q.includes('transferencia') || 
      q.includes('contraentrega') || 
      q.includes('cuotas')
    ) {
      return {
        text: '💳 **Medios de Pago Seguros y Confiables**:\n\n• **Nequi y Bancolombia:** Transferencia directa e instantánea (puedes adjuntar tu comprobante al momento de ordenar).\n• **Tarjetas de Crédito / Débito y PSE:** Pasarela segura Wompi (Bancolombia) con cifrado bancario.\n• Todos los pagos son verificados y te enviamos confirmación inmediata.',
      };
    }

    // 5. Tracking / Order Status
    if (
      q.includes('rastreo') || 
      q.includes('rastrear') || 
      q.includes('guia') || 
      q.includes('pedido') || 
      q.includes('paquete') || 
      q.includes('seguimiento') || 
      q.includes('donde viene') || 
      q.includes('donde esta mi')
    ) {
      return {
        text: '🔍 **Seguimiento y Rastreo de tu Pedido**:\n\nTan pronto tu compra es confirmada y empacada por nuestro equipo de bodega, **recibirás automáticamente un mensaje de WhatsApp con la transportadora y el número de guía** para consultar el estado en tiempo real. También puedes consultarnos directamente con tu nombre o número de orden.',
        quickAction: {
          label: 'Consultar Estado por WhatsApp',
          actionType: 'whatsapp',
          payload: `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, deseo consultar el estado y la guía de mi pedido.')}`,
        },
      };
    }

    // 6. Hair Care / Capilar / Gold Line
    if (
      q.includes('capilar') || 
      q.includes('cabello') || 
      q.includes('pelo') || 
      q.includes('keratina') || 
      q.includes('oro 24k') || 
      q.includes('repolarizador') || 
      q.includes('frizz') || 
      q.includes('shampoo') || 
      q.includes('acondicionador') || 
      q.includes('puntas') || 
      q.includes('decolorado')
    ) {
      const goldTreatment = products.find((p) => p.sku === 'ML-CAP-001') || products[0];
      return {
        text: `✨ **Línea Capilar Oro 24K Mujer Latina**:\n\nNuestro producto estrella es el **${goldTreatment?.name || 'Tratamiento Capilar Oro 24K'}**. Repara la fibra capilar maltratada por químicos o calor, otorga brillo espejo, elimina el frizz y no contiene sales agresivas ni parabenos.`,
        quickAction: goldTreatment ? {
          label: 'Ver Tratamiento Capilar',
          actionType: 'view_product',
          payload: goldTreatment.id,
        } : {
          label: 'Ver Catálogo',
          actionType: 'navigate_catalog',
        },
      };
    }

    // 7. Facial Care / Serums
    if (
      q.includes('facial') || 
      q.includes('cara') || 
      q.includes('piel') || 
      q.includes('serum') || 
      q.includes('suero') || 
      q.includes('vitamina c') || 
      q.includes('acido hialuronico') || 
      q.includes('hidratacion') || 
      q.includes('manchas') || 
      q.includes('arrugas')
    ) {
      return {
        text: '🌿 **Cuidado Facial Botánico**:\n\nContamos con fórmulas avanzadas con **Ácido Hialurónico vegetal y Vitamina C** para devolver la luminosidad, unificar el tono y aportar hidratación profunda sin sensación grasosa. Aptas para todo tipo de piel.',
        quickAction: {
          label: 'Explorar Cuidado Facial',
          actionType: 'navigate_category',
          payload: 'cuidado-facial',
        },
      };
    }

    // 8. Jewelry / Oro Laminado 18K
    if (
      q.includes('joya') || 
      q.includes('joyeria') || 
      q.includes('collar') || 
      q.includes('arete') || 
      q.includes('pulsera') || 
      q.includes('anillo') || 
      q.includes('oro laminado') || 
      q.includes('se negrea') || 
      q.includes('se oxida') || 
      q.includes('alergia')
    ) {
      return {
        text: '💎 **Joyería en Oro Laminado 18K**:\n\nNuestras piezas cuentan con triple recubrimiento de Oro de 18 Kilates sobre base antialérgica. No manchan la piel, conservan su brillo y cuentan con garantía contra cambio de color en uso adecuado.',
        quickAction: {
          label: 'Ver Colección de Joyería',
          actionType: 'navigate_category',
          payload: 'joyeria',
        },
      };
    }

    // 9. Bags / Handbags
    if (
      q.includes('bolso') || 
      q.includes('cartera') || 
      q.includes('mochila') || 
      q.includes('morral') || 
      q.includes('cuero') || 
      q.includes('material')
    ) {
      return {
        text: '👜 **Bolsos y Accesorios Mujer Latina**:\n\nElaborados en **cuero vegano colombiano de alta resistencia**, con acabados de costura reforzados y herrajes dorados anticorrosivos. Diseños versátiles para tu día a día o eventos especiales.',
        quickAction: {
          label: 'Ver Colección de Bolsos',
          actionType: 'navigate_category',
          payload: 'bolsos',
        },
      };
    }

    // 10. Guarantees and Returns
    if (
      q.includes('garantia') || 
      q.includes('devolucion') || 
      q.includes('cambio') || 
      q.includes('cambiar') || 
      q.includes('reclamo') || 
      q.includes('defecto')
    ) {
      return {
        text: '🛡️ **Garantía y Devoluciones**:\n\n• Cuentas con **30 días de garantía** por defectos de fábrica en todos nuestros productos.\n• Si necesitas un cambio por referencia o color, nuestro equipo te asiste sin complicaciones.\n• Compras 100% protegidas y satisfacción garantizada.',
      };
    }

    // 11. Store Hours & Location
    if (
      q.includes('horario') || 
      q.includes('abren') || 
      q.includes('atienden') || 
      q.includes('donde estan') || 
      q.includes('donde quedan') || 
      q.includes('tienda fisica') || 
      q.includes('ubicacion') || 
      q.includes('ciudad')
    ) {
      return {
        text: '📍 **Ubicación y Horarios de Atención**:\n\n• **Tienda Online:** Disponible las 24 horas del día, los 7 días de la semana.\n• **Atención de Asesoras por WhatsApp:** Lunes a Sábado de 8:00 AM a 8:00 PM y Domingos de 9:00 AM a 5:00 PM.\n• Realizamos despachos directos a todos los municipios de Colombia.',
      };
    }

    // 12. How to Buy Step-by-Step
    if (
      q.includes('como compro') || 
      q.includes('como comprar') || 
      q.includes('hacer pedido') || 
      q.includes('como pido') || 
      q.includes('pasos')
    ) {
      return {
        text: '🛍️ **Cómo Comprar en Mujer Latina**:\n\n1. Elige tus productos favoritos y haz clic en **"Agregar al Carrito"**.\n2. Abre tu carrito y presiona **"Continuar con la Compra"**.\n3. Diligencia tu dirección de entrega y medio de pago preferido (Nequi, Bancolombia o Wompi).\n4. ¡Listo! Recibirás la confirmación inmediata y tu número de guía al ser despachado.',
        quickAction: {
          label: 'Ir a la Tienda',
          actionType: 'navigate_catalog',
        },
      };
    }

    // 13. Promotions and Discounts
    if (
      q.includes('promocion') || 
      q.includes('descuento') || 
      q.includes('oferta') || 
      q.includes('rebaja') || 
      q.includes('cupon')
    ) {
      return {
        text: '🏷️ **Promociones Activas**:\n\nEn nuestro catálogo encontrarás productos seleccionados con precios de lanzamiento y descuentos especiales señalados con la etiqueta dorada de oferta. ¡Aprovecha antes de que se agoten!',
        quickAction: {
          label: 'Ver Productos en Oferta',
          actionType: 'navigate_catalog',
        },
      };
    }

    // 14. FALLBACK / UNANSWERED QUESTIONS -> Redirigir directamente a WhatsApp con la duda del cliente
    const encodedUserQuery = encodeURIComponent(`Hola Mujer Latina, tengo una duda sobre mi compra: "${userQuery}"`);
    return {
      text: `No tengo esa respuesta exacta en mi base de preguntas frecuentes, pero **una de nuestras asesoras humanas te responderá de inmediato por WhatsApp** para darte atención personalizada y solucionar todas tus dudas 🌸.`,
      quickAction: {
        label: 'Continuar consulta en WhatsApp',
        actionType: 'whatsapp',
        payload: `https://wa.me/${cleanPhone}?text=${encodedUserQuery}`,
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputValue).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: formatCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Natural typing delay
    setTimeout(() => {
      const response = getBotResponse(content);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: formatCurrentTime(),
        quickAction: response.quickAction,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleActionClick = (action: NonNullable<ChatMessage['quickAction']>) => {
    if (action.actionType === 'navigate_catalog') {
      setCategoryFilter('all');
      setActiveView('catalog');
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'navigate_category' && action.payload) {
      setCategoryFilter(action.payload);
      setActiveView('catalog');
      setIsOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action.actionType === 'view_product' && action.payload) {
      const prod = products.find((p) => p.id === action.payload);
      if (prod) {
        navigateToProduct(prod);
        setIsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  return (
    <aside 
      ref={chatbotRef}
      aria-label="Asistente de atención y soporte Mujer Latina"
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 select-none"
    >
      {/* Collapsed floating circular trigger */}
      {!isOpen && (
        <div className="relative flex items-center">
          {/* Subtle tooltip pill (desktop) */}
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-stone-900/90 text-white border border-[#d4af37]/40 shadow-lg text-xs cursor-pointer hover:bg-black transition-all group backdrop-blur-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-stone-200 group-hover:text-white">
              ¿Dudas o necesitas ayuda?
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            id="open-customer-support-chatbot"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#111111] via-stone-900 to-[#1f1a10] text-[#d4af37] border-2 border-[#d4af37] shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative cursor-pointer group"
            title="Abrir asistente de compras y soporte"
          >
            <MessageCircle size={22} className="sm:w-6 sm:h-6 group-hover:rotate-6 transition-transform text-[#d4af37]" />
            
            {/* Green online presence indicator */}
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900 shadow-xs" />
            
            {hasUnread && (
              <span className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow animate-bounce">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div 
          className="w-[calc(100vw-24px)] sm:w-[380px] h-[500px] sm:h-[530px] max-h-[80vh] sm:max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.35), 0 0 20px rgba(212, 175, 55, 0.2)' }}
        >
          {/* Chat Window Header */}
          <div className="bg-stone-900 text-white p-3.5 sm:p-4 border-b border-[#d4af37]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#d4af37] overflow-hidden bg-stone-800 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Valentina Asesora"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif-title font-bold text-sm text-white leading-tight">
                    Valentina
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold border border-[#d4af37]/40">
                    Asesora
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>En línea • Mujer Latina Oficial</span>
                </p>
              </div>
            </div>

            {/* Window control buttons */}
            <div className="flex items-center gap-1 text-stone-400">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-white transition cursor-pointer"
                title="Reiniciar chat"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-white transition cursor-pointer"
                title="Minimizar"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-800 hover:text-white transition cursor-pointer"
                title="Cerrar chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Guarantee / Security Bar */}
          <div className="bg-[#faf8f2] border-b border-stone-200 px-3.5 py-2 flex items-center justify-between text-[11px] text-stone-600">
            <span className="flex items-center gap-1.5 truncate">
              <ShieldCheck size={14} className="text-[#b58d24] shrink-0" />
              <span className="truncate">Atención inmediata y envíos a Colombia</span>
            </span>
            {cartTotalCount > 0 && (
              <span className="font-bold text-[#b58d24] shrink-0 ml-1">
                {cartTotalCount} en carrito
              </span>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-[#faf9f6] overscroll-contain">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-stone-900 text-white rounded-br-none'
                      : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  
                  {/* Quick Action Button */}
                  {msg.quickAction && (
                    <div className="mt-2.5 pt-2 border-t border-stone-100">
                      {msg.quickAction.actionType === 'whatsapp' ? (
                        <a
                          href={msg.quickAction.payload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs"
                        >
                          <MessageCircle size={14} />
                          <span>{msg.quickAction.label}</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActionClick(msg.quickAction!)}
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer bg-[#d4af37] hover:bg-[#c29e2f] text-black shadow-xs"
                        >
                          <ArrowRight size={14} />
                          <span>{msg.quickAction.label}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-stone-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-3 py-2 rounded-2xl w-18 shadow-2xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>

          {/* Quick Questions Pills (Compact Horizontal Scroll) */}
          <div className="p-2 bg-stone-50 border-t border-stone-200 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.query)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-200 text-[11px] text-stone-700 whitespace-nowrap transition cursor-pointer shadow-2xs hover:border-[#d4af37] shrink-0"
              >
                <span className="text-[#b58d24]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-stone-100 focus:bg-white text-stone-800 placeholder-stone-400 text-xs px-3.5 py-2.5 rounded-full border border-stone-200 focus:border-[#d4af37] focus:outline-hidden transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-9 h-9 rounded-full bg-[#d4af37] hover:bg-[#c29e2f] disabled:opacity-40 disabled:hover:bg-[#d4af37] text-black flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
              title="Enviar mensaje"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </aside>
  );
};

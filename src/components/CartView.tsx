import React, { useState, useEffect, useMemo } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { 
  Trash2, 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { ShippingData } from '../types';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment } from '../utils/colombiaLocations';

interface CartViewProps {
  controller: StoreController;
}

export const CartView: React.FC<CartViewProps> = ({ controller }) => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartShippingFee,
    cartTotal,
    processOrderWithWhatsApp,
    setActiveView,
    currentUser,
    openLoginModal,
  } = controller;

  // Initialize shipping data: pre-filled if logged in, empty if guest
  const [shipping, setShipping] = useState<ShippingData>(() => ({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    department: currentUser?.department || '',
    city: currentUser?.city || '',
    address: currentUser?.address || '',
    documentId: currentUser?.documentId || currentUser?.documentNumber || '',
    additionalInfo: '',
    saveToProfile: false,
  }));

  const [saveToProfile, setSaveToProfile] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [orderProcessedSuccess, setOrderProcessedSuccess] = useState<string | null>(null);

  // Available cities for selected department
  const availableCities = useMemo(() => {
    return getCitiesForDepartment(shipping.department);
  }, [shipping.department]);

  const handleDepartmentChange = (dept: string) => {
    const cities = getCitiesForDepartment(dept);
    setShipping((prev) => ({
      ...prev,
      department: dept,
      city: cities.length > 0 ? cities[0] : '',
    }));
    if (formErrors.department) {
      setFormErrors((prev) => ({ ...prev, department: '', city: '' }));
    }
  };

  // Automatically update fields if user logs in while viewing the cart
  useEffect(() => {
    if (currentUser) {
      setShipping((prev) => ({
        ...prev,
        fullName: currentUser.fullName || prev.fullName,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        department: currentUser.department || prev.department,
        city: currentUser.city || prev.city,
        address: currentUser.address || prev.address,
        documentId: currentUser.documentId || currentUser.documentNumber || prev.documentId,
      }));
    }
  }, [currentUser]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Ingresa tu nombre completo';
    if (!shipping.phone.trim()) errors.phone = 'Ingresa tu WhatsApp de contacto';
    if (!shipping.department.trim()) errors.department = 'Elige un departamento';
    if (!shipping.city.trim()) errors.city = 'Elige tu ciudad o municipio';
    if (!shipping.address.trim()) errors.address = 'Ingresa la dirección de entrega';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll smoothly to form if on mobile
      const formEl = document.getElementById('checkout-shipping-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const result = processOrderWithWhatsApp({
      ...shipping,
      saveToProfile,
    });
    if (result) {
      setOrderProcessedSuccess(result.order.id);
      window.open(result.url, '_blank');
    }
  };

  if (orderProcessedSuccess) {
    return (
      <div className="bg-[#fcfcfc] min-h-[70vh] py-10 sm:py-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 animate-fadeIn">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366]/20 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900">
            ¡Pedido Generado Exitosamente!
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm">
            Tu orden <strong className="text-stone-900 font-mono">{orderProcessedSuccess}</strong> ha sido registrada en el sistema y enviada a WhatsApp Business para confirmación de pago y emisión de guía.
          </p>

          <div className="p-3.5 bg-stone-50 rounded-2xl text-xs text-stone-600 space-y-1.5 text-left border border-stone-100">
            <p><strong>Destinatario:</strong> {shipping.fullName}</p>
            <p><strong>Ciudad:</strong> {shipping.city}, {shipping.department}</p>
            <p><strong>Estado:</strong> <span className="text-amber-600 font-bold">Pendiente de comprobante bancario</span></p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setOrderProcessedSuccess(null);
                setActiveView('profile');
              }}
              className="w-full py-3 bg-stone-900 text-white rounded-full text-xs sm:text-sm font-semibold hover:bg-stone-800 transition cursor-pointer"
            >
              Ver Mis Pedidos
            </button>
            <button
              onClick={() => {
                setOrderProcessedSuccess(null);
                setActiveView('catalog');
              }}
              className="w-full py-2.5 text-stone-600 hover:text-stone-900 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-[#fcfcfc] min-h-[60vh] py-16 sm:py-20 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-800">
            Tu carrito está vacío
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Descubre nuestras fórmulas exclusivas y añade tus productos preferidos.
          </p>
          <button
            onClick={() => setActiveView('catalog')}
            className="mt-2 px-6 sm:px-8 py-3 bg-[#d4af37] text-black font-bold text-xs sm:text-sm rounded-full shadow-md hover:bg-[#c29e2f] transition cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
              Carrito de Compras
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm">
              Revisa tus productos y completa tu entrega por WhatsApp oficial.
            </p>
          </div>

          <button
            onClick={() => setActiveView('catalog')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Seguir Comprando</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          
          {/* Cart Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xs p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
                  Artículos en Bolsa ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                <span className="text-[11px] text-stone-400">
                  {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {/* Items List: Clean mobile-adapted flex cards */}
              <div className="divide-y divide-stone-100 space-y-3 pt-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3 sm:gap-4 items-start sm:items-center">
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Middle details */}
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#b58d24] font-bold block">
                        {item.product.category}
                      </span>
                      <h4 className="font-serif-title text-xs sm:text-sm font-bold text-stone-900 line-clamp-2 sm:truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-stone-500 font-medium mt-0.5 sm:mt-1">
                        ${Math.round(item.product.price).toLocaleString('es-CO')} COP c/u
                      </p>

                      {/* Mobile Quantity selector (Inline on mobile) */}
                      <div className="flex items-center gap-2 mt-2 sm:hidden">
                        <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition"
                            aria-label="Disminuir"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition"
                            aria-label="Aumentar"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-stone-900 ml-auto">
                          ${Math.round(item.product.price * item.quantity).toLocaleString('es-CO')}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Quantity & Pricing */}
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      <div className="flex items-center border border-stone-300 rounded-full overflow-hidden bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-stone-900 font-bold text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-bold text-stone-900 block">
                          ${Math.round(item.product.price * item.quantity).toLocaleString('es-CO')} COP
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-500 mt-1 transition inline-flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Eliminar del carrito"
                        >
                          <Trash2 size={12} />
                          <span>Quitar</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Reassurance Banner */}
            <div className="bg-stone-100/70 rounded-2xl p-3.5 border border-stone-200/80 flex items-center gap-3 text-stone-600 text-xs">
              <ShieldCheck size={18} className="text-[#b58d24] flex-shrink-0" />
              <span>
                <strong>Compra 100% protegida:</strong> Despacho nacional asegurado con seguimiento y soporte vía WhatsApp.
              </span>
            </div>
          </div>

          {/* Checkout & Shipping Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <form 
              id="checkout-shipping-form"
              onSubmit={handleCheckoutWhatsApp} 
              className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm p-4 sm:p-7 space-y-5"
            >
              
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-lg sm:text-xl font-bold text-stone-900">
                    Datos para la Entrega
                  </h3>
                  {currentUser && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-[10px] sm:text-[11px] font-semibold text-emerald-800">
                      <UserCheck size={12} />
                      Cuenta activa
                    </span>
                  )}
                </div>

                {currentUser ? (
                  <div className="mt-2.5 p-3 bg-stone-50 border border-stone-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-stone-700">
                    <Sparkles size={16} className="text-[#b58d24] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-stone-900">
                        ¡Hola, {currentUser.fullName}!
                      </p>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Tus datos se autocompletaron. Este pedido sumará créditos y descuentos en tu perfil.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 mt-1">
                    ¿Tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={openLoginModal}
                      className="text-[#b58d24] font-semibold hover:underline cursor-pointer"
                    >
                      Inicia sesión para autocompletar tus datos.
                    </button>
                  </p>
                )}
              </div>

              {/* Form inputs */}
              <div className="space-y-3.5 text-xs sm:text-sm">
                <div>
                  <label className="block text-stone-700 font-bold mb-1 text-xs">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    placeholder="Ej. Valentina Gómez"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm"
                  />
                  {formErrors.fullName && <p className="text-rose-600 text-[11px] mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-bold text-xs">
                      Correo Electrónico {currentUser ? '(Vinculado)' : '(Opcional)'}
                    </label>
                  </div>
                  <input
                    type="email"
                    value={shipping.email || ''}
                    readOnly={!!currentUser}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    placeholder="tu.correo@ejemplo.com"
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm ${
                      currentUser 
                        ? 'bg-stone-100/70 border-stone-200 text-stone-600 cursor-not-allowed' 
                        : 'bg-stone-50 border border-stone-200'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1 text-xs">
                      WhatsApp de Entrega *
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      placeholder="Ej. 312 000 0000"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm"
                    />
                    {formErrors.phone && <p className="text-rose-600 text-[11px] mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1 text-xs">
                      Cédula / Documento <span className="text-stone-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={shipping.documentId}
                      onChange={(e) => setShipping({ ...shipping, documentId: e.target.value })}
                      placeholder="Para factura electrónica"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1 text-xs">
                      Departamento *
                    </label>
                    <select
                      value={shipping.department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm cursor-pointer"
                      id="cart-department-select"
                    >
                      <option value="">-- Elige Departamento --</option>
                      {COLOMBIA_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {formErrors.department && <p className="text-rose-600 text-[11px] mt-1">{formErrors.department}</p>}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1 text-xs">
                      Ciudad / Municipio *
                    </label>
                    <select
                      value={shipping.city}
                      onChange={(e) => {
                        setShipping({ ...shipping, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                      }}
                      disabled={!shipping.department}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
                      id="cart-city-select"
                    >
                      <option value="">
                        {shipping.department ? '-- Elige Municipio --' : 'Primero elige dpto'}
                      </option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {formErrors.city && <p className="text-rose-600 text-[11px] mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 text-xs">
                    Dirección de Entrega Completa *
                  </label>
                  <input
                    type="text"
                    value={shipping.address}
                    onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                    placeholder="Ej. Calle 10 # 40-20, Apto 502, Poblado"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm"
                  />
                  {formErrors.address && <p className="text-rose-600 text-[11px] mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1 text-xs">
                    Indicaciones Adicionales <span className="text-stone-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={shipping.additionalInfo}
                    onChange={(e) => setShipping({ ...shipping, additionalInfo: e.target.value })}
                    placeholder="Ej. Conjunto residencial, dejar en portería"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] text-xs sm:text-sm"
                  />
                </div>

                {currentUser && (
                  <div className="pt-1">
                    <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none text-stone-700 text-xs">
                      <input
                        type="checkbox"
                        id="save-to-profile-checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="mt-0.5 sm:mt-0 w-4 h-4 rounded border-stone-300 text-[#b58d24] focus:ring-[#d4af37] accent-[#b58d24] cursor-pointer"
                      />
                      <span>Actualizar estos datos en mi perfil permanentemente</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t border-stone-100 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">${Math.round(cartSubtotal).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Costo de Envío Nacional</span>
                  <span className="font-semibold text-stone-900">
                    {cartShippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">GRATIS</span>
                    ) : (
                      `$${Math.round(cartShippingFee).toLocaleString('es-CO')} COP`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total a Pagar</span>
                  <span className="text-xl sm:text-2xl text-[#b58d24] font-serif-title">
                    ${Math.round(cartTotal).toLocaleString('es-CO')} COP
                  </span>
                </div>
              </div>

              {/* WhatsApp Checkout Button */}
              <button
                type="submit"
                id="cart-submit-whatsapp-btn"
                className="w-full py-3.5 sm:py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm sm:text-base transition duration-200 cursor-pointer"
              >
                <Send size={18} />
                <span>Procesar Pedido por WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck size={14} className="text-[#d4af37]" />
                <span>Transferencia Bancolombia, Nequi, Daviplata o Contraentrega</span>
              </div>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { StoreController } from '../controllers/useStoreController';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  LogIn, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  Info,
  LogOut,
  Home,
  BookOpen
} from 'lucide-react';

interface TopNavBarProps {
  controller: StoreController;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({ controller }) => {
  const {
    activeView,
    setActiveView,
    cartTotalCount,
    wishlistProducts,
    currentUser,
    openLoginModal,
    storeSettings,
    setIsProfileEditing,
    logout,
  } = controller;

  // Mobile Drawer State (Opens from the right side)
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  // Close drawer on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling and rubber-banding when mobile drawer is open
  React.useEffect(() => {
    if (mobileDrawerOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [mobileDrawerOpen]);

  const brandLogoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdNwwVQtlCdmCLIffs_4B-7mTe5vBcdO7JVBvf_dbsl4nAtNz1aHLVy21EcMr_VSAk0HKqaGAiXfgw7u67mUujsb8SqrunVsrB_Hz6AM4lJP09IDIlhLSNPY6OuIde7HwczlB6sk7_aIG5AyeIScVfB9f25RtvJqNrBxKELLtyab_gFMph46y-9FKnheMPlvRIvtHG5hOtjlrf3STQRcImBPjT5-UByzDqnTu4sxBAb1UpylVUboXdiHvasV00KeIsGA';

  const navigateAndClose = (view: any) => {
    setActiveView(view);
    setMobileDrawerOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111111] text-white border-b border-[#2b2b2b] shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
            id="nav-brand-logo"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-lg group-hover:scale-105 transition duration-300 flex-shrink-0">
              <img
                src={brandLogoUrl}
                alt={storeSettings?.storeName || "Mujer Latina"}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif-title text-base sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#d4af37] transition truncate max-w-[130px] sm:max-w-none">
                {storeSettings?.storeName || 'Mujer Latina'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setActiveView('home')}
              className={`transition pb-1 cursor-pointer ${
                activeView === 'home'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActiveView('catalog')}
              className={`transition pb-1 cursor-pointer ${
                activeView === 'catalog' || activeView === 'product_detail'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveView('about')}
              className={`transition pb-1 cursor-pointer ${
                activeView === 'about'
                  ? 'text-[#d4af37] border-b-2 border-[#d4af37]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Nosotros
            </button>
          </nav>

          {/* Action Icons Right Section */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            
            {/* Wishlist Icon */}
            <button
              onClick={() => setActiveView('wishlist')}
              className="relative p-2 text-stone-300 hover:text-[#d4af37] transition cursor-pointer"
              title="Mis Favoritos"
              id="nav-wishlist-btn"
            >
              <Heart 
                size={20} 
                className={`transition-colors sm:w-[22px] sm:h-[22px] ${
                  wishlistProducts && wishlistProducts.length > 0 ? 'fill-[#d4af37] text-[#d4af37]' : ''
                }`} 
              />
              {wishlistProducts && wishlistProducts.length > 0 ? (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-[#d4af37] text-black text-[10px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {wishlistProducts.length}
                </span>
              ) : null}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setActiveView('cart')}
              className="relative p-2 text-stone-300 hover:text-[#d4af37] transition cursor-pointer"
              title="Carrito de Compras"
              id="nav-cart-btn"
            >
              <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px]" />
              {cartTotalCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#25D366] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User / Authentication: CIRCULAR ICON (Avatar if logged in, or circular login button if guest) */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Admin button for desktop only */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveView('admin_dashboard')}
                    className="hidden lg:flex px-3 py-1.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black rounded-full text-xs font-bold tracking-wide transition items-center gap-1.5 shadow-sm cursor-pointer"
                    title="Panel de Administración"
                    id="nav-admin-panel-btn"
                  >
                    <ShieldCheck size={14} />
                    <span>Panel Admin</span>
                  </button>
                )}

                {/* Profile Circle Button */}
                <button
                  onClick={() => {
                    setIsProfileEditing(false);
                    if (currentUser.role === 'admin') {
                      setActiveView('admin_dashboard');
                    } else {
                      setActiveView('profile');
                    }
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#d4af37] hover:ring-2 hover:ring-[#d4af37]/60 transition flex items-center justify-center bg-stone-900 cursor-pointer flex-shrink-0"
                  title={`Mi Perfil (${currentUser.fullName})`}
                  id="nav-profile-btn"
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#d4af37]">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              /* When NOT logged in: Circular icon button on mobile, with expanded button on larger screens */
              <button
                onClick={openLoginModal}
                className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3.5 sm:py-1.5 rounded-full border border-[#d4af37]/80 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                title="Iniciar sesión"
                id="nav-login-btn"
              >
                <LogIn size={16} />
                <span className="hidden sm:inline text-xs font-semibold">Iniciar sesión</span>
              </button>
            )}

            {/* Mobile Menu Hamburger Button (Always visible on mobile/tablet whether logged in or not) */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 text-stone-300 hover:text-white cursor-pointer rounded-lg hover:bg-stone-800 transition ml-0.5"
              title="Abrir menú"
              id="mobile-menu-open-btn"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER: Slides from the RIGHT side */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
          />

          {/* Drawer content sliding in from right */}
          <div className="relative w-80 max-w-[85vw] bg-[#141414] text-white h-full max-h-[100dvh] shadow-2xl flex flex-col border-l border-stone-800 z-10 animate-slideInRight overflow-hidden">
            
            {/* Drawer Top Header (Fixed at top) */}
            <div className="shrink-0 p-4 border-b border-stone-800 flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]">
                  <img src={brandLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-sm text-white">
                    {storeSettings?.storeName || 'Mujer Latina'}
                  </h3>
                  <p className="text-[10px] text-[#d4af37]">Menú Principal</p>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition cursor-pointer"
                title="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable middle section for links & profile */}
            <div 
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              {/* User summary card in drawer */}
              <div className="p-4 border-b border-stone-800 bg-stone-950/60">
                {currentUser ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37] bg-stone-900 flex items-center justify-center flex-shrink-0">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-[#d4af37]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.2 bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-bold rounded-full">
                        {currentUser.role === 'admin' ? 'Super Administradora' : 'Cliente Registrada'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-300 text-xs">
                      <Sparkles size={14} className="text-[#d4af37]" />
                      <span>Bienvenida a Mujer Latina</span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileDrawerOpen(false);
                        openLoginModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <LogIn size={14} />
                      <span>Iniciar sesión / Registro</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation links in drawer */}
              <nav className="p-3 space-y-1">
                <button
                  onClick={() => navigateAndClose('home')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'home'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home size={16} />
                    <span>Inicio</span>
                  </div>
                  <ChevronRight size={14} className="opacity-60" />
                </button>

                <button
                  onClick={() => navigateAndClose('catalog')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'catalog' || activeView === 'product_detail'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={16} />
                    <span>Catálogo de Productos</span>
                  </div>
                  <ChevronRight size={14} className="opacity-60" />
                </button>

                <button
                  onClick={() => navigateAndClose('wishlist')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'wishlist'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart size={16} className={wishlistProducts.length > 0 ? 'text-[#d4af37] fill-[#d4af37]' : ''} />
                    <span>Mis Favoritos</span>
                  </div>
                  {wishlistProducts.length > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#d4af37] text-black text-[10px] font-bold">
                      {wishlistProducts.length}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="opacity-60" />
                  )}
                </button>

                <button
                  onClick={() => navigateAndClose('cart')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'cart'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={16} className={cartTotalCount > 0 ? 'text-emerald-400' : ''} />
                    <span>Carrito de Compras</span>
                  </div>
                  {cartTotalCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-bold">
                      {cartTotalCount}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="opacity-60" />
                  )}
                </button>

                <button
                  onClick={() => navigateAndClose('about')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'about'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-300 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Info size={16} />
                    <span>Nosotros & Showroom</span>
                  </div>
                  <ChevronRight size={14} className="opacity-60" />
                </button>

                {/* Extra Docs Link */}
                <button
                  onClick={() => navigateAndClose('docs')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    activeView === 'docs'
                      ? 'bg-[#d4af37] text-black font-bold shadow-xs'
                      : 'text-stone-400 hover:bg-stone-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} />
                    <span>Documentación Técnica</span>
                  </div>
                  <ChevronRight size={14} className="opacity-60" />
                </button>
              </nav>

              {/* Admin Panel Direct Link for admin users */}
              {currentUser?.role === 'admin' && (
                <div className="p-3 border-t border-stone-800">
                  <button
                    onClick={() => navigateAndClose('admin_dashboard')}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold hover:bg-[#d4af37]/25 transition cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={16} />
                      <span>Panel Administrador</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Bottom Session Actions (Fixed at bottom) */}
            <div className="shrink-0 p-4 border-t border-stone-800 space-y-2 bg-stone-950">
              {currentUser ? (
                <>
                  <button
                    onClick={() => {
                      setIsProfileEditing(false);
                      navigateAndClose('profile');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 text-xs font-medium flex items-center justify-center gap-2 border border-stone-700 transition cursor-pointer"
                  >
                    <User size={14} className="text-[#d4af37]" />
                    <span>Ver Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 border border-rose-900/40 transition cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    openLoginModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#d4af37] text-black text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                >
                  <LogIn size={15} />
                  <span>Iniciar sesión</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

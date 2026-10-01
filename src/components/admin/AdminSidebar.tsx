import React, { useState, useEffect, useRef } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { 
  LayoutDashboard, 
  Boxes, 
  ClipboardList, 
  Users, 
  BookOpen, 
  ExternalLink, 
  Database, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  X, 
  Menu, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { getSupabaseStatus } from '../../services/supabaseClient';

interface AdminSidebarProps {
  controller: StoreController;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ controller }) => {
  const { activeView, setActiveView, inventoryAudit, orders, currentUser, logout } = controller;
  const supabaseStatus = getSupabaseStatus();

  // Mobile drawer state for Admin Sidebar
  const [mobileAdminDrawerOpen, setMobileAdminDrawerOpen] = useState(false);
  const quickNavRef = useRef<HTMLDivElement>(null);

  const scrollQuickNav = (direction: 'left' | 'right') => {
    if (quickNavRef.current) {
      const scrollAmount = direction === 'left' ? -160 : 160;
      quickNavRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (quickNavRef.current) {
      const activeEl = quickNavRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeView]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileAdminDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling and rubber-banding when mobile admin drawer is open
  useEffect(() => {
    if (mobileAdminDrawerOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [mobileAdminDrawerOpen]);

  const brandLogoUrl =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBdNwwVQtlCdmCLIffs_4B-7mTe5vBcdO7JVBvf_dbsl4nAtNz1aHLVy21EcMr_VSAk0HKqaGAiXfgw7u67mUujsb8SqrunVsrB_Hz6AM4lJP09IDIlhLSNPY6OuIde7HwczlB6sk7_aIG5AyeIScVfB9f25RtvJqNrBxKELLtyab_gFMph46y-9FKnheMPlvRIvtHG5hOtjlrf3STQRcImBPjT5-UByzDqnTu4sxBAb1UpylVUboXdiHvasV00KeIsGA';

  // Pending orders count
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const isCurrent = (view: string) => activeView === view;

  const navigateAdmin = (view: any) => {
    setActiveView(view);
    setMobileAdminDrawerOpen(false);
  };

  const navItems = (
    <nav className="p-4 space-y-1.5 text-xs sm:text-sm font-medium">
      <button
        onClick={() => navigateAdmin('admin_dashboard')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
          isCurrent('admin_dashboard')
            ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
            : 'text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className={isCurrent('admin_dashboard') ? 'text-stone-950' : 'text-[#d4af37]'} />
          <span>Dashboard</span>
        </div>
        <ChevronRight size={14} className="opacity-50" />
      </button>

      <button
        onClick={() => navigateAdmin('admin_inventory')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
          isCurrent('admin_inventory')
            ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
            : 'text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <Boxes size={18} className={isCurrent('admin_inventory') ? 'text-stone-950' : 'text-[#d4af37]'} />
          <span>Inventario</span>
        </div>
        {inventoryAudit.criticalItems.length > 0 && (
          <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[10px] font-extrabold rounded-full">
            {inventoryAudit.criticalItems.length}
          </span>
        )}
      </button>

      <button
        onClick={() => navigateAdmin('admin_orders')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
          isCurrent('admin_orders')
            ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/20'
            : 'text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <ClipboardList size={18} className={isCurrent('admin_orders') ? 'text-stone-950' : 'text-[#d4af37]'} />
          <span>Pedidos</span>
        </div>
        {pendingOrdersCount > 0 && (
          <span className="px-2 py-0.5 bg-[#25D366] text-stone-950 text-[10px] font-extrabold rounded-full">
            {pendingOrdersCount} WA
          </span>
        )}
      </button>

      <button
        onClick={() => navigateAdmin('admin_customers')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
          isCurrent('admin_customers')
            ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/25 ring-1 ring-[#d4af37]'
            : 'text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <Users size={18} className={isCurrent('admin_customers') ? 'text-stone-950' : 'text-[#d4af37]'} />
          <span>Clientes</span>
        </div>
        {controller.customers && controller.customers.length > 0 && (
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
            isCurrent('admin_customers') ? 'bg-stone-950 text-white' : 'bg-stone-800 text-stone-200'
          }`}>
            {controller.customers.length}
          </span>
        )}
      </button>

      <button
        onClick={() => navigateAdmin('admin_settings')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
          isCurrent('admin_settings')
            ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md shadow-[#d4af37]/25 ring-1 ring-[#d4af37]'
            : 'text-stone-300 hover:text-white hover:bg-stone-900'
        }`}
        id="admin-sidebar-nav-settings"
      >
        <div className="flex items-center gap-3">
          <Settings size={18} className={isCurrent('admin_settings') ? 'text-stone-950' : 'text-[#d4af37]'} />
          <span>Configuración</span>
        </div>
        <ChevronRight size={14} className="opacity-50" />
      </button>

      <div className="pt-3 border-t border-stone-800 my-2">
        <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
          Auditoría & Sistema
        </span>

        <button
          onClick={() => navigateAdmin('docs')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition cursor-pointer ${
            isCurrent('docs')
              ? 'bg-[#d4af37] text-stone-950 font-bold shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-stone-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen size={18} className={isCurrent('docs') ? 'text-stone-950' : 'text-[#d4af37]'} />
            <span>Documentación (PRD/TRD)</span>
          </div>
          <ChevronRight size={14} className="opacity-50" />
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* 1. Mobile Top Bar for Admin Mode (Sticky header on small screens with persistent panel options) */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#000000] text-white border-b border-stone-800 shadow-md">
        {/* Main Header Row */}
        <div className="px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileAdminDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-200 hover:text-white cursor-pointer"
              aria-label="Abrir menú completo de administración"
              title="Abrir menú"
            >
              <Menu size={18} />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#d4af37]">
                <img src={brandLogoUrl} alt="Mujer Latina" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-serif-title font-bold text-xs text-white">Panel Admin</p>
                <p className="text-[9px] text-[#d4af37] leading-tight">
                  {activeView === 'admin_dashboard' && 'Dashboard'}
                  {activeView === 'admin_inventory' && 'Inventario'}
                  {activeView === 'admin_orders' && 'Pedidos'}
                  {activeView === 'admin_customers' && 'Clientes'}
                  {activeView === 'admin_settings' && 'Configuración'}
                  {activeView === 'docs' && 'Documentación'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => setActiveView('admin_orders')}
                className="px-2 py-0.5 rounded-full bg-[#25D366] text-black text-[9px] font-bold"
              >
                {pendingOrdersCount} WA
              </button>
            )}

            <button
              onClick={() => setActiveView('home')}
              className="px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-[11px] font-medium flex items-center gap-1 hover:text-white cursor-pointer"
            >
              <ExternalLink size={11} className="text-[#d4af37]" />
              <span>Tienda</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Quick Navigation Row (Easy smooth swipe & arrow scroll) */}
        <div className="relative bg-[#0a0a0a] border-t border-stone-800/90 flex items-center">
          {/* Scroll Left chevron */}
          <button
            type="button"
            onClick={() => scrollQuickNav('left')}
            className="p-2 text-stone-400 hover:text-white bg-black/80 shrink-0 border-r border-stone-800/80 active:scale-90 transition cursor-pointer"
            aria-label="Desplazar menú a la izquierda"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Scrollable pills container */}
          <div
            ref={quickNavRef}
            className="flex-1 flex items-center gap-1.5 px-2 py-2 overflow-x-auto scroll-smooth overscroll-x-contain scrollbar-none text-[11px]"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
          >
            <button
              onClick={() => setActiveView('admin_dashboard')}
              data-active={activeView === 'admin_dashboard'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'admin_dashboard'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <LayoutDashboard size={13} className={activeView === 'admin_dashboard' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('admin_inventory')}
              data-active={activeView === 'admin_inventory'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'admin_inventory'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Boxes size={13} className={activeView === 'admin_inventory' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Inventario</span>
              {inventoryAudit.criticalItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                  activeView === 'admin_inventory' ? 'bg-stone-950 text-white' : 'bg-amber-500 text-stone-950'
                }`}>
                  {inventoryAudit.criticalItems.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin_orders')}
              data-active={activeView === 'admin_orders'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'admin_orders'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <ClipboardList size={13} className={activeView === 'admin_orders' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Pedidos</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#25D366] text-stone-950 text-[9px] font-extrabold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('admin_customers')}
              data-active={activeView === 'admin_customers'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'admin_customers'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Users size={13} className={activeView === 'admin_customers' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Clientes</span>
            </button>

            <button
              onClick={() => setActiveView('admin_settings')}
              data-active={activeView === 'admin_settings'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'admin_settings'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Settings size={13} className={activeView === 'admin_settings' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Configuración</span>
            </button>

            <button
              onClick={() => setActiveView('docs')}
              data-active={activeView === 'docs'}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer font-medium active:scale-95 ${
                activeView === 'docs'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-xs'
                  : 'text-stone-300 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <BookOpen size={13} className={activeView === 'docs' ? 'text-stone-950' : 'text-[#d4af37]'} />
              <span>Docs</span>
            </button>
          </div>

          {/* Scroll Right chevron */}
          <button
            type="button"
            onClick={() => scrollQuickNav('right')}
            className="p-2 text-stone-400 hover:text-white bg-black/80 shrink-0 border-l border-stone-800/80 active:scale-90 transition cursor-pointer"
            aria-label="Desplazar menú a la derecha"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 2. Desktop Sidebar (Always sticky and visible on lg screens while scrolling) */}
      <aside className="hidden lg:flex w-64 bg-[#000000] text-white border-r border-stone-800 flex-col justify-between flex-shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar shadow-md z-40">
        
        {/* Top Header & Brand */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-sm flex-shrink-0">
                <img
                  src={brandLogoUrl}
                  alt="Mujer Latina"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="font-serif-title font-bold text-sm tracking-wider text-white">
                  Mujer Latina
                </h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] block font-semibold">
                  Suite Admin v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Admin Profile Info */}
          <div 
            onClick={() => setActiveView('admin_settings')}
            className="p-3.5 mx-4 my-4 bg-stone-900 hover:bg-stone-850 rounded-2xl border border-stone-800 flex items-center gap-3 cursor-pointer transition group"
            title="Ir a Configuración de Cuenta"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37] bg-stone-900 flex items-center justify-center shadow-xs flex-shrink-0">
              <img
                src={currentUser?.avatarUrl || brandLogoUrl}
                alt={currentUser?.fullName || 'Administradora'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-[#d4af37] transition">
                {currentUser?.fullName || 'Administradora'}
              </p>
              <p className="text-[10px] text-[#d4af37] truncate font-semibold">
                Super Administradora
              </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 flex-shrink-0" title="Sesión activa" />
          </div>

          {/* Database Status indicator */}
          <div className="px-5 py-2.5 flex items-center justify-between text-[11px] text-stone-400 border-y border-stone-800/80 bg-stone-950/80">
            <div className="flex items-center gap-1.5">
              <Database size={13} className="text-[#d4af37]" />
              <span className="font-medium text-stone-200">PostgreSQL</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              {supabaseStatus.isConfigured ? 'Cloud Sync' : 'Local Relational'}
            </span>
          </div>

          {/* Navigation Menu */}
          {navItems}
        </div>

        {/* Footer Exit to Storefront & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <button
            onClick={() => setActiveView('home')}
            className="w-full py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-stone-800 cursor-pointer"
          >
            <ExternalLink size={14} className="text-[#d4af37]" />
            <span>Ver Tienda Pública</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium transition flex items-center justify-center gap-2 border border-rose-900/50 cursor-pointer"
            id="admin-sidebar-logout-btn"
          >
            <LogOut size={13} />
            <span>Cerrar Sesión</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 pt-1">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>RLS & Anti-Hack Shield Activo</span>
          </div>
        </div>

      </aside>

      {/* 3. Mobile Drawer for Admin (Slides in from the LEFT on mobile) */}
      {mobileAdminDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileAdminDrawerOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
          />

          {/* Sidebar Drawer container */}
          <div className="relative w-72 max-w-[85vw] bg-[#000000] text-white h-full max-h-[100dvh] shadow-2xl flex flex-col border-r border-stone-800 z-10 animate-fadeIn overflow-hidden">
            
            {/* Header (Fixed at top) */}
            <div className="shrink-0 p-4 border-b border-stone-800 flex items-center justify-between bg-[#000000]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]">
                  <img src={brandLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-sm text-white">
                    Mujer Latina
                  </h3>
                  <p className="text-[10px] text-[#d4af37]">Suite Admin</p>
                </div>
              </div>

              <button
                onClick={() => setMobileAdminDrawerOpen(false)}
                className="p-1.5 rounded-full bg-stone-900 text-stone-300 hover:text-white cursor-pointer"
                title="Cerrar panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable middle body for menu items */}
            <div 
              className="flex-1 overflow-y-auto overscroll-contain touch-pan-y custom-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              {/* Profile in mobile drawer */}
              <div className="p-3 mx-3 my-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4af37] bg-stone-800 flex items-center justify-center flex-shrink-0">
                  <img
                    src={currentUser?.avatarUrl || brandLogoUrl}
                    alt={currentUser?.fullName || 'Admin'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser?.fullName || 'Administradora'}
                  </p>
                  <p className="text-[10px] text-[#d4af37]">Super Admin</p>
                </div>
              </div>

              {/* Nav Items */}
              {navItems}
            </div>

            {/* Bottom Actions (Fixed at bottom) */}
            <div className="shrink-0 p-3 border-t border-stone-800 space-y-2 bg-[#050505]">
              <button
                onClick={() => navigateAdmin('home')}
                className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-stone-800 cursor-pointer"
              >
                <ExternalLink size={13} className="text-[#d4af37]" />
                <span>Ir a Tienda Pública</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileAdminDrawerOpen(false);
                }}
                className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border border-rose-900/50 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

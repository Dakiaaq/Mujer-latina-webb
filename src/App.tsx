/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useStoreController } from './controllers/useStoreController';
import { TopNavBar } from './components/TopNavBar';
import { HeroSection } from './components/HeroSection';
import { FeaturedCategories } from './components/FeaturedCategories';
import { FeaturedProductsBento } from './components/FeaturedProductsBento';
import { OurStorySection } from './components/OurStorySection';
import { CatalogView } from './components/CatalogView';
import { ProductDetailView } from './components/ProductDetailView';
import { CartView } from './components/CartView';
import { WishlistView } from './components/WishlistView';
import { AboutView } from './components/AboutView';
import { AuthProfileView } from './components/AuthProfileView';
import { DocsView } from './components/DocsView';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { CustomerSupportChatbot } from './components/CustomerSupportChatbot';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Admin Suite Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminInventoryView } from './components/admin/AdminInventoryView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminCustomersView } from './components/admin/AdminCustomersView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';

export default function App() {
  const controller = useStoreController();
  const { activeView, currentUser, setActiveView, openLoginModal } = controller;

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  // Is Admin View active?
  const isAdminView = activeView.startsWith('admin_');

  // RBAC Guard: Protect Admin Suite
  if (isAdminView) {
    if (!currentUser || currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-stone-900 font-sans">
          <TopNavBar controller={controller} />
          
          <main className="flex-1 flex items-center justify-center p-6 my-8">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-stone-900">
                  Acceso no autorizado
                </h2>
                <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Esta sección está reservada exclusivamente para cuentas con rol de administrador. Debes iniciar sesión con las credenciales correspondientes.
                </p>
              </div>
              <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  onClick={() => setActiveView('home')}
                  className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Volver al Inicio</span>
                </button>
                <button
                  onClick={openLoginModal}
                  className="px-5 py-2.5 rounded-full bg-[#d4af37] hover:bg-[#c29e2f] text-black text-xs font-bold transition shadow-sm"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </main>

          <Footer controller={controller} />
          <CustomerSupportChatbot controller={controller} />
          <LoginModal controller={controller} />
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-stone-100 text-stone-900 font-sans">
        {/* Admin Sidebar */}
        <AdminSidebar controller={controller} />

        {/* Admin Content Area */}
        <main className={`flex-1 overflow-x-hidden min-h-screen ${activeView === 'admin_orders' || activeView === 'admin_customers' ? 'bg-white' : 'bg-[#fcfcfc]'}`}>
          {activeView === 'admin_dashboard' && <AdminDashboardView controller={controller} />}
          {activeView === 'admin_inventory' && <AdminInventoryView controller={controller} />}
          {activeView === 'admin_orders' && <AdminOrdersView controller={controller} />}
          {activeView === 'admin_customers' && <AdminCustomersView controller={controller} />}
          {activeView === 'admin_settings' && <AdminSettingsView controller={controller} />}
        </main>

        {/* Login Modal */}
        <LoginModal controller={controller} />
      </div>
    );
  }

  // Public Storefront View
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfc] text-stone-900 font-sans">
      {/* Top Navigation */}
      <TopNavBar controller={controller} />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <>
            <HeroSection controller={controller} />
            <FeaturedCategories controller={controller} />
            <FeaturedProductsBento controller={controller} />
            <OurStorySection controller={controller} />
          </>
        )}

        {activeView === 'catalog' && <CatalogView controller={controller} />}
        {activeView === 'product_detail' && <ProductDetailView controller={controller} />}
        {activeView === 'cart' && <CartView controller={controller} />}
        {activeView === 'wishlist' && <WishlistView controller={controller} />}
        {activeView === 'about' && <AboutView controller={controller} />}
        {activeView === 'profile' && <AuthProfileView controller={controller} />}
        {activeView === 'docs' && <DocsView />}
      </main>

      {/* Footer */}
      <Footer controller={controller} />

      {/* Customer Support Chatbot (Non-obtrusive helper on public views) */}
      <CustomerSupportChatbot controller={controller} />

      {/* Reusable Login Modal */}
      <LoginModal controller={controller} />
    </div>
  );
}


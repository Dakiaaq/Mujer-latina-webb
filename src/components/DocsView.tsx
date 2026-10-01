import React, { useState } from 'react';
import { BookOpen, ShieldCheck, FileText, Code2, Database, Layers, CheckCircle2 } from 'lucide-react';

export const DocsView: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<'prd' | 'trd' | 'plan' | 'flow' | 'un'>('prd');

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37] text-[#b58d24] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen size={13} />
            <span>Documentación Oficial del Sistema</span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-stone-900">
            Especificaciones, Arquitectura & Seguridad
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Revisa los requerimientos funcionales, diagrama MVC, recursividad, políticas RLS de Supabase y roadmap.
          </p>
        </div>

        {/* Tab Navigator */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-stone-200 shadow-sm text-xs font-semibold">
          <button
            onClick={() => setSelectedDoc('prd')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              selectedDoc === 'prd'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText size={15} />
            <span>1. PRD (Product Reqs)</span>
          </button>

          <button
            onClick={() => setSelectedDoc('trd')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              selectedDoc === 'trd'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Code2 size={15} />
            <span>2. TRD (Tech & MVC)</span>
          </button>

          <button
            onClick={() => setSelectedDoc('un')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              selectedDoc === 'un'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck size={15} className="text-[#d4af37]" />
            <span>3. un.md (Seguridad RLS)</span>
          </button>

          <button
            onClick={() => setSelectedDoc('flow')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              selectedDoc === 'flow'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers size={15} />
            <span>4. User Flow</span>
          </button>

          <button
            onClick={() => setSelectedDoc('plan')}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 ${
              selectedDoc === 'plan'
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Database size={15} />
            <span>5. PLAN (Roadmap)</span>
          </button>
        </div>

        {/* Content Viewer Card */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm text-stone-800 space-y-6 text-sm sm:text-base leading-relaxed">
          
          {selectedDoc === 'prd' && (
            <div className="space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                PRD - Product Requirements Document: Mujer Latina E-Commerce
              </h2>
              <p><strong>Visión del Producto:</strong> Plataforma de comercio electrónico de alta gama diseñada con paleta Black & Gold Prestige para empoderar a la mujer latina con cosméticos, esmaltes, tratamientos y accesorios de formulación exclusiva.</p>
              
              <h3 className="font-serif-title text-lg font-bold text-stone-900 pt-2">Módulos Core Implementados:</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-700 text-sm">
                <li><strong>Home & Bento Grid:</strong> Hero editorial cinematográfico, categorías circulares interactivas y grid bento con productos estrella.</li>
                <li><strong>Catálogo Reactivo:</strong> Filtrado facetado por categoría, rango de precios ($10 - $300), disponibilidad en stock y calificación mínima.</li>
                <li><strong>Detalle de Producto:</strong> Galería multi-ángulo con miniaturas interactivas, pestañas de especificaciones y sistema de reseñas con formulario en tiempo real.</li>
                <li><strong>Carrito y Checkout WhatsApp:</strong> Cálculo recursivo de totales, validación de datos de despacho y generación de enlace directo hacia WhatsApp Business pre-redactado.</li>
                <li><strong>Suite Administrativa:</strong> Dashboard con KPIs, motor de auditoría de inventario por Loop Engine y gestión de pedidos de 3 estados (Pendiente, Pagado, Enviado).</li>
              </ul>
            </div>
          )}

          {selectedDoc === 'trd' && (
            <div className="space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                TRD - Technical Requirements Document & Patrón MVC
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm">MODEL (Modelo)</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Definido en <code>/src/types/index.ts</code> y tablas relacionales de PostgreSQL Supabase (products, categories, orders, customers, reviews).
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm">VIEW (Vista)</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    Componentes React funcionales con Tailwind CSS 4, diseño Black & Gold Prestige y tipografía Playfair Display + Manrope.
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-sm">CONTROLLER (Controlador)</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    <code>useStoreController</code> orquesta el estado reactivo, la recursividad y la persistencia sincronizada.
                  </p>
                </div>
              </div>

              <h3 className="font-serif-title text-lg font-bold text-stone-900 pt-2">Algoritmos Recursivos Implementados:</h3>
              <div className="p-4 bg-stone-900 text-[#d4af37] rounded-2xl font-mono text-xs overflow-x-auto">
                <pre>{`// Algoritmo de Auditoría Recursiva (Loop Engine)
export function auditInventoryRecursively(
  products: Product[],
  index = 0,
  accum: InventoryAuditResult = initialAudit
): InventoryAuditResult {
  if (index >= products.length) {
    accum.healthIndexPercentage = Math.round((accum.healthyItemsCount / products.length) * 100);
    return accum;
  }
  const item = products[index];
  if (item.stock <= 0) accum.outOfStockItems.push(item);
  else if (item.stock <= (item.stockThreshold || 5)) accum.criticalItems.push(item);
  else accum.healthyItemsCount++;
  
  accum.totalValuation += item.price * item.stock;
  return auditInventoryRecursively(products, index + 1, accum);
}`}</pre>
              </div>
            </div>
          )}

          {selectedDoc === 'un' && (
            <div className="space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
                <span>un.md - Arquitectura de Seguridad & Supabase RLS</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Blindaje Anti-Hack Activo
                </span>
              </h2>

              <p>
                Para garantizar que la aplicación no pueda ser vulnerada ni hackeada, implementamos las políticas estrictas de <strong>Row Level Security (RLS)</strong> y sanitización de entrada:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>1. Políticas Row Level Security (RLS) en Supabase PostgreSQL</span>
                  </div>
                  <ul className="text-xs text-emerald-800 list-disc pl-5 space-y-1">
                    <li><code>products</code>: Lectura pública (SELECT) permitida; Creación/Edición/Borrado (INSERT, UPDATE, DELETE) restringida exclusivamente al rol <code>admin</code>.</li>
                    <li><code>orders</code>: Los clientes solo pueden leer sus propios pedidos basándose en su <code>auth.uid() = customer_id</code>. Los administradores tienen acceso global para despacho.</li>
                    <li><code>customers</code>: Acceso privado; ningún cliente puede ver los datos de contacto de otro.</li>
                  </ul>
                </div>

                <div className="p-4 bg-stone-900 text-stone-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto">
                  <p className="text-[#d4af37] font-bold mb-1">// Script SQL de Políticas RLS:</p>
                  <pre>{`ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin Write Products" ON products FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers Read Own Orders" ON orders FOR SELECT 
  USING (auth.uid() = customer_id);
CREATE POLICY "Admin Manage Orders" ON orders FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');`}</pre>
                </div>
              </div>
            </div>
          )}

          {selectedDoc === 'flow' && (
            <div className="space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                User Flow & Navegación de la Aplicación
              </h2>
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs sm:text-sm font-mono space-y-2">
                <p>1. [Cliente] Landing Home &rarr; Visualización Hero Editorial &rarr; Bento Grid</p>
                <p>2. [Cliente] Clic en Categoría &rarr; Catálogo Filtrado &rarr; Búsqueda reactiva por precio/calificación</p>
                <p>3. [Cliente] Clic en Tarjeta &rarr; Detalle de Producto &rarr; Miniaturas &rarr; Añadir al Carrito</p>
                <p>4. [Cliente] Carrito de Compras &rarr; Ingreso de Datos de Despacho &rarr; Clic en "Procesar Pedido por WhatsApp"</p>
                <p>5. [WhatsApp] Generación de Orden #ORD-XXXXX &rarr; Deducción reactiva de inventario &rarr; Envío de mensaje</p>
                <p>6. [Admin] Ingreso a Suite Admin &rarr; Dashboard &rarr; Alerta Loop Engine &rarr; Reabastecer o Marcar Pedido Enviado</p>
              </div>
            </div>
          )}

          {selectedDoc === 'plan' && (
            <div className="space-y-4">
              <h2 className="font-serif-title text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3">
                PLAN - Roadmap de Desarrollo y Entregas
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Fase 1: Infraestructura & Tipos:</strong> Modelos TypeScript, configuración Supabase y suite documental completa.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Fase 2: Arquitectura MVC & Recursividad:</strong> Controlador central <code>useStoreController</code>, algoritmos recursivos de auditoría de stock y cálculo de subtotal.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Fase 3: Storefront de Prestigio:</strong> Hero editorial, Bento Grid, Catálogo reactivo, Detalle de producto con galería y Carrito con integración a WhatsApp.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Fase 4: Suite Administrativa & RLS:</strong> Dashboard operativo, alertas del Loop Engine, tabla de inventario y pedidos con roles de usuario.
                  </div>
                </li>
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

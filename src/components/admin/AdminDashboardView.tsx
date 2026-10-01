import React from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles,
  Database
} from 'lucide-react';

interface AdminDashboardViewProps {
  controller: StoreController;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ controller }) => {
  const { inventoryAudit, orders, restockProduct, setActiveView } = controller;

  // Compute total sales from orders
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.total, 0);

  // Weekly sales mock bars (Lunes a Domingo)
  const weeklySalesData = [
    { day: 'Lun', amount: 2400, percent: 65 },
    { day: 'Mar', amount: 3100, percent: 80 },
    { day: 'Mié', amount: 2900, percent: 72 },
    { day: 'Jue', amount: 3800, percent: 92 },
    { day: 'Vie', amount: 4500, percent: 100 },
    { day: 'Sáb', amount: 4100, percent: 88 },
    { day: 'Dom', amount: 3200, percent: 75 },
  ];

  return (
    <div className="p-3.5 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 bg-stone-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif-title text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900">
              Dashboard Operativo
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              PostgreSQL Online
            </span>
          </div>
          <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
            Supervisión transaccional, pedidos de WhatsApp y motor de auditoría de inventario en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveView('admin_orders')}
            className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Ver Pedidos ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* KPI 1: Ventas Totales */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ventas Totales
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#b58d24] flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-title">
              ${totalOrdersAmount.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp size={13} className="mr-0.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Calculado sobre pedidos confirmados</p>
        </div>

        {/* KPI 2: Pedidos Activos */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pedidos en Sistema
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-title">
              {orders.length}
            </span>
            <span className="text-xs text-blue-600 font-bold">
              {orders.filter((o) => o.status === 'pending').length} pendientes
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Origen WhatsApp y web checkout</p>
        </div>

        {/* KPI 3: Stock Crítico (Loop Engine) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Stock Crítico (≤ 5)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-title">
              {inventoryAudit.criticalItems.length}
            </span>
            <span className="text-xs text-rose-600 font-bold">
              {inventoryAudit.outOfStockItems.length} agotados
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Auditado recursivamente</p>
        </div>

        {/* KPI 4: Índice de Salud de Inventario */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Salud de Inventario
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-title">
              {inventoryAudit.healthIndexPercentage}%
            </span>
            <span className="text-xs text-emerald-600 font-bold">
              {inventoryAudit.healthyItemsCount} óptimos
            </span>
          </div>
          <p className="text-[11px] text-stone-400">Valuación: ${inventoryAudit.totalValuation.toLocaleString()}</p>
        </div>

      </div>

      {/* Grid: Weekly Performance & Recursive Loop Engine Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Chart Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Rendimiento de Ventas Semanales
              </h3>
              <p className="text-xs text-stone-500">
                Comportamiento diario de transacciones y conversiones vía WhatsApp.
              </p>
            </div>
            <span className="text-xs font-bold text-[#b58d24] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Semana Actual
            </span>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
            {weeklySalesData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] sm:text-xs font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition">
                  ${d.amount}
                </span>
                <div className="w-full bg-stone-100 rounded-xl overflow-hidden h-40 flex items-end">
                  <div
                    style={{ height: `${d.percent}%` }}
                    className="w-full bg-gradient-to-t from-stone-900 to-[#d4af37] rounded-t-xl group-hover:brightness-110 transition duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-stone-600">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Día con mayor volumen: <strong>Viernes ($4,500)</strong></span>
            <span>Promedio diario: <strong>$3,428</strong></span>
          </div>
        </div>

        {/* Recursive Loop Engine Stock Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-serif-title text-lg font-bold text-stone-900">
                Alertas Loop Engine
              </h3>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Recursivo
            </span>
          </div>

          <p className="text-xs text-stone-500">
            Algoritmo recursivo de supervisión de umbrales críticos ($\le 5$ unidades):
          </p>

          {/* List of critical items */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {inventoryAudit.criticalItems.length === 0 && inventoryAudit.outOfStockItems.length === 0 ? (
              <div className="py-8 text-center text-stone-400 text-xs">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1" />
                <span>Todo el inventario está en niveles óptimos.</span>
              </div>
            ) : (
              <>
                {inventoryAudit.outOfStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-rose-900 truncate">{prod.name}</p>
                      <p className="text-[10px] text-rose-700 font-mono">SKU: {prod.sku} • AGOTADO (0 un.)</p>
                    </div>
                    <button
                      onClick={() => restockProduct(prod.id, 20)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm whitespace-nowrap"
                    >
                      <RotateCw size={12} />
                      <span>+20 un.</span>
                    </button>
                  </div>
                ))}

                {inventoryAudit.criticalItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-amber-900 truncate">{prod.name}</p>
                      <p className="text-[10px] text-amber-700 font-mono">
                        SKU: {prod.sku} • Quedan {prod.stock} un. (Umbral: {prod.stockThreshold})
                      </p>
                    </div>
                    <button
                      onClick={() => restockProduct(prod.id, 15)}
                      className="px-3 py-1 bg-[#d4af37] hover:bg-[#c29e2f] text-black rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm whitespace-nowrap"
                    >
                      <RotateCw size={12} />
                      <span>+15 un.</span>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={() => setActiveView('admin_inventory')}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition text-center"
            >
              Ir a Tabla de Inventario Completa →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

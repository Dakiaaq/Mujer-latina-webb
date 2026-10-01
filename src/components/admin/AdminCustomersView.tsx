import React, { useState, useEffect, useMemo } from 'react';
import { StoreController } from '../../controllers/useStoreController';
import { Customer } from '../../types';
import { 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Download, 
  Eye, 
  Pencil, 
  X, 
  Send, 
  Check, 
  CheckCircle2, 
  MapPin, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  User,
  DollarSign,
  Sparkles,
  Award,
  Gift,
  AlertCircle,
  Clock
} from 'lucide-react';

interface AdminCustomersViewProps {
  controller: StoreController;
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({ controller }) => {
  const { customers, addCustomer, updateCustomer, orders } = controller;

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [orderCountFilter, setOrderCountFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'orders-desc' | 'spent-desc' | 'name-asc'>('default');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // 3 per page matching "Mostrando 1-3 de 156 clientes"

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Lock body scroll cleanly when a customer modal is open
  useEffect(() => {
    if (showNewModal || editingCustomer || viewingCustomer) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [showNewModal, editingCustomer, viewingCustomer]);

  // Form states for New / Edit Customer
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOrders, setFormOrders] = useState('0');

  // Trigger Toast
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: Un pedido califica para crédito de descuento ÚNICAMENTE si:
  // 1. Ha sido pagado (receiptVerified === true o status 'paid'/'shipped'/'delivered')
  // 2. Y ha sido despachado/enviado (status 'shipped' o 'delivered')
  const isOrderPaidAndShipped = (o: any) => {
    const isShipped = o.status === 'shipped' || o.status === 'delivered';
    const isPaid = o.receiptVerified === true || o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered';
    return isShipped && isPaid && o.status !== 'cancelled';
  };

  // Helper: Extrae las órdenes y cálculos de crédito para un cliente
  const getCustomerOrderStats = (cust: Customer) => {
    const custEmail = cust.email ? cust.email.toLowerCase().trim() : '';
    const custPhone = cust.phone ? cust.phone.replace(/\D/g, '') : '';
    const custName = cust.name ? cust.name.toLowerCase().trim() : '';
    const custId = cust.id;

    const matchingOrders = orders.filter((o) => {
      if (o.userId && o.userId === custId) return true;
      if (o.id_usuario && o.id_usuario === custId) return true;
      if (custEmail && o.email && o.email.toLowerCase().trim() === custEmail) return true;
      if (custPhone && o.phone && o.phone.replace(/\D/g, '') === custPhone) return true;
      if (custName && o.customer && o.customer.toLowerCase().trim() === custName) return true;
      return false;
    });

    // Órdenes calificadas para acumulación de créditos: SOLO si ha pagado y se le ha enviado
    const qualifyingOrders = matchingOrders.filter(isOrderPaidAndShipped);

    // Órdenes en proceso (pendientes de confirmación de pago o de despacho)
    const inProgressOrders = matchingOrders.filter((o) => !isOrderPaidAndShipped(o) && o.status !== 'cancelled');

    // Conteo calificado estricto
    const qualifyingOrdersCount = qualifyingOrders.length;
    const qualifyingTotalSpent = qualifyingOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Crédito acumulado para futuros descuentos (5% sobre pedidos efectivamente pagados y enviados)
    const accumulatedCredit = Math.round(qualifyingTotalSpent * 0.05);

    return {
      matchingOrders,
      qualifyingOrders,
      inProgressOrders,
      qualifyingOrdersCount,
      qualifyingTotalSpent,
      accumulatedCredit,
    };
  };

  // Available unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers.map((c) => {
      const stats = getCustomerOrderStats(c);
      return {
        ...c,
        qualifyingOrdersCount: stats.qualifyingOrdersCount,
        accumulatedCredit: stats.accumulatedCredit,
        stats,
      };
    }).filter((c) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Department filter
      if (selectedDept !== 'all' && c.department !== selectedDept) {
        return false;
      }

      // Order count filter estricto: basado en pedidos pagados y enviados
      if (orderCountFilter === 'frequent' && c.qualifyingOrdersCount < 3) return false;
      if (orderCountFilter === 'occasional' && (c.qualifyingOrdersCount < 1 || c.qualifyingOrdersCount > 2)) return false;
      if (orderCountFilter === 'new' && c.qualifyingOrdersCount > 0) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'orders-desc') return b.qualifyingOrdersCount - a.qualifyingOrdersCount;
      if (sortBy === 'spent-desc') return b.stats.qualifyingTotalSpent - a.stats.qualifyingTotalSpent;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [customers, orders, search, selectedDept, orderCountFilter, sortBy]);

  // Total pages and Paginated Slice
  const totalItems = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Keep page within bounds
  const validPage = Math.min(currentPage, totalPages);
  if (validPage !== currentPage) {
    setCurrentPage(validPage);
  }

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredCustomers.slice(startIndex, endIndex);

  // Active filters count
  const activeFiltersCount = (selectedDept !== 'all' ? 1 : 0) + (orderCountFilter !== 'all' ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDept('all');
    setOrderCountFilter('all');
    setSortBy('default');
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      notify('No hay clientes para exportar');
      return;
    }

    const headers = ['ID', 'Nombre Completo', 'Correo Electrónico', 'Teléfono', 'Ciudad', 'Departamento', 'Dirección', 'Total Pedidos', 'Total Gastado (COP)', 'Fecha de Registro'];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.city.replace(/"/g, '""')}"`,
      `"${c.department.replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      c.ordersCount,
      c.totalSpent,
      c.createdAt || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_mujer_latina_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notify(`Base de datos exportada con éxito (${filteredCustomers.length} clientes en CSV)`);
  };

  // Open New Customer Modal
  const openNewCustomerModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('+57 300 ');
    setFormCity('Bogotá');
    setFormDept('Cundinamarca');
    setFormAddress('');
    setFormOrders('0');
    setShowNewModal(true);
  };

  // Save New Customer
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPhone.trim()) {
      notify('Por favor complete nombre, correo y teléfono');
      return;
    }

    const ordersCount = parseInt(formOrders, 10) || 0;
    const totalSpent = ordersCount * 125000;

    addCustomer({
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim(),
      city: formCity.trim() || 'Bogotá',
      department: formDept.trim() || 'Cundinamarca',
      address: formAddress.trim() || 'Dirección no registrada',
      ordersCount,
      totalSpent,
    });

    setShowNewModal(false);
    setCurrentPage(1);
    notify(`Cliente "${formName.trim()}" registrado exitosamente`);
  };

  // Open Edit Customer Modal
  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone);
    setFormCity(cust.city);
    setFormDept(cust.department);
    setFormAddress(cust.address || '');
    setFormOrders(cust.ordersCount.toString());
  };

  // Save Edit Customer
  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!formName.trim() || !formEmail.trim()) {
      notify('El nombre y correo son obligatorios');
      return;
    }

    const ordersCount = parseInt(formOrders, 10) || 0;

    updateCustomer(editingCustomer.id, {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim(),
      city: formCity.trim(),
      department: formDept.trim(),
      address: formAddress.trim(),
      ordersCount,
    });

    setEditingCustomer(null);
    notify(`Datos de "${formName.trim()}" actualizados con éxito`);
  };

  // Helper for initial avatar initials
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Pagination navigation buttons calculation
  const getPageNumbers = () => {
    const pages = [];
    // Show up to 3 explicit pages or current window
    const start = Math.max(1, Math.min(validPage - 1, totalPages - 2));
    const end = Math.min(totalPages, start + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="bg-white min-h-screen text-stone-900 p-3.5 sm:p-6 lg:p-10 space-y-5 sm:space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-fadeIn border border-stone-800">
          <CheckCircle2 size={16} className="text-[#d4af37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900">
            Gestión de Clientes
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Administre su base de clientes y analice historiales de compra.
          </p>
        </div>

        {/* Action: + Nuevo Cliente */}
        <button
          onClick={openNewCustomerModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm self-start sm:self-auto cursor-pointer"
          id="btn-new-customer"
        >
          <Plus size={16} />
          <span>+ Nuevo Cliente</span>
        </button>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#d4af37] transition shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action buttons: Filtros & Exportar */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          
          {/* Filtros Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-[#d4af37]/15 border-[#d4af37] text-stone-950 font-semibold'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
              id="btn-filters-customer"
            >
              <SlidersHorizontal size={15} className="text-stone-500" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#d4af37] text-stone-950 font-bold text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filters Dropdown Panel */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-4 z-30 space-y-4 animate-fadeIn text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="font-bold text-stone-900">Filtrar Clientes</span>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="text-[11px] text-[#b58d24] hover:underline font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>

                {/* Filter by Department */}
                <div className="space-y-1">
                  <label className="text-stone-500 font-medium">Departamento</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="all">Todos los departamentos</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Filter by Order volume */}
                <div className="space-y-1">
                  <label className="text-stone-500 font-medium">Frecuencia de compra</label>
                  <select
                    value={orderCountFilter}
                    onChange={(e) => {
                      setOrderCountFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="all">Todos los clientes</option>
                    <option value="frequent">Frecuentes (+3 pedidos)</option>
                    <option value="occasional">Ocasionales (1-2 pedidos)</option>
                    <option value="new">Nuevos (0 pedidos)</option>
                  </select>
                </div>

                {/* Order by */}
                <div className="space-y-1">
                  <label className="text-stone-500 font-medium">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-xs focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="default">Por defecto</option>
                    <option value="orders-desc">Mayor cantidad de pedidos</option>
                    <option value="spent-desc">Mayor valor gastado</option>
                    <option value="name-asc">Nombre (A - Z)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exportar Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer shadow-2xs"
            id="btn-export-customers"
          >
            <Download size={15} className="text-stone-500" />
            <span>Exportar</span>
          </button>

        </div>
      </div>

      {/* Customers Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            
            {/* Table Header */}
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Correo</th>
                <th className="py-4 px-6">Teléfono</th>
                <th className="py-4 px-6">Ciudad/Departamento</th>
                <th className="py-4 px-6">
                  <div className="flex flex-col">
                    <span>Pedidos Calificados</span>
                    <span className="text-[9px] text-stone-400 font-normal lowercase tracking-normal">
                      (pagados y enviados)
                    </span>
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {currentItems.length > 0 ? (
                currentItems.map((cust) => {
                  const initials = getInitials(cust.name);

                  return (
                    <tr key={cust.id} className="hover:bg-stone-50/70 transition">
                      
                      {/* Column 1: Cliente (Avatar + Nombre) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0 flex items-center justify-center">
                            {cust.avatarUrl ? (
                              <img
                                src={cust.avatarUrl}
                                alt={cust.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  // Fallback to initials if image fails
                                  (e.currentTarget as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-stone-600">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900">{cust.name}</p>
                            <span className="text-[11px] text-stone-400">ID: {cust.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Correo */}
                      <td className="py-4 px-6 text-stone-600">
                        <span className="truncate max-w-[200px] block" title={cust.email}>
                          {cust.email}
                        </span>
                      </td>

                      {/* Column 3: Teléfono */}
                      <td className="py-4 px-6 text-stone-700 font-mono text-xs">
                        <span>{cust.phone}</span>
                      </td>

                      {/* Column 4: Ciudad/Departamento */}
                      <td className="py-4 px-6 text-stone-800">
                        <p className="font-medium text-stone-900">{cust.city}</p>
                        <p className="text-[11px] text-stone-400">{cust.department}</p>
                      </td>

                      {/* Column 5: Pedidos Calificados & Crédito Acumulado */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              cust.qualifyingOrdersCount > 0
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                : 'bg-stone-100 text-stone-600 border border-stone-200/80'
                            }`}
                            title="Solo los pedidos pagados y enviados califican para acumular créditos"
                          >
                            <CheckCircle2
                              size={12}
                              className={cust.qualifyingOrdersCount > 0 ? 'text-emerald-600' : 'text-stone-400'}
                            />
                            {cust.qualifyingOrdersCount}{' '}
                            {cust.qualifyingOrdersCount === 1 ? 'pedido calificado' : 'pedidos calificados'}
                          </span>

                          {cust.qualifyingOrdersCount > 0 ? (
                            <div className="flex items-center gap-1 text-[11px] text-[#b58d24] font-medium font-mono">
                              <Sparkles size={11} />
                              <span>Crédito:</span>
                              <span className="font-bold">
                                ${(cust.accumulatedCredit || 0).toLocaleString('es-CO')} COP
                              </span>
                            </div>
                          ) : cust.stats?.inProgressOrders?.length > 0 ? (
                            <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                              <Clock size={10} />
                              <span>
                                {cust.stats.inProgressOrders.length} en proceso (pendiente despacho)
                              </span>
                            </p>
                          ) : (
                            <p className="text-[10px] text-stone-400">
                              Sin crédito acumulado aún
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Acciones (Detalles y Editar) */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          
                          {/* Icon: Ver Detalles */}
                          <button
                            onClick={() => setViewingCustomer(cust)}
                            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                            title="Visualizar detalles del cliente"
                            aria-label="Ver detalles"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Icon: Editar Cliente */}
                          <button
                            onClick={() => openEditModal(cust)}
                            className="p-2 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                            title="Editar cliente"
                            aria-label="Editar cliente"
                          >
                            <Pencil size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <User size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-stone-600">No se encontraron clientes</p>
                    <p className="text-xs text-stone-400 mt-1">Pruebe ajustando el término de búsqueda o limpiando los filtros</p>
                    {(search || activeFiltersCount > 0) && (
                      <button
                        onClick={() => {
                          setSearch('');
                          handleResetFilters();
                        }}
                        className="mt-3 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition"
                      >
                        Restablecer búsqueda
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-stone-200 bg-white">
          
          {/* Showing count (Exact requested format: "Mostrando 1-3 de 156 clientes") */}
          <div className="text-xs sm:text-sm text-stone-500">
            {totalItems > 0 ? (
              <>
                Mostrando <span className="font-semibold text-stone-900">{startIndex + 1}-{endIndex}</span> de{' '}
                <span className="font-semibold text-stone-900">{totalItems}</span> clientes
              </>
            ) : (
              'Mostrando 0 clientes'
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5">
            
            {/* Anterior */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validPage === 1}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                validPage === 1
                  ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>

            {/* Numeric Page Buttons: 1, 2, 3, etc. */}
            {getPageNumbers().map((pageNum) => {
              const isActive = validPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'bg-[#d4af37] text-stone-950 border border-[#d4af37] shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Siguiente */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validPage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1 ${
                validPage === totalPages
                  ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 cursor-pointer'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: NUEVO CLIENTE */}
      {/* ========================================================================= */}
      {showNewModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overscroll-contain"
          onClick={() => setShowNewModal(false)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Registrar Nuevo Cliente</h3>
                <p className="text-xs text-stone-500">Agregue los datos de contacto y ubicación</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Camila Restrepo"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="camila.r@correo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+57 300 123 4567"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Ciudad</label>
                  <input
                    type="text"
                    placeholder="Bogotá, Medellín, etc."
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Departamento</label>
                  <input
                    type="text"
                    placeholder="Cundinamarca, Antioquia..."
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Dirección Residencial</label>
                <input
                  type="text"
                  placeholder="Calle 93 # 12-40 Apto 301"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Pedidos iniciales</label>
                <input
                  type="number"
                  min="0"
                  value={formOrders}
                  onChange={(e) => setFormOrders(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 font-bold rounded-xl transition shadow-sm"
                >
                  Guardar Cliente
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CLIENTE */}
      {/* ========================================================================= */}
      {editingCustomer && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overscroll-contain"
          onClick={() => setEditingCustomer(null)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Editar Cliente</h3>
                <p className="text-xs text-stone-500">Actualizar información de {editingCustomer.name}</p>
              </div>
              <button
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="p-6 space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Ciudad</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Departamento</label>
                  <input
                    type="text"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Dirección</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Total de Pedidos</label>
                <input
                  type="number"
                  min="0"
                  value={formOrders}
                  onChange={(e) => setFormOrders(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 font-bold rounded-xl transition shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VER DETALLES DE CLIENTE */}
      {/* ========================================================================= */}
      {viewingCustomer && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overscroll-contain"
          onClick={() => setViewingCustomer(null)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div 
            className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center">
                  {viewingCustomer.avatarUrl ? (
                    <img
                      src={viewingCustomer.avatarUrl}
                      alt={viewingCustomer.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="font-bold text-stone-700 text-sm">
                      {getInitials(viewingCustomer.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{viewingCustomer.name}</h3>
                  <span className="text-xs text-stone-400">Cliente ID: {viewingCustomer.id}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingCustomer(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            {(() => {
              const viewingStats = getCustomerOrderStats(viewingCustomer);

              return (
                <div className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                  
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                      <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span className="font-medium">Pedidos Calificados</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-950 font-mono">
                        {viewingStats.qualifyingOrdersCount}
                      </p>
                      <span className="text-[10px] text-emerald-700 block mt-0.5 font-medium">
                        Pagados y despachados
                      </span>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
                      <div className="flex items-center gap-1.5 text-amber-900 mb-1">
                        <Sparkles size={14} className="text-[#b58d24]" />
                        <span className="font-medium">Crédito Descuentos</span>
                      </div>
                      <p className="text-xl font-bold text-[#b58d24] font-mono">
                        ${viewingStats.accumulatedCredit.toLocaleString('es-CO')} COP
                      </p>
                      <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">
                        Saldo acumulado
                      </span>
                    </div>
                  </div>

                  {/* Loyalty Explanation Banner */}
                  <div className="p-3.5 bg-stone-50 border border-stone-200/90 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                      <Award size={14} className="text-[#b58d24]" />
                      <span>Condición de acumulación de créditos</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Únicamente los pedidos con <strong>pago confirmado y despachados con guía de transporte</strong> se contabilizan en el contador del cliente y generan crédito para descuentos futuros.
                    </p>
                    {viewingStats.inProgressOrders.length > 0 && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg font-medium">
                        ⏳ Tiene {viewingStats.inProgressOrders.length} pedido(s) en proceso (pendiente de pago o despacho).
                      </p>
                    )}
                  </div>

                  {/* Order History Breakdown */}
                  {viewingStats.matchingOrders.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-stone-900 text-xs">Historial de pedidos:</h4>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {viewingStats.matchingOrders.map((ord) => {
                          const qualified = isOrderPaidAndShipped(ord);
                          return (
                            <div
                              key={ord.id}
                              className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
                                qualified
                                  ? 'bg-emerald-50/40 border-emerald-200/70 text-emerald-950'
                                  : 'bg-stone-50 border-stone-200 text-stone-700'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-1.5 font-semibold">
                                  <span>{ord.id}</span>
                                  <span className="text-[10px] text-stone-400 font-mono">({ord.date})</span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1">
                                  <span>Estado: <strong className="capitalize">{ord.status}</strong></span>
                                  {ord.carrier && <span>· {ord.carrier}</span>}
                                  {ord.tracking && <span>(Guía: {ord.tracking})</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold block">${ord.total.toLocaleString('es-CO')} COP</span>
                                {qualified ? (
                                  <span className="text-[10px] text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                                    <Check size={10} /> +${Math.round(ord.total * 0.05).toLocaleString('es-CO')} crédito
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-700 font-medium">
                                    Pendiente despacho
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contact and Location details */}
              <div className="space-y-2.5 p-4 bg-white rounded-xl border border-stone-200">
                <div className="flex items-center gap-2 text-stone-700">
                  <Mail size={14} className="text-stone-400 flex-shrink-0" />
                  <span className="font-semibold text-stone-900">Correo:</span>
                  <a href={`mailto:${viewingCustomer.email}`} className="text-stone-600 hover:underline">
                    {viewingCustomer.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-stone-700">
                  <Phone size={14} className="text-stone-400 flex-shrink-0" />
                  <span className="font-semibold text-stone-900">Teléfono:</span>
                  <span className="font-mono">{viewingCustomer.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin size={14} className="text-[#b58d24] flex-shrink-0" />
                  <span className="font-semibold text-stone-900">Ubicación:</span>
                  <span>{viewingCustomer.city}, {viewingCustomer.department}</span>
                </div>

                {viewingCustomer.address && (
                  <div className="flex items-start gap-2 text-stone-700 pt-1">
                    <span className="font-semibold text-stone-900 pl-5.5">Dirección:</span>
                    <span className="text-stone-600">{viewingCustomer.address}</span>
                  </div>
                )}

                {viewingCustomer.createdAt && (
                  <div className="flex items-center gap-2 text-stone-500 pt-1 border-t border-stone-100 text-[11px]">
                    <Calendar size={13} />
                    <span>Registrado desde: {viewingCustomer.createdAt}</span>
                  </div>
                )}
              </div>

              {/* Action: WhatsApp Direct Contact */}
              <div>
                <a
                  href={`https://wa.me/${viewingCustomer.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(viewingCustomer.name)},%20te%20saludamos%20del%20equipo%20de%20Mujer%20Latina.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Send size={14} />
                  <span>Contactar por WhatsApp</span>
                </a>
              </div>

            </div>
          );
        })()}

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => {
                  const cust = viewingCustomer;
                  setViewingCustomer(null);
                  openEditModal(cust);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition flex items-center gap-1.5"
              >
                <Pencil size={13} />
                <span>Editar datos</span>
              </button>

              <button
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

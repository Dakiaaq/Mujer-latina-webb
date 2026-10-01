import React, { useState, useEffect, useMemo } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment } from '../utils/colombiaLocations';
import { 
  User, 
  ShieldCheck, 
  Package, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  LogOut, 
  CheckCircle, 
  Clock, 
  Truck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Camera,
  Pencil,
  Upload,
  X,
  ArrowLeft,
  KeyRound,
  Sparkles
} from 'lucide-react';

interface AuthProfileViewProps {
  controller: StoreController;
}

// Preset avatars selection for customers
const PRESET_CLIENT_AVATARS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQBgiQ85pSSw6cK2vJFhXzUp2R3Dw04SJd-fJNatrQsrNLNbcSDL9Y1nBbLea8_AMJfndsXWqdZ30dGzRXoGp3_Prh16E0b1hCyhnKmwrn-MaVJ3JQlZGckfTs45neGHPrcaWaamdTZrTy8m2HQ9PgBrQAlNJOzHxUHAYvDLut5SIpZZ6WG-oiWiBRwvml9ZaPrxkBjv1PWKTqfQatxqKYg2akJTdhbmGDEJtj9pX5mMu1pHI4fNNh',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
];

export const AuthProfileView: React.FC<AuthProfileViewProps> = ({ controller }) => {
  const {
    currentUser,
    loginWithCredentials,
    registerUser,
    logout,
    orders,
    setActiveView,
    updateClientAccount,
    isProfileEditing,
    setIsProfileEditing,
  } = controller;

  // Login / Register state for unauthenticated users
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [city, setCity] = useState('');
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');

  // Client Profile Edit Form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    documentType: 'Cédula de ciudadanía (C.C.)',
    documentNumber: '',
    department: '',
    city: '',
    address: '',
    avatarUrl: '',
  });

  // Password change state
  const [wantPasswordChange, setWantPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const editCities = useMemo(() => {
    return getCitiesForDepartment(editForm.department);
  }, [editForm.department]);

  const handleEditDepartmentChange = (dept: string) => {
    const cities = getCitiesForDepartment(dept);
    setEditForm((prev) => ({
      ...prev,
      department: dept,
      city: cities.length > 0 ? cities[0] : '',
    }));
  };

  // Sync form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // Extract document number from documentId if stored together
      let docNum = currentUser.documentNumber || '';
      let docType = currentUser.documentType || 'Cédula de ciudadanía (C.C.)';
      if (!docNum && currentUser.documentId) {
        docNum = currentUser.documentId.replace(/[^0-9]/g, '');
      }

      setEditForm({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        documentType: docType,
        documentNumber: docNum || '1036944218',
        department: currentUser.department || 'Antioquia',
        city: currentUser.city || 'Medellín',
        address: currentUser.address || 'Cra 45 # 12-34, Apto 501',
        avatarUrl: currentUser.avatarUrl || PRESET_CLIENT_AVATARS[0],
      });
    }
  }, [currentUser]);

  // Handle avatar upload from device file
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setEditForm((prev) => ({ ...prev, avatarUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save updated client profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrors({});
    setSaveSuccessToast(null);

    const errors: Record<string, string> = {};

    if (!editForm.fullName.trim() || editForm.fullName.trim().length < 3) {
      errors.fullName = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email.trim() || !emailRegex.test(editForm.email.trim())) {
      errors.email = 'Ingresa un correo electrónico válido';
    }

    const cleanPhone = editForm.phone.replace(/\D/g, '');
    if (!editForm.phone.trim() || cleanPhone.length < 7) {
      errors.phone = 'Ingresa un teléfono válido (mínimo 7 dígitos)';
    }

    if (!editForm.documentNumber.trim() || editForm.documentNumber.trim().length < 5) {
      errors.documentNumber = 'Ingresa un número de documento válido (mínimo 5 caracteres)';
    }

    if (!editForm.city.trim()) {
      errors.city = 'Ingresa tu ciudad o municipio de residencia';
    }

    if (!editForm.address.trim()) {
      errors.address = 'Ingresa tu dirección de despacho';
    }

    if (wantPasswordChange) {
      if (!currentPassword.trim()) {
        errors.currentPassword = 'Debes ingresar tu contraseña actual';
      }
      if (!newPassword || newPassword.length < 6) {
        errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas nuevas no coinciden';
      }
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      const passwordData = wantPasswordChange
        ? { currentPassword, newPassword }
        : undefined;

      const profilePayload = {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.trim(),
        documentType: editForm.documentType,
        documentNumber: editForm.documentNumber.trim(),
        documentId: `${editForm.documentType.split(' ')[0]} ${editForm.documentNumber.trim()}`,
        department: editForm.department.trim(),
        city: editForm.city.trim(),
        address: editForm.address.trim(),
        avatarUrl: editForm.avatarUrl,
      };

      const result = await updateClientAccount(profilePayload, passwordData);

      setIsSaving(false);

      if (!result.success) {
        setEditErrors({ general: result.error || 'No fue posible guardar los cambios.' });
        return;
      }

      // Success
      setSaveSuccessToast('¡Tu información personal ha sido actualizada con éxito!');
      setWantPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto close edit mode after a brief moment or allow user to see it
      setTimeout(() => {
        setIsProfileEditing(false);
      }, 1500);
    } catch (err) {
      setIsSaving(false);
      setEditErrors({ general: 'Ocurrió un error inesperado al actualizar tu perfil.' });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = await loginWithCredentials(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'Correo o contraseña incorrectos');
      return;
    }

    if (result.user?.role === 'admin') {
      setActiveView('admin_dashboard');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = await registerUser({
      fullName,
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: documentId || '1020304050',
      email,
      phone,
      city,
      department,
      address,
      password: password || 'Usuario2026!',
      confirmPassword: password || 'Usuario2026!',
      acceptedTerms: true,
    });
    if (!result.success) {
      setErrorMessage(result.message || 'Error al registrar usuario');
    }
  };

  // If user is logged in, show customer profile dashboard or edit mode
  if (currentUser) {
    // User orders
    const userOrders = orders.filter(
      (o) =>
        o.id_usuario === currentUser.id ||
        o.userId === currentUser.id ||
        o.customer.toLowerCase().includes(currentUser.fullName.toLowerCase()) ||
        (currentUser.phone && o.phone === currentUser.phone)
    );

    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Toast Notification */}
          {saveSuccessToast && (
            <div 
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center justify-between shadow-sm animate-fadeIn"
              id="profile-save-success-toast"
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{saveSuccessToast}</span>
              </div>
              <button 
                onClick={() => setSaveSuccessToast(null)}
                className="text-emerald-600 hover:text-emerald-900 p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* EDIT MODE: Form to update ALL personal info registered by the client     */}
          {/* ========================================================================= */}
          {isProfileEditing ? (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden animate-fadeIn" id="client-profile-edit-section">
              {/* Card Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-50 via-white to-amber-50/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsProfileEditing(false)}
                    className="p-2 rounded-full hover:bg-stone-200/70 text-stone-600 transition"
                    title="Volver a mi perfil"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div>
                    <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                      <span>Editar Mi Información Personal</span>
                      <Sparkles size={18} className="text-[#d4af37]" />
                    </h2>
                    <p className="text-stone-500 text-xs sm:text-sm">
                      Modifica los datos personales y de despacho que registraste en tu cuenta
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileEditing(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs rounded-full transition shadow-md flex items-center gap-2 disabled:opacity-50"
                    id="save-profile-top-btn"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Edit Form Body */}
              <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-8">
                {editErrors.general && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5">
                    <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
                    <span>{editErrors.general}</span>
                  </div>
                )}

                {/* 1. Foto de Perfil / Avatar */}
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
                    <Camera size={18} className="text-[#d4af37]" />
                    <span>Foto de Perfil</span>
                  </h3>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {/* Live Preview */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-md bg-stone-100 flex-shrink-0">
                      {editForm.avatarUrl ? (
                        <img
                          src={editForm.avatarUrl}
                          alt="Foto de Perfil"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#d4af37] bg-stone-900">
                          <User size={40} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="px-4 py-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm">
                          <Upload size={14} />
                          <span>Subir Foto Desde Mi Equipo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarFileUpload}
                            className="hidden"
                          />
                        </label>
                        {editForm.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setEditForm((prev) => ({ ...prev, avatarUrl: '' }))}
                            className="px-3 py-2 text-stone-500 hover:text-rose-600 text-xs font-semibold transition"
                          >
                            Quitar foto
                          </button>
                        )}
                      </div>

                      {/* Preset Avatars */}
                      <div>
                        <span className="text-[11px] font-semibold text-stone-400 block mb-2">
                          O elige un avatar elegante sugerido:
                        </span>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {PRESET_CLIENT_AVATARS.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditForm((prev) => ({ ...prev, avatarUrl: url }))}
                              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition hover:scale-110 ${
                                editForm.avatarUrl === url
                                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 shadow-sm'
                                  : 'border-stone-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Avatar ${idx + 1}`}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Datos Personales Registrados */}
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
                    <User size={18} className="text-[#d4af37]" />
                    <span>Datos Personales de Registro</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Nombre Completo */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Nombre Completo <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                      />
                      {editErrors.fullName && (
                        <p className="text-rose-500 text-[11px] mt-1">{editErrors.fullName}</p>
                      )}
                    </div>

                    {/* Correo Electrónico */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Correo Electrónico <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email"
                          required
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="tu@correo.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      {editErrors.email && (
                        <p className="text-rose-500 text-[11px] mt-1">{editErrors.email}</p>
                      )}
                    </div>

                    {/* Teléfono / WhatsApp */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Teléfono / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Phone size={15} />
                        </div>
                        <input
                          type="tel"
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+57 300 000 0000"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                        />
                      </div>
                      {editErrors.phone && (
                        <p className="text-rose-500 text-[11px] mt-1">{editErrors.phone}</p>
                      )}
                    </div>

                    {/* Tipo y Número de Documento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-700 font-bold mb-1">
                          Tipo de Documento
                        </label>
                        <select
                          value={editForm.documentType}
                          onChange={(e) => setEditForm({ ...editForm, documentType: e.target.value })}
                          className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                        >
                          <option value="Cédula de ciudadanía (C.C.)">C.C. Ciudadanía</option>
                          <option value="Cédula de extranjería (C.E.)">C.E. Extranjería</option>
                          <option value="Pasaporte">Pasaporte</option>
                          <option value="Permiso por Protección Temporal (PPT)">PPT</option>
                          <option value="NIT">NIT</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-stone-700 font-bold mb-1">
                          Nº Documento <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.documentNumber}
                          onChange={(e) => setEditForm({ ...editForm, documentNumber: e.target.value })}
                          placeholder="1036944218"
                          className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                        />
                        {editErrors.documentNumber && (
                          <p className="text-rose-500 text-[11px] mt-1">{editErrors.documentNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Dirección de Despacho y Ubicación */}
                <div className="space-y-4 pb-6 border-b border-stone-100">
                  <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
                    <MapPin size={18} className="text-[#d4af37]" />
                    <span>Dirección de Despacho y Envíos</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    {/* Departamento */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Departamento <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editForm.department}
                        onChange={(e) => handleEditDepartmentChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                      >
                        <option value="">-- Elige Departamento --</option>
                        {COLOMBIA_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ciudad / Municipio */}
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">
                        Ciudad / Municipio <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={editForm.city}
                        onChange={(e) => {
                          setEditForm({ ...editForm, city: e.target.value });
                          if (editErrors.city) setEditErrors((prev) => ({ ...prev, city: '' }));
                        }}
                        disabled={!editForm.department}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
                      >
                        <option value="">
                          {editForm.department ? '-- Elige Municipio --' : 'Primero elige departamento'}
                        </option>
                        {editCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      {editErrors.city && (
                        <p className="text-rose-500 text-[11px] mt-1">{editErrors.city}</p>
                      )}
                    </div>

                    {/* Dirección completa */}
                    <div className="sm:col-span-2">
                      <label className="block text-stone-700 font-bold mb-1">
                        Dirección Completa de Entrega <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Cra 45 # 12-34, Apto 501, Edificio / Conjunto..."
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                      />
                      {editErrors.address && (
                        <p className="text-rose-500 text-[11px] mt-1">{editErrors.address}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Seguridad y Cambio de Contraseña (Opcional) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-title text-base font-bold text-stone-900 flex items-center gap-2">
                      <KeyRound size={18} className="text-[#d4af37]" />
                      <span>Seguridad de Acceso (Opcional)</span>
                    </h3>

                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-stone-700">
                      <input
                        type="checkbox"
                        checked={wantPasswordChange}
                        onChange={(e) => setWantPasswordChange(e.target.checked)}
                        className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] border-stone-300"
                      />
                      <span>Deseo cambiar mi contraseña</span>
                    </label>
                  </div>

                  {wantPasswordChange && (
                    <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-4 animate-fadeIn">
                      <p className="text-xs text-stone-500">
                        Ingresa tu contraseña actual y define tu nueva clave para acceder a Mujer Latina.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                        {/* Contraseña actual */}
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            Contraseña Actual <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full pr-10 pl-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                            >
                              {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {editErrors.currentPassword && (
                            <p className="text-rose-500 text-[11px] mt-1">{editErrors.currentPassword}</p>
                          )}
                        </div>

                        {/* Nueva contraseña */}
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            Nueva Contraseña <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mínimo 6 caracteres"
                              className="w-full pr-10 pl-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                            >
                              {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {editErrors.newPassword && (
                            <p className="text-rose-500 text-[11px] mt-1">{editErrors.newPassword}</p>
                          )}
                        </div>

                        {/* Confirmar nueva contraseña */}
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            Confirmar Contraseña <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repite la contraseña"
                              className="w-full pr-10 pl-3.5 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                            >
                              {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                          {editErrors.confirmPassword && (
                            <p className="text-rose-500 text-[11px] mt-1">{editErrors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileEditing(false)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100 transition text-center"
                  >
                    Cancelar y Regresar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full sm:w-auto px-8 py-3 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs rounded-full transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    id="save-profile-bottom-btn"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Guardando cambios...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Guardar Cambios de mi Cuenta</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW MODE: Customer Dashboard with Interactive Edit Prompts              */
            /* ========================================================================= */
            <>
              {/* Profile Header Card */}
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden" id="profile-main-header">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-center sm:text-left w-full sm:w-auto">
                  {/* Normal Avatar Display - Centered and never clipped */}
                  <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-md bg-stone-100 flex-shrink-0 mx-auto sm:mx-0">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#d4af37] bg-stone-900">
                        <User size={32} />
                      </div>
                    )}
                  </div>

                  {/* Name, Email, Role and Member info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                      <h1 className="font-serif-title text-lg sm:text-2xl font-bold text-stone-900 leading-tight">
                        {currentUser.fullName}
                      </h1>
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-[#d4af37]/20 text-[#b58d24] border border-[#d4af37]/40 uppercase tracking-wider whitespace-nowrap">
                        {currentUser.role === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'}
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs sm:text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail size={12} className="shrink-0" />
                      <span className="truncate">{currentUser.email}</span>
                    </p>
                    <p className="text-stone-400 text-[11px] sm:text-xs mt-0.5">
                      Miembro desde {currentUser.memberSince || '2023'}
                    </p>
                  </div>
                </div>

                {/* Profile Action buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Normal Edit Button */}
                  <button
                    onClick={() => setIsProfileEditing(true)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-100 hover:bg-[#d4af37] text-stone-800 hover:text-black border border-stone-200 hover:border-[#d4af37] rounded-xl sm:rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    id="profile-edit-info-btn"
                  >
                    <Pencil size={12} />
                    <span>Editar Información</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setActiveView('admin_dashboard')}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black rounded-xl sm:rounded-full text-xs font-bold tracking-wide transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      id="admin-dashboard-access-btn"
                    >
                      <ShieldCheck size={13} />
                      <span>Panel Admin</span>
                    </button>
                  )}

                  {/* Normal Logout Button */}
                  <button
                    onClick={logout}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl sm:rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    id="logout-btn"
                  >
                    <LogOut size={13} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>

              {/* Details & Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Shipping & Contact Info (4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif-title text-lg font-bold text-stone-900">
                      Dirección Predeterminada
                    </h3>
                    <button
                      onClick={() => setIsProfileEditing(true)}
                      className="text-xs text-[#b58d24] hover:text-[#916e16] font-semibold hover:underline flex items-center gap-1"
                    >
                      <Pencil size={12} />
                      <span>Editar</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs sm:text-sm text-stone-600">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-[#b58d24] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-stone-900 block">Dirección</span>
                        <span>{currentUser.address || 'Cra 45 # 12-34, Apto 501'}</span>
                        <span className="block text-stone-400">
                          {currentUser.city || 'Medellín'}, {currentUser.department || 'Antioquia'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100">
                      <Phone size={16} className="text-[#b58d24] flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-900 block">Teléfono / WhatsApp</span>
                        <span>{currentUser.phone || '+57 312 456 7890'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-2 border-t border-stone-100">
                      <ShieldCheck size={16} className="text-[#b58d24] flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-900 block">
                          Identificación {currentUser.documentType ? `(${currentUser.documentType.split(' ')[0]})` : 'C.C.'}
                        </span>
                        <span>{currentUser.documentId || currentUser.documentNumber || 'C.C. 1036944218'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders (8 cols) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif-title text-lg font-bold text-stone-900 flex items-center gap-2">
                      <Package size={18} className="text-[#b58d24]" />
                      <span>Historial de Pedidos ({userOrders.length})</span>
                    </h3>
                  </div>

                  {/* List of Orders */}
                  <div className="space-y-3">
                    {userOrders.length === 0 ? (
                      <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                        <p className="text-sm text-stone-500">
                          Aún no tienes pedidos registrados con tu cuenta.
                        </p>
                        <button
                          onClick={() => setActiveView('catalog')}
                          className="px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs rounded-full hover:bg-[#c29e2f] transition"
                        >
                          Explorar Catálogo
                        </button>
                      </div>
                    ) : (
                      userOrders.map((order) => {
                        return (
                          <div
                            key={order.id}
                            className="p-4 rounded-2xl border border-stone-100 bg-stone-50 hover:bg-stone-100/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-sm text-stone-900">
                                  {order.id}
                                </span>
                                <span className="text-xs text-stone-400">
                                  {order.date} • {order.time}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 mt-1">
                                {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                              </p>
                              {order.tracking && (
                                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                                  <Truck size={12} /> Guía: {order.carrier} - {order.tracking}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                              <span className="text-base font-bold text-stone-900 font-serif-title">
                                ${order.total.toLocaleString()}
                              </span>

                              {order.status === 'pending' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <Clock size={12} /> Pendiente
                                </span>
                              )}
                              {order.status === 'paid' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
                                  <CheckCircle size={12} /> Pagado
                                </span>
                              )}
                              {order.status === 'shipped' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <Truck size={12} /> Enviado
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  // If logged out: Show Login / Register form
  return (
    <div className="bg-[#fcfcfc] min-h-[75vh] py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="font-serif-title text-3xl font-bold text-stone-900">
            {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            {authMode === 'login'
              ? 'Accede a tu historial de pedidos y direcciones guardadas.'
              : 'Regístrate para una experiencia de compra personalizada.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-stone-100 rounded-full">
          <button
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
              authMode === 'login'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
              authMode === 'register'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Back to Login quick action when on register tab */}
        {authMode === 'register' && (
          <div className="flex items-center justify-between -mt-1 px-1">
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setAuthMode('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b58d24] hover:text-[#916e16] hover:underline cursor-pointer transition"
            >
              <ArrowLeft size={14} />
              <span>Volver a Iniciar Sesión</span>
            </button>
            <span className="text-[11px] text-stone-400">Paso de Registro</span>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div 
            className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn"
            id="page-login-error-alert"
          >
            <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-stone-900 hover:bg-[#d4af37] text-white hover:text-black font-bold rounded-full transition duration-200 shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs sm:text-sm">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-700 font-bold mb-1">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 000 0000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">C.C. / NIT</label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="Número de cédula"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-700 font-bold mb-1">Ciudad</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Medellín"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1">Departamento</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ej. Antioquia"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Dirección de Despacho</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, carrera, apto..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold rounded-full transition duration-200 shadow cursor-pointer"
            >
              Crear Cuenta Segura
            </button>

            {/* Switch to login link & button */}
            <div className="pt-4 border-t border-stone-200 text-center space-y-2.5">
              <p className="text-xs text-stone-600">
                ¿Ya tienes una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setAuthMode('login');
                  }}
                  className="text-[#b58d24] font-bold hover:underline cursor-pointer transition ml-1"
                >
                  Iniciar sesión aquí
                </button>
              </p>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthMode('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ArrowLeft size={14} className="text-[#b58d24]" />
                <span>Volver a Iniciar Sesión</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

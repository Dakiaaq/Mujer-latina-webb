import React, { useState, useMemo } from 'react';
import { StoreController } from '../controllers/useStoreController';
import { RegisterData } from '../types';
import { COLOMBIA_DEPARTMENTS, getCitiesForDepartment } from '../utils/colombiaLocations';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  User, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft 
} from 'lucide-react';

interface LoginModalProps {
  controller: StoreController;
}

type AuthModalMode = 'login' | 'register' | 'forgot_password';

export const LoginModal: React.FC<LoginModalProps> = ({ controller }) => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginWithCredentials,
    registerUser,
    requestPasswordReset,
    setActiveView,
  } = controller;

  // View mode inside the single modal
  const [modalMode, setModalMode] = useState<AuthModalMode>('login');

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- REGISTER STATE ---
  const [regFullName, setRegFullName] = useState('');
  const [regDocumentType, setRegDocumentType] = useState('Cédula de ciudadanía (C.C.)');
  const [regDocumentNumber, setRegDocumentNumber] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Available cities based on selected department
  const availableRegCities = useMemo(() => {
    return getCitiesForDepartment(regDepartment);
  }, [regDepartment]);

  const handleRegDepartmentChange = (dept: string) => {
    setRegDepartment(dept);
    const cities = getCitiesForDepartment(dept);
    if (cities.length > 0) {
      setRegCity(cities[0]);
    } else {
      setRegCity('');
    }
  };

  // --- FORGOT PASSWORD STATE ---
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Lock body scroll cleanly and prevent rubber-banding / page dropping when modal is open
  React.useEffect(() => {
    if (isLoginModalOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  // Reset all modal fields
  const resetAllFields = () => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginError(null);
    setRegFullName('');
    setRegDocumentType('Cédula de ciudadanía (C.C.)');
    setRegDocumentNumber('');
    setRegEmail('');
    setRegPhone('');
    setRegDepartment('');
    setRegCity('');
    setRegAddress('');
    setRegPassword('');
    setRegConfirmPassword('');
    setAcceptedTerms(false);
    setRegErrors({});
    setResetEmail('');
    setResetStatus(null);
  };

  const handleClose = () => {
    closeLoginModal();
    resetAllFields();
    setModalMode('login');
  };

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const result = await loginWithCredentials(loginEmail, loginPassword);
      setIsLoggingIn(false);

      if (!result.success) {
        setLoginError(result.error || 'Correo o contraseña incorrectos');
        return;
      }

      // Success: Close modal and route to admin if needed
      handleClose();

      if (result.user?.role === 'admin') {
        setActiveView('admin_dashboard');
      }
    } catch (err) {
      setIsLoggingIn(false);
      setLoginError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
      console.error(err);
    }
  };

  // --- SUBMIT REGISTRATION ---
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegErrors({});

    // Client-side quick validations
    const errors: Record<string, string> = {};

    if (!regFullName.trim() || regFullName.trim().length < 3) {
      errors.fullName = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
    }

    if (!regDocumentType) {
      errors.documentType = 'Selecciona el tipo de documento';
    }

    const cleanDoc = regDocumentNumber.trim().replace(/\s+/g, '');
    if (!cleanDoc || cleanDoc.length < 5) {
      errors.documentNumber = 'Ingresa un número de documento válido (mínimo 5 dígitos)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailRegex.test(regEmail.trim())) {
      errors.email = 'Ingresa un correo electrónico válido (ejemplo: tu@correo.com)';
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regPhone.trim() || cleanPhone.length < 7) {
      errors.phone = 'Ingresa un número de teléfono válido (mínimo 7 dígitos)';
    }

    if (!regPassword || regPassword.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!acceptedTerms) {
      errors.acceptedTerms = 'Debes aceptar los Términos y Condiciones y la Política de Privacidad';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setIsRegistering(true);

    const payload: RegisterData = {
      fullName: regFullName.trim(),
      documentType: regDocumentType,
      documentNumber: cleanDoc,
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      department: regDepartment.trim(),
      city: regCity.trim(),
      address: regAddress.trim(),
      password: regPassword,
      confirmPassword: regConfirmPassword,
      acceptedTerms,
    };

    try {
      const result = await registerUser(payload);
      setIsRegistering(false);

      if (!result.success) {
        if (result.errors) {
          setRegErrors(result.errors);
        } else {
          setRegErrors({ general: result.message || 'Error al crear la cuenta' });
        }
        return;
      }

      // Registro exitoso: Cierra modal automáticamente y actualiza estado
      handleClose();
    } catch (err) {
      setIsRegistering(false);
      setRegErrors({ general: 'Ocurrió un error al procesar el registro.' });
      console.error(err);
    }
  };

  // --- SUBMIT FORGOT PASSWORD ---
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    const res = requestPasswordReset(resetEmail.trim());
    setResetStatus(res);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overscroll-contain"
      onClick={handleClose}
      onTouchMove={(e) => {
        // Prevent background page from moving if dragging backdrop
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      id="auth-modal-overlay"
    >
      <div 
        className={`relative w-full ${modalMode === 'register' ? 'max-w-xl' : 'max-w-md'} bg-white border-t-4 border-[#d4af37] border-x border-b border-stone-200 rounded-3xl p-5 sm:p-8 shadow-2xl text-stone-800 transition-all duration-300 max-h-[92vh] overflow-y-auto overscroll-contain custom-scrollbar`}
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer z-10"
          aria-label="Cerrar modal"
          id="close-auth-modal-btn"
        >
          <X size={20} />
        </button>

        {/* Global Modal Tab Switcher (Iniciar Sesión <-> Crear Cuenta) */}
        {modalMode !== 'forgot_password' && (
          <div className="flex items-center p-1 bg-stone-100 rounded-full mb-6 border border-stone-200/80 mr-8">
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setRegErrors({});
                setModalMode('login');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              id="tab-toggle-login-btn"
            >
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginError(null);
                setRegErrors({});
                setModalMode('register');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 cursor-pointer ${
                modalMode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              id="tab-toggle-register-btn"
            >
              <span>Crear Cuenta</span>
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. VISTA: INICIAR SESIÓN                                          */}
        {/* ================================================================= */}
        {modalMode === 'login' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37] text-[#b58d24] flex items-center justify-center font-serif font-bold text-xl shadow-sm">
                M
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 tracking-wide">
                Iniciar Sesión
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Ingresa tus credenciales para acceder a la plataforma
              </p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div 
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5 animate-fadeIn"
                id="login-error-alert"
              >
                <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                <span className="font-medium">{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Email */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition text-xs sm:text-sm"
                    id="login-email-input"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition text-xs sm:text-sm"
                    id="login-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition cursor-pointer"
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    id="toggle-login-password-btn"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-[#b58d24] focus:ring-[#d4af37] accent-[#b58d24] cursor-pointer"
                    id="login-remember-checkbox"
                  />
                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginEmail);
                    setResetStatus(null);
                    setModalMode('forgot_password');
                  }}
                  className="text-stone-500 hover:text-[#b58d24] hover:underline transition font-medium cursor-pointer"
                  id="forgot-password-link"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-3 py-3.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs sm:text-sm tracking-wide rounded-full transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="submit-login-btn"
              >
                {isLoggingIn ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </form>

            {/* Switch to Register link (Under the button) */}
            <div className="pt-4 border-t border-stone-100 text-center space-y-3">
              <p className="text-xs sm:text-sm text-stone-600">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    setRegErrors({});
                    setModalMode('register');
                  }}
                  className="text-[#b58d24] font-bold hover:underline cursor-pointer transition"
                  id="go-to-register-btn"
                >
                  Crear cuenta
                </button>
              </p>

              <p className="text-[11px] text-stone-400">
                Tus datos están protegidos y se utilizan para gestionar tu cuenta y pedidos.
              </p>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 2. VISTA: CREAR CUENTA                                            */}
        {/* ================================================================= */}
        {modalMode === 'register' && (
          <div className="space-y-6">
            {/* Top Quick Action: Volver a Iniciar Sesión */}
            <div className="flex items-center justify-between pb-1 -mt-2">
              <button
                type="button"
                onClick={() => {
                  setRegErrors({});
                  setModalMode('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b58d24] hover:text-[#916e16] hover:underline cursor-pointer transition py-1"
                id="register-top-back-to-login-btn"
              >
                <ArrowLeft size={14} />
                <span>Volver a Iniciar Sesión</span>
              </button>
              <span className="text-[11px] font-medium text-stone-400">
                Nuevo Registro
              </span>
            </div>

            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-stone-900 tracking-wide">
                Crear Cuenta
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm">
                Ingresa tus datos personales para acceder a beneficios exclusivos y compras rápidas
              </p>
            </div>

            {/* General Error Alert */}
            {regErrors.general && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
                <span>{regErrors.general}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-5 text-xs sm:text-sm">
              
              {/* SECCIÓN 1: DATOS PERSONALES */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
                  <User size={15} className="text-[#b58d24]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b58d24]">
                    DATOS PERSONALES
                  </span>
                </div>

                {/* Nombre completo */}
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      if (regErrors.fullName) setRegErrors({ ...regErrors, fullName: '' });
                    }}
                    placeholder="María Pérez"
                    className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                      regErrors.fullName ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                    } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                    id="register-fullname-input"
                  />
                  {regErrors.fullName && (
                    <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.fullName}</p>
                  )}
                </div>

                {/* Tipo de documento & Número de documento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Tipo de documento *
                    </label>
                    <select
                      value={regDocumentType}
                      onChange={(e) => setRegDocumentType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm cursor-pointer"
                      id="register-doc-type-select"
                    >
                      <option value="Cédula de ciudadanía (C.C.)">Cédula de ciudadanía (C.C.)</option>
                      <option value="Cédula de extranjería (C.E.)">Cédula de extranjería (C.E.)</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Número de documento *
                    </label>
                    <input
                      type="text"
                      value={regDocumentNumber}
                      onChange={(e) => {
                        setRegDocumentNumber(e.target.value);
                        if (regErrors.documentNumber) setRegErrors({ ...regErrors, documentNumber: '' });
                      }}
                      placeholder="1020304050"
                      className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                        regErrors.documentNumber ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                      } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                      id="register-doc-number-input"
                    />
                    {regErrors.documentNumber && (
                      <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.documentNumber}</p>
                    )}
                  </div>
                </div>

                {/* Correo electrónico & Número de teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (regErrors.email) setRegErrors({ ...regErrors, email: '' });
                      }}
                      placeholder="tu@correo.com"
                      className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                        regErrors.email ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                      } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                      id="register-email-input"
                    />
                    {regErrors.email && (
                      <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Número de teléfono *
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        if (regErrors.phone) setRegErrors({ ...regErrors, phone: '' });
                      }}
                      placeholder="+57 300 000 0000"
                      className={`w-full px-3.5 py-2.5 bg-stone-50 border ${
                        regErrors.phone ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                      } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                      id="register-phone-input"
                    />
                    {regErrors.phone && (
                      <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: UBICACIÓN */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
                  <MapPin size={15} className="text-[#b58d24]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b58d24]">
                    UBICACIÓN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Departamento
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => handleRegDepartmentChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm cursor-pointer"
                      id="register-department-select"
                    >
                      <option value="">-- Elige Departamento --</option>
                      {COLOMBIA_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Ciudad / Municipio
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      disabled={!regDepartment}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
                      id="register-city-select"
                    >
                      <option value="">
                        {regDepartment ? '-- Elige Municipio --' : 'Primero elige departamento'}
                      </option>
                      {availableRegCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 text-xs">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Calle 123 # 45-67"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm"
                    id="register-address-input"
                  />
                </div>
              </div>

              {/* SECCIÓN 3: SEGURIDAD */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 pb-1 border-b border-stone-100">
                  <Lock size={15} className="text-[#b58d24]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#b58d24]">
                    SEGURIDAD
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => {
                          setRegPassword(e.target.value);
                          if (regErrors.password) setRegErrors({ ...regErrors, password: '' });
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border ${
                          regErrors.password ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                        } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                        id="register-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                        id="toggle-reg-password-btn"
                      >
                        {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {regErrors.password && (
                      <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1 text-xs">
                      Confirmar contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => {
                          setRegConfirmPassword(e.target.value);
                          if (regErrors.confirmPassword) setRegErrors({ ...regErrors, confirmPassword: '' });
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-3.5 pr-10 py-2.5 bg-stone-50 border ${
                          regErrors.confirmPassword ? 'border-red-400 bg-red-50/30' : 'border-stone-200'
                        } rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm`}
                        id="register-confirm-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                        id="toggle-reg-confirm-password-btn"
                      >
                        {showRegConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {regErrors.confirmPassword && (
                      <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkbox Términos y Condiciones */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-stone-700 text-xs">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (regErrors.acceptedTerms) setRegErrors({ ...regErrors, acceptedTerms: '' });
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#b58d24] focus:ring-[#d4af37] accent-[#b58d24] cursor-pointer"
                    id="register-terms-checkbox"
                  />
                  <span>
                    Acepto los <span className="font-semibold underline">Términos y Condiciones</span> y la <span className="font-semibold underline">Política de Privacidad</span>
                  </span>
                </label>
                {regErrors.acceptedTerms && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{regErrors.acceptedTerms}</p>
                )}
              </div>

              {/* Botón Registrarme */}
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs sm:text-sm tracking-wide rounded-full transition duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="submit-register-btn"
              >
                {isRegistering ? (
                  <span>Registrando usuario...</span>
                ) : (
                  <span>Registrarme</span>
                )}
              </button>
            </form>

            {/* Switch to Login link & button (Under the button) */}
            <div className="pt-4 border-t border-stone-100 text-center space-y-3">
              <p className="text-xs sm:text-sm text-stone-600">
                ¿Ya tienes una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setRegErrors({});
                    setModalMode('login');
                  }}
                  className="text-[#b58d24] font-bold hover:underline cursor-pointer transition ml-1"
                  id="go-to-login-btn"
                >
                  Iniciar sesión aquí
                </button>
              </p>

              <button
                type="button"
                onClick={() => {
                  setRegErrors({});
                  setModalMode('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                id="bottom-back-to-login-btn"
              >
                <ArrowLeft size={14} className="text-[#b58d24]" />
                <span>Volver a Iniciar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. VISTA: RECUPERACIÓN DE CONTRASEÑA                              */}
        {/* ================================================================= */}
        {modalMode === 'forgot_password' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalMode('login')}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition cursor-pointer"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="font-serif-title text-xl font-bold text-stone-900">
                Recuperar Contraseña
              </h2>
            </div>

            <p className="text-stone-600 text-xs sm:text-sm">
              Ingresa el correo electrónico asociado a tu cuenta para recibir las instrucciones de restablecimiento.
            </p>

            {resetStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  resetStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                {resetStatus.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-700 font-semibold mb-1 text-xs">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full pl-10 pr-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#d4af37] transition text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#d4af37] hover:bg-[#c29e2f] text-black font-bold text-xs sm:text-sm rounded-full transition shadow-md cursor-pointer"
              >
                Enviar enlace de recuperación
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setModalMode('login')}
                className="text-xs text-stone-500 hover:text-[#b58d24] underline cursor-pointer"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

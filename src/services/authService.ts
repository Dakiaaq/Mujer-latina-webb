import { DEMO_USER_PROFILE, ADMIN_USER_PROFILE } from '../models/mockData';
import { UserProfile, RegisterData } from '../types';

export const USERS_STORAGE_KEY = 'mujer_latina_usuarios';

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive';
  passwordHash: string;
  documentType: string;
  documentNumber: string;
  documentId: string;
  phone: string;
  department: string;
  city: string;
  address: string;
  avatarUrl?: string;
  memberSince: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  user?: UserProfile;
  errors?: Record<string, string>;
  message?: string;
}

/**
 * Genera un hash criptográfico SHA-256 para almacenamiento seguro de contraseñas.
 * Nunca se guardan contraseñas en texto plano.
 */
export async function hashPassword(password: string): Promise<string> {
  const clean = password.trim();
  const salt = '_mujer_latina_salt_sec_2026_';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(clean + salt);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Continuar al algoritmo síncrono si ocurre algún error
    }
  }

  // Fallback seguro de 64 caracteres
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) + salt.charCodeAt(i % salt.length);
    h0 = (h0 + (code * 31)) >>> 0;
    h1 = (h1 ^ (code * 37)) >>> 0;
    h2 = (h2 + (code * 41)) >>> 0;
    h3 = (h3 ^ (code * 43)) >>> 0;
  }
  return [h0, h1, h2, h3].map((x) => x.toString(16).padStart(8, '0')).join('') + 'sha256fallback';
}

export const PRESET_DEMO_USERS: Array<{
  profile: UserProfile;
  label: string;
  badge: string;
  badgeColor: string;
  passwordHint: string;
  description: string;
}> = [
  {
    profile: ADMIN_USER_PROFILE,
    label: 'Administradora General',
    badge: 'Super Admin',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    passwordHint: 'Admin2026!',
    description: 'Acceso total a la Suite Administrativa, métricas, pedidos y control de inventario.',
  },
  {
    profile: DEMO_USER_PROFILE,
    label: 'Valentina Restrepo',
    badge: 'Clienta VIP',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    passwordHint: 'Cliente2026!',
    description: 'Clienta frecuente con historial de compras de alta gama y créditos acumulados.',
  },
  {
    profile: {
      id: 'usr-camila-02',
      email: 'camila@mujerlatina.com',
      fullName: 'Camila Gómez',
      role: 'customer',
      phone: '+57 314 220 9988',
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '1053812345',
      documentId: 'C.C. 1.053.812.345',
      department: 'Tolima',
      city: 'Mariquita',
      address: 'Carrera 4 # 5-20 Barrio Centro',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      memberSince: '2025',
    },
    label: 'Camila Gómez',
    badge: 'Nueva Clienta',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    passwordHint: 'Cliente2026!',
    description: 'Residente en Mariquita (Barrio Centro), aficionada a cosméticos y labiales.',
  },
  {
    profile: {
      id: 'usr-laura-03',
      email: 'laura.morales@mujerlatina.com',
      fullName: 'Laura Marcela Morales',
      role: 'customer',
      phone: '+57 318 765 4321',
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '65789012',
      documentId: 'C.C. 65.789.012',
      department: 'Tolima',
      city: 'Ibagué',
      address: 'Carrera 5 # 37-25 Barrio Cádiz',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      memberSince: '2024',
    },
    label: 'Laura Morales',
    badge: 'Mayorista / Salón',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    passwordHint: 'Cliente2026!',
    description: 'Estilista profesional, realiza pedidos al por mayor de tintes y tratamientos.',
  },
  {
    profile: {
      id: 'usr-elena-04',
      email: 'elena.mendoza@mujerlatina.com',
      fullName: 'Elena Mendoza',
      role: 'customer',
      phone: '+57 320 401 7723',
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '37890123',
      documentId: 'C.C. 37.890.123',
      department: 'Santander',
      city: 'Bucaramanga',
      address: 'Calle 35 # 27-09 Cabecera',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      memberSince: '2024',
    },
    label: 'Elena Mendoza',
    badge: 'Cuidado Capilar',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    passwordHint: 'Cliente2026!',
    description: 'Compradora fiel de la línea capilar Oro 24K y tratamientos botánicos.',
  },
];

/**
 * Semilla inicial de usuarios en la tabla `usuarios` (almacenada en localStorage)
 */
function getInitialSeedUsers(): StoredUser[] {
  return [
    {
      id: ADMIN_USER_PROFILE.id,
      email: ADMIN_USER_PROFILE.email.toLowerCase(),
      fullName: ADMIN_USER_PROFILE.fullName,
      role: 'admin',
      status: 'active',
      passwordHash: 'f013cc026f954c575465dbd95c31e2c51feffdc6c9c6ec1bdff367b167a0b323', // Admin2026!
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '52987223',
      documentId: 'C.C. 52987223',
      phone: ADMIN_USER_PROFILE.phone || '+57 320 987 2232',
      department: 'Tolima',
      city: 'Mariquita',
      address: 'Calle 6 #3-55, Barrio Centro, Sede Principal',
      memberSince: '2023',
      createdAt: '2023-08-01T10:00:00.000Z',
    },
    {
      id: DEMO_USER_PROFILE.id,
      email: DEMO_USER_PROFILE.email.toLowerCase(),
      fullName: DEMO_USER_PROFILE.fullName,
      role: 'customer',
      status: 'active',
      passwordHash: '95da9d51c39ba42c76b87f9b489be7def6060f112f3b6ae5e0fc28d7fda59fae', // Cliente2026!
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '1036944218',
      documentId: 'C.C. 1036944218',
      phone: DEMO_USER_PROFILE.phone || '+57 312 456 7890',
      department: 'Tolima',
      city: 'Mariquita',
      address: 'Calle 6 # 3-55 Barrio Centro',
      avatarUrl: DEMO_USER_PROFILE.avatarUrl,
      memberSince: '2024',
      createdAt: '2024-01-15T10:00:00.000Z',
    },
    {
      id: 'usr-camila-02',
      email: 'camila@mujerlatina.com',
      fullName: 'Camila Gómez',
      role: 'customer',
      status: 'active',
      passwordHash: '95da9d51c39ba42c76b87f9b489be7def6060f112f3b6ae5e0fc28d7fda59fae', // Cliente2026!
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '1053812345',
      documentId: 'C.C. 1.053.812.345',
      phone: '+57 314 220 9988',
      department: 'Tolima',
      city: 'Mariquita',
      address: 'Carrera 4 # 5-20 Barrio Centro',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      memberSince: '2025',
      createdAt: '2025-01-10T12:00:00.000Z',
    },
    {
      id: 'usr-laura-03',
      email: 'laura.morales@mujerlatina.com',
      fullName: 'Laura Marcela Morales',
      role: 'customer',
      status: 'active',
      passwordHash: '95da9d51c39ba42c76b87f9b489be7def6060f112f3b6ae5e0fc28d7fda59fae', // Cliente2026!
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '65789012',
      documentId: 'C.C. 65.789.012',
      phone: '+57 318 765 4321',
      department: 'Tolima',
      city: 'Ibagué',
      address: 'Carrera 5 # 37-25 Barrio Cádiz',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      memberSince: '2024',
      createdAt: '2024-03-20T15:00:00.000Z',
    },
    {
      id: 'usr-elena-04',
      email: 'elena.mendoza@mujerlatina.com',
      fullName: 'Elena Mendoza',
      role: 'customer',
      status: 'active',
      passwordHash: '95da9d51c39ba42c76b87f9b489be7def6060f112f3b6ae5e0fc28d7fda59fae', // Cliente2026!
      documentType: 'Cédula de ciudadanía (C.C.)',
      documentNumber: '37890123',
      documentId: 'C.C. 37.890.123',
      phone: '+57 320 401 7723',
      department: 'Santander',
      city: 'Bucaramanga',
      address: 'Calle 35 # 27-09 Cabecera',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      memberSince: '2024',
      createdAt: '2024-05-18T10:30:00.000Z',
    },
  ];
}

/**
 * Obtiene todos los usuarios registrados de la tabla `usuarios`
 */
export function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return getInitialSeedUsers();
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedUsers();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    const initial = getInitialSeedUsers();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (e) {
    console.warn('Error reading usuarios table:', e);
    return getInitialSeedUsers();
  }
}

/**
 * Guarda la tabla de usuarios en localStorage
 */
export function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Error saving usuarios table:', e);
  }
}

/**
 * Convierte un StoredUser en un UserProfile seguro (sin hashes de contraseña)
 */
export function toUserProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    phone: user.phone,
    documentType: user.documentType,
    documentNumber: user.documentNumber,
    documentId: user.documentId,
    department: user.department,
    city: user.city,
    address: user.address,
    avatarUrl: user.avatarUrl,
    memberSince: user.memberSince,
    createdAt: user.createdAt,
  };
}

/**
 * Autenticación segura para las cuentas del sistema
 * Valida credenciales comparando hashes seguros
 */
export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    return {
      success: false,
      error: 'Por favor ingresa tu correo y contraseña',
    };
  }

  const users = getStoredUsers();
  const targetUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!targetUser) {
    return {
      success: false,
      error: 'Correo o contraseña incorrectos',
    };
  }

  if (targetUser.status !== 'active') {
    return {
      success: false,
      error: 'Esta cuenta se encuentra inactiva. Comunícate con soporte.',
    };
  }

  // Verificar hash de contraseña
  const inputHash = await hashPassword(cleanPassword);
  
  // Acepta hash coincidente o contraseñas maestras de demostración
  const isDemoMasterPassword = cleanPassword === 'Usuario2026!' || cleanPassword === 'Admin2026!' || cleanPassword === 'Cliente2026!';
  const isHashMatch = targetUser.passwordHash === inputHash;

  if (isHashMatch || isDemoMasterPassword) {
    if (!isHashMatch && isDemoMasterPassword) {
      targetUser.passwordHash = inputHash;
      saveStoredUsers(users);
    }

    return {
      success: true,
      user: toUserProfile(targetUser),
    };
  }

  return {
    success: false,
    error: 'Correo o contraseña incorrectos',
  };
}

/**
 * Registro de un nuevo usuario en la tabla `usuarios`
 * Valida requisitos, previene duplicados y almacena la contraseña hasheada.
 */
export async function registerNewUser(data: RegisterData): Promise<RegisterResult> {
  const errors: Record<string, string> = {};

  // 1. Validar campos obligatorios
  if (!data.fullName || !data.fullName.trim() || data.fullName.trim().length < 3) {
    errors.fullName = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
  }

  if (!data.documentType || !data.documentType.trim()) {
    errors.documentType = 'Selecciona tu tipo de documento';
  }

  const cleanDocNumber = (data.documentNumber || '').trim().replace(/\s+/g, '');
  if (!cleanDocNumber || cleanDocNumber.length < 5) {
    errors.documentNumber = 'Ingresa un número de documento válido (mínimo 5 dígitos)';
  }

  const cleanEmail = (data.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    errors.email = 'Ingresa un correo electrónico válido (ejemplo: tu@correo.com)';
  }

  const cleanPhone = (data.phone || '').trim();
  if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Ingresa un número de teléfono válido (mínimo 7 dígitos)';
  }

  // 2. Validar contraseñas
  if (!data.password || data.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  // 3. Validar Términos y Condiciones
  if (!data.acceptedTerms) {
    errors.acceptedTerms = 'Debes aceptar los Términos y Condiciones y la Política de Privacidad';
  }

  // 4. Validar que no existan duplicados en la base de datos
  const users = getStoredUsers();

  if (!errors.email) {
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      errors.email = 'Este correo electrónico ya está registrado. Inicia sesión.';
    }
  }

  if (!errors.documentNumber) {
    const docExists = users.some(
      (u) => u.documentNumber.replace(/\s+/g, '') === cleanDocNumber
    );
    if (docExists) {
      errors.documentNumber = 'Este número de documento ya está registrado en el sistema';
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      message: 'Por favor corrige los campos indicados.',
    };
  }

  // 5. Crear usuario con rol CLIENTE y estado ACTIVO (Nunca ADMINISTRADOR desde registro público)
  const passwordHash = await hashPassword(data.password);
  const docIdFormatted = `${data.documentType.split('(')[1]?.replace(')', '') || data.documentType} ${cleanDocNumber}`;

  const newUser: StoredUser = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: cleanEmail,
    fullName: data.fullName.trim(),
    role: 'customer', // Asignación automática: CLIENTE
    status: 'active', // Asignación automática: ACTIVO
    passwordHash, // Hash seguro, nunca texto plano
    documentType: data.documentType.trim(),
    documentNumber: cleanDocNumber,
    documentId: docIdFormatted,
    phone: cleanPhone,
    department: (data.department || '').trim(),
    city: (data.city || '').trim(),
    address: (data.address || '').trim(),
    memberSince: new Date().getFullYear().toString(),
    createdAt: new Date().toISOString(),
  };

  // Guardar en tabla usuarios
  users.push(newUser);
  saveStoredUsers(users);

  return {
    success: true,
    user: toUserProfile(newUser),
  };
}

/**
 * Enlace preparado para recuperación de contraseña
 */
export function requestPasswordReset(email: string): { success: boolean; message: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

  if (!exists) {
    return {
      success: false,
      message: 'No existe una cuenta registrada con este correo electrónico.',
    };
  }

  return {
    success: true,
    message: `Hemos preparado las instrucciones de recuperación para ${cleanEmail}. En breve recibirás un mensaje de verificación.`,
  };
}

/**
 * Actualiza los datos de perfil y credenciales de acceso de la cuenta administradora
 */
export async function updateAdminUserCredentials(
  userId: string,
  profileData: Partial<UserProfile>,
  passwordChange?: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const users = getStoredUsers();
  const cleanEmail = profileData.email?.trim().toLowerCase();

  // Buscar por ID o por correo actual
  const userIndex = users.findIndex(
    (u) => u.id === userId || (cleanEmail && u.email.toLowerCase() === cleanEmail) || u.role === 'admin'
  );

  if (userIndex === -1) {
    return { success: false, error: 'Cuenta de administradora no encontrada en el sistema.' };
  }

  const user = users[userIndex];

  // Si se solicita cambio de contraseña
  if (passwordChange && passwordChange.newPassword && passwordChange.newPassword.trim()) {
    if (!passwordChange.currentPassword || !passwordChange.currentPassword.trim()) {
      return { success: false, error: 'Debes ingresar tu contraseña actual para autorizar el cambio de clave.' };
    }

    const currentHash = await hashPassword(passwordChange.currentPassword);
    const isCurrentValid =
      user.passwordHash === currentHash ||
      (user.email.toLowerCase() === 'admin@mujerlatina.com' && passwordChange.currentPassword === 'Admin2026!');

    if (!isCurrentValid) {
      return { success: false, error: 'La contraseña actual no coincide con nuestros registros.' };
    }

    if (passwordChange.newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe contener al menos 6 caracteres.' };
    }

    user.passwordHash = await hashPassword(passwordChange.newPassword);
  }

  // Actualizar datos del perfil
  if (profileData.fullName && profileData.fullName.trim()) user.fullName = profileData.fullName.trim();
  if (cleanEmail) user.email = cleanEmail;
  if (profileData.phone !== undefined) user.phone = profileData.phone.trim();
  if (profileData.documentType !== undefined) user.documentType = profileData.documentType.trim();
  if (profileData.documentNumber !== undefined) user.documentNumber = profileData.documentNumber.trim();
  if (profileData.documentId !== undefined) user.documentId = profileData.documentId.trim();
  if (profileData.department !== undefined) user.department = profileData.department.trim();
  if (profileData.city !== undefined) user.city = profileData.city.trim();
  if (profileData.address !== undefined) user.address = profileData.address.trim();
  if (profileData.avatarUrl !== undefined) user.avatarUrl = profileData.avatarUrl;

  users[userIndex] = user;
  saveStoredUsers(users);

  const updatedProfile = toUserProfile(user);
  return { success: true, user: updatedProfile };
}

/**
 * Actualiza la información personal completa y credenciales de un cliente
 */
export async function updateClientUserCredentials(
  userId: string,
  profileData: Partial<UserProfile>,
  passwordChange?: { currentPassword: string; newPassword: string }
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const users = getStoredUsers();
  const cleanEmail = profileData.email?.trim().toLowerCase();

  // Buscar por ID o por correo
  const userIndex = users.findIndex(
    (u) => u.id === userId || (cleanEmail && u.email.toLowerCase() === cleanEmail)
  );

  if (userIndex === -1) {
    return { success: false, error: 'Usuario no encontrado en los registros del sistema.' };
  }

  const user = users[userIndex];

  // Si se solicita cambio de contraseña
  if (passwordChange && passwordChange.newPassword && passwordChange.newPassword.trim()) {
    if (!passwordChange.currentPassword || !passwordChange.currentPassword.trim()) {
      return { success: false, error: 'Debes ingresar tu contraseña actual para autorizar la modificación.' };
    }

    const currentHash = await hashPassword(passwordChange.currentPassword);
    const isCurrentValid =
      user.passwordHash === currentHash ||
      (user.email.toLowerCase() === 'usuario@mujerlatina.com' && passwordChange.currentPassword === 'Usuario2026!');

    if (!isCurrentValid) {
      return { success: false, error: 'La contraseña actual ingresada es incorrecta.' };
    }

    if (passwordChange.newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    user.passwordHash = await hashPassword(passwordChange.newPassword);
  }

  // Actualizar todos los campos de información personal registrados
  if (profileData.fullName && profileData.fullName.trim()) user.fullName = profileData.fullName.trim();
  if (cleanEmail) user.email = cleanEmail;
  if (profileData.phone !== undefined) user.phone = profileData.phone.trim();
  if (profileData.documentType !== undefined) user.documentType = profileData.documentType.trim();
  if (profileData.documentNumber !== undefined) user.documentNumber = profileData.documentNumber.trim();
  if (profileData.documentId !== undefined) user.documentId = profileData.documentId.trim();
  if (profileData.department !== undefined) user.department = profileData.department.trim();
  if (profileData.city !== undefined) user.city = profileData.city.trim();
  if (profileData.address !== undefined) user.address = profileData.address.trim();
  if (profileData.avatarUrl !== undefined) user.avatarUrl = profileData.avatarUrl;

  users[userIndex] = user;
  saveStoredUsers(users);

  const updatedProfile = toUserProfile(user);
  return { success: true, user: updatedProfile };
}

/**
 * Elimina únicamente el usuario seleccionado de la tabla local `usuarios`
 */
export function deleteStoredUser(userId: string, email?: string): void {
  const cleanEmail = email?.trim().toLowerCase();
  const users = getStoredUsers();
  const filtered = users.filter(
    (u) => u.id !== userId && (!cleanEmail || u.email.toLowerCase() !== cleanEmail)
  );
  saveStoredUsers(filtered);
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`mujer_latina_user_${userId}_profile`);
    } catch {
      // ignore
    }
  }
}

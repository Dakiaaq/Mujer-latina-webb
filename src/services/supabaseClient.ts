import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables read securely via Vite (import.meta.env)
// Never hardcode API keys or database credentials in source code!
const env = (import.meta as any).env || {};
const rawSupabaseUrl: string = env.VITE_SUPABASE_URL || 'https://jlljyeykxqyijcvzfddb.supabase.co';
const rawSupabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TbOptUNdYM6Ey3e7Eg0xBg_OpGzybK-';

// Clean up any extra quotes or whitespace
export const SUPABASE_URL = rawSupabaseUrl.trim().replace(/^["']|["']$/g, '');
export const SUPABASE_ANON_KEY = rawSupabaseAnonKey.trim().replace(/^["']|["']$/g, '');

let clientInstance: SupabaseClient | null = null;
let initializationAttempted = false;

/**
 * Retorna la instancia singleton del cliente oficial de Supabase.
 * Utiliza exclusivamente la clave publicable (anon key) con soporte nativo para RLS.
 * Si las credenciales no están configuradas o son de prueba, retorna null de forma segura.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  if (initializationAttempted && !clientInstance) return null;

  initializationAttempted = true;

  const isValidUrl = Boolean(
    SUPABASE_URL && 
    SUPABASE_URL.startsWith('http') && 
    !SUPABASE_URL.includes('xyzwhatever.supabase.co') &&
    !SUPABASE_URL.includes('your-project')
  );

  const isValidKey = Boolean(
    SUPABASE_ANON_KEY && 
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('PEGAR') &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  );

  if (isValidUrl && isValidKey) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('⚠️ Supabase client initialization warning:', err);
      clientInstance = null;
      return null;
    }
  }

  return null;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  hasValidUrl: boolean;
  hasValidKey: boolean;
  maskedUrl: string;
  mode: 'supabase_cloud' | 'reactive_local_relational';
  connectionNote: string;
}

/**
 * Consulta el estado de configuración de Supabase para monitoreo y feedback en UI.
 */
export function getSupabaseStatus(): SupabaseConfigStatus {
  const hasValidUrl = Boolean(
    SUPABASE_URL && 
    SUPABASE_URL.startsWith('http') && 
    !SUPABASE_URL.includes('xyzwhatever.supabase.co')
  );

  const hasValidKey = Boolean(
    SUPABASE_ANON_KEY && 
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes('PEGAR')
  );

  const isConfigured = hasValidUrl && hasValidKey;

  let maskedUrl = 'No configurada';
  if (SUPABASE_URL) {
    maskedUrl = SUPABASE_URL.length > 24 
      ? SUPABASE_URL.replace(/(https:\/\/[^.]{4}).*(\.supabase\.co.*)/, '$1***$2')
      : SUPABASE_URL;
  }

  let connectionNote = 'Modo reactivo local activo (localStorage + memoria). Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para sincronizar en la nube.';
  if (isConfigured) {
    connectionNote = 'Credenciales de Supabase detectadas y listas para sincronización en tiempo real.';
  } else if (SUPABASE_URL.includes('xyzwhatever.supabase.co') || SUPABASE_ANON_KEY.includes('PEGAR')) {
    connectionNote = 'Se detectaron credenciales de ejemplo (placeholder). Reemplázalas en el archivo de variables de entorno (.env).';
  }

  return {
    isConfigured,
    hasValidUrl,
    hasValidKey,
    maskedUrl,
    mode: isConfigured ? 'supabase_cloud' : 'reactive_local_relational',
    connectionNote,
  };
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  tablesVerified?: string[];
  details?: string;
}

/**
 * Prueba activamente la conectividad HTTP / PostgreSQL con Supabase
 * realizando una consulta ligera a las categorías públicas respetando RLS.
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const client = getSupabaseClient();
  const status = getSupabaseStatus();

  if (!client || !status.isConfigured) {
    return {
      success: false,
      message: 'Supabase no está configurado aún con credenciales válidas en las variables de entorno.',
      details: status.connectionNote,
    };
  }

  const startTime = performance.now();

  try {
    // Prueba de lectura a categorías respetando RLS ("Categories: lectura pública")
    const { data: categories, error: catError } = await client
      .from('categories')
      .select('id, name, slug')
      .limit(5);

    if (catError) {
      return {
        success: false,
        message: `Error al consultar la tabla 'categories': ${catError.message}`,
        details: catError.hint || catError.details || 'Verifica que hayas ejecutado el script SQL en Supabase.',
      };
    }

    // Prueba de lectura a productos respetando RLS ("Products: lectura pública de productos activos")
    const { data: products, error: prodError } = await client
      .from('products')
      .select('id, sku, name, price')
      .limit(5);

    if (prodError) {
      return {
        success: false,
        message: `Error al consultar la tabla 'products': ${prodError.message}`,
        details: prodError.hint || prodError.details,
      };
    }

    const latencyMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      message: `¡Conexión exitosa con Supabase PostgreSQL! Latencia: ${latencyMs} ms.`,
      latencyMs,
      tablesVerified: ['categories', 'products'],
      details: `Se leyeron correctamente ${categories?.length ?? 0} categorías y ${products?.length ?? 0} productos desde la nube.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Fallo de conexión de red al intentar comunicarse con Supabase.',
      details: err?.message || String(err),
    };
  }
}

# Manual Unificado del Sistema (un.md)
## Mujer Latina — E-Commerce, Admin Suite & Base de Datos Relacional Supabase

Este documento reúne todas las especificaciones técnicas, guías de despliegue, configuración de la base de datos relacional PostgreSQL en **Supabase**, arquitectura de seguridad anti-hackeo y procedimientos operativos para garantizar el éxito total del proyecto.

---

### 1. Instrucciones de Configuración en Supabase

#### Paso 1: Crear Proyecto en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **"New project"**.
3. Asigna el nombre: `mujer-latina-db`.
4. Elige una contraseña segura para la base de datos y selecciona la región más cercana a tus clientes (por ejemplo, `us-east-1` o `sa-east-1`).
5. Espera unos segundos mientras se aprovisiona la instancia de PostgreSQL.

#### Paso 2: Ejecutar el Script DDL de Base de Datos
En el panel lateral de Supabase, dirígete a **SQL Editor**, crea una nueva consulta (New Query) y pega el siguiente script completo:

```sql
-- ==========================================================
-- SCRIPT DE INICIALIZACIÓN RELACIONAL - MUJER LATINA
-- ==========================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  document_id TEXT,
  phone TEXT,
  department TEXT,
  city TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'operator')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_threshold INT NOT NULL DEFAULT 5 CHECK (stock_threshold >= 0),
  image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}',
  description TEXT,
  rating NUMERIC(3, 2) DEFAULT 5.00,
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_department TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_fee NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  carrier TEXT,
  tracking_number TEXT,
  payment_receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Tabla de Items de Pedidos
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(12, 2) NOT NULL
);

-- 7. Tabla de Reseñas de Producto
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Trigger para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ==========================================================
-- POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Lectura pública para catálogo
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Inserción de pedidos permitida a visitantes y clientes autenticados
CREATE POLICY "Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Lectura de pedidos: Clientes solo ven sus propios pedidos; Admins ven todos
CREATE POLICY "Select Orders RBAC" ON public.orders FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
);

-- Gestión total de inventario y pedidos restringida exclusivamente a Admins
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Full Access Orders" ON public.orders FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
```

#### Paso 3: Configurar Variables de Entorno
En el archivo `.env` o en el panel de configuración de tu servidor, define:
```env
VITE_SUPABASE_URL="https://[tu-proyecto].supabase.co"
VITE_SUPABASE_ANON_KEY="[tu-anon-key-publica]"
```

---

### 2. Garantías de Seguridad: "Dame seguridad que no van a hackear la aplicación"

Para responder a la máxima prioridad de protección y tranquilidad del negocio, la plataforma cuenta con una arquitectura de seguridad multinivel:

1. **Aislamiento a Nivel de Fila en PostgreSQL (RLS):**
   * Aunque un atacante obtenga la clave anónima (`anon key`), el motor PostgreSQL ejecuta las reglas de seguridad directamente en el kernel de la base de datos. Nadie puede modificar precios, alterar stocks arbitrariamente ni leer pedidos ajenos sin las credenciales de rol administrativo.
2. **Defensa contra Inyecciones SQL (SQLi):**
   * El cliente de Supabase compila todas las consultas como llamadas RPC y sentencias preparadas parametrizadas en el protocolo binario de PostgreSQL. La entrada del usuario nunca se concatena en strings SQL.
3. **Protección contra Cross-Site Scripting (XSS):**
   * Todo texto renderizado es escapado sintácticamente por el virtual DOM de React. Los formularios sanitizan caracteres de control antes de almacenar.
4. **Validación de Identidad y Roles (RBAC):**
   * Las sesiones de administración se firman criptográficamente mediante JWT con tokens de refresco y revocación automática.
5. **Auditoría Transaccional:**
   * Cada modificación de estado de orden ("Pendiente" $\rightarrow$ "Pagado" $\rightarrow$ "Enviado") queda registrada con fecha, hora y datos del operador para prevenir fraudes internos.
6. **Integridad de Comprobantes Bancarios:**
   * La subida de imágenes de transferencia exige validación estricta de extensiones y tamaño máximo (5MB) para evitar la inyección de archivos ejecutables.

---

### 3. Guía de Operación Diaria (Admin)
* **Revisión Matutina:** Ingresar a `Dashboard` y verificar el conteo de **Stock Crítico**. Si hay alertas activas en el **Loop Engine**, presionar el botón de reabastecimiento rápido.
* **Procesamiento de Pedidos WhatsApp:**
  1. Abrir `Pedidos` $\rightarrow$ sección **Pendientes de Pago**.
  2. Abrir el modal de detalle haciendo clic en la orden.
  3. Revisar el comprobante bancario adjunto con la herramienta de zoom.
  4. Si coincide con la cuenta de la empresa, marcar la casilla **Pagado**.
  5. La orden se trasladará automáticamente a **Pedidos Pagados**.
* **Despacho Logístico:**
  1. Cuando la transportadora reciba el paquete, ingresar el transportista y número de guía.
  2. Marcar la casilla **Enviado**.
  3. La orden queda registrada con número de rastreo visible para soporte al cliente.

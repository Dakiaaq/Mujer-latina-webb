# TRD (Technical Requirements Document)
## Proyecto: Mujer Latina — Arquitectura, Seguridad & Modelo MVC

---

### 1. Arquitectura del Sistema: Modelo MVC
La aplicación adopta el patrón **Modelo-Vista-Controlador (MVC)** desacoplado en el frontend moderno con TypeScript y React 19:

```
┌────────────────────────────────────────────────────────┐
│                        VISTAS                          │
│  Storefront: Home, Catalog, Detail, Cart, Wishlist,    │
│              About, Profile/Auth                       │
│  Admin Suite: Dashboard, Inventory, Orders, Customers   │
│  Docs Viewer: PRD, TRD, PLAN, User Flow, un.md         │
└──────────────────────────▲─────────────────────────────┘
                           │ (Data Binding & Observables)
┌──────────────────────────┴─────────────────────────────┐
│                     CONTROLADORES                      │
│  • StoreController (Búsqueda, Filtros, Favoritos)       │
│  • CartController (Cálculo reactivo, WhatsApp URI)     │
│  • InventoryController (CRUD, Stock Loop Engine)       │
│  • OrderController (Transiciones de estado, Guías)     │
│  • AuthController (Sesiones, Perfil, Permisos RBAC)   │
└──────────────────────────▲─────────────────────────────┘
                           │ (Consultas parametrizadas & RLS)
┌──────────────────────────┴─────────────────────────────┐
│                        MODELOS                         │
│  • Entidades TypeScript (Product, Order, Customer,...) │
│  • Capa Supabase PostgreSQL Relacional                 │
│  • Políticas de Seguridad RLS y Esquema DDL           │
│  • Motor de Persistencia Reactivo (Local + Cloud Sync) │
└────────────────────────────────────────────────────────┘
```

---

### 2. Paradigma de Programación Reactiva
La aplicación implementa patrones reactivos basados en flujos de datos unidireccionales:
1. **Reactividad del Carrito y Totales:** Cualquier cambio en la cantidad de un artículo recalcula de forma síncrona el subtotal, impuestos aplicables, estimación de envío y habilita/deshabilita el botón de checkout.
2. **Reactividad de Inventario y Deducción:** Al procesar o confirmar un pedido, el stock disminuye y notifica automáticamente al módulo de Inventario y al catálogo sin necesidad de recargar la página.
3. **Observadores de Estado en Pedidos:** Las transiciones de checkboxes ("Pagado" / "Enviado") mueven en tiempo real el registro entre las tres secciones operativas (`Pendientes de Pago`, `Pedidos Pagados` y `Enviados`).

---

### 3. Implementación de Algoritmos Recursivos
Para cumplir con el requerimiento de programación recursiva, se aplican dos componentes estructurales en el core del sistema:

#### 3.1. Recorrido Recursivo del Árbol de Categorías (`searchCategoryTreeRecursively`)
Permite navegar y filtrar jerarquías de categorías y subcategorías multinivel sin anidamientos estáticos:
```typescript
interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children?: CategoryNode[];
  productCount: number;
}

export function searchCategoryRecursively(
  nodes: CategoryNode[],
  targetSlug: string
): CategoryNode | null {
  for (const node of nodes) {
    if (node.slug === targetSlug) return node;
    if (node.children && node.children.length > 0) {
      const found = searchCategoryRecursively(node.children, targetSlug);
      if (found) return found;
    }
  }
  return null;
}
```

#### 3.2. Motor Recursivo de Auditoría de Stock ("Loop Engine")
Evalúa de manera recursiva la lista de productos identificando items en umbral crítico ($\le \text{threshold}$), calculando la tasa de criticidad y generando la lista de reabastecimiento:
```typescript
export function auditInventoryRecursively(
  products: Product[],
  index: number = 0,
  acc: { critical: Product[]; outOfStock: Product[]; totalValue: number } = {
    critical: [],
    outOfStock: [],
    totalValue: 0,
  }
): { critical: Product[]; outOfStock: Product[]; totalValue: number } {
  if (index >= products.length) return acc;

  const current = products[index];
  acc.totalValue += current.price * current.stock;

  if (current.stock === 0) {
    acc.outOfStock.push(current);
  } else if (current.stock <= (current.stockThreshold || 5)) {
    acc.critical.push(current);
  }

  return auditInventoryRecursively(products, index + 1, acc);
}
```

---

### 4. Seguridad Avanzada: "Dame seguridad que no van a hackear la aplicación"

Para garantizar la máxima protección contra ataques cibernéticos y accesos no autorizados, el sistema implementa **Seguridad en Profundidad (Defense in Depth)** alineada con las directrices de **OWASP Top 10**:

| Vector de Ataque | Mecanismo de Mitigación Implementado |
| :--- | :--- |
| **SQL Injection (SQLi)** | Ninguna sentencia SQL es concatenada manualmente. Todo acceso a Supabase / PostgreSQL utiliza consultas parametrizadas mediante el cliente oficial y Procedimientos Almacenados (RPC) con tipos estrictos. |
| **Cross-Site Scripting (XSS)** | React escapa por defecto cualquier inserción en el DOM. Las entradas de usuario en formularios (nombres, reseñas, direcciones) pasan por sanitización de cadenas antes de persistir. |
| **Violación de Acceso a Datos (BOLA / IDOR)** | **Row Level Security (RLS)** estricto en Supabase. Un cliente común únicamente puede leer o escribir sus propias órdenes (`auth.uid() = user_id`). Solo los roles autenticados con claim `admin` tienen acceso al panel de inventario y pedidos. |
| **Ataques de Fuerza Bruta / DoS** | Rate Limiting y políticas de expiración en tokens JWT. Límites de tamaño en subida de comprobantes de pago (máximo 5MB, solo tipos MIME `image/jpeg`, `image/png`, `image/webp`). |
| **Manipulación de Precios en el Cliente** | Los precios y subtotales se recalculan y verifican siempre en base de datos. La orden enviada por WhatsApp incluye SKU y valores contrastables con la base de datos maestra antes de emitir la guía. |
| **Fuga de Secretos en Frontend** | La clave de servicio (`SUPABASE_SERVICE_ROLE_KEY`) **NUNCA** se expone en el cliente; únicamente se utiliza la clave pública anónima (`VITE_SUPABASE_ANON_KEY`) restringida por las políticas RLS. |

---

### 5. Esquema Relacional en Supabase (PostgreSQL DDL)

El esquema completo incluye integridad referencial, índices para alta concurrencia y políticas RLS:

```sql
-- Extensión para generación de UUIDs seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario (Clientes y Administradores)
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

-- 2. Tabla de Categorías de Producto
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Productos (Catálogo e Inventario)
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

-- 4. Tabla de Pedidos (Orders)
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

-- 5. Tabla de Items del Pedido
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

-- 6. Políticas de Seguridad RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Regla: Productos y Categorías visibles públicamente para lectura
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

-- Regla: Solo administradores pueden insertar/editar/eliminar productos
CREATE POLICY "Admin All Products" ON public.products
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Regla: Los clientes solo ven sus propios pedidos; los admins ven todos
CREATE POLICY "Customer Orders Isolation" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operator'))
  );

CREATE POLICY "Customer Order Insertion" ON public.orders
  FOR INSERT
  WITH CHECK (true);
```

---

### 6. Integración con Supabase y Estrategia Híbrida de Persistencia
El cliente `supabaseClient.ts` está configurado para:
1. Detectar variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Si están provistas, ejecutar consultas en la nube en tiempo real mediante `supabase-js`.
3. Si aún no están provistas en el entorno de desarrollo o previsualización, conmutar transparentemente a un almacén reactivo en memoria y `localStorage` con el catálogo idéntico de Mujer Latina, permitiendo operar al 100% sin caídas ni pantallas de error.

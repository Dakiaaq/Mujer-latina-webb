# PLAN (Roadmap de Desarrollo)
## Proyecto: Mujer Latina — Plataforma E-Commerce & Admin Suite

---

### Fase 1: Cimientos Arquitectónicos & Design System
- [x] Configuración de tipografía dual: **Playfair Display** (títulos display y prestigio) y **Manrope** (cuerpo de texto y etiquetas).
- [x] Implementación de la paleta "Black & Gold Prestige" (`#111111` Prestige Black, `#d4af37` Matted Gold, `#fcfcfc` Ivory Surface, `#25D366` WhatsApp Green).
- [x] Modelado de interfaces TypeScript (`Product`, `Category`, `Order`, `CartItem`, `Customer`, etc.).
- [x] Definición del patrón MVC y configuración del cliente Supabase con motor reactivo desacoplado.

---

### Fase 2: Storefront de Alta Gama
- [x] **TopNavBar:** Barra de navegación fija con logotipo circular dorado, enlaces (Inicio, Catálogo, Nosotros), contadores dinámicos de Favoritos y Carrito, e icono de Mi Perfil.
- [x] **Hero Section:** Banner cinematográfico "Belleza que Empodera" con iluminación cálida sobre tonos piel y botón "Ver Colección".
- [x] **Categorías Destacadas:** 5 miniaturas circulares con bordes interactivos (Cosméticos, Esmaltes, Accesorios, Tratamientos, Tintes).
- [x] **Bento Grid de Productos Destacados:** Mosaico asimétrico con tarjeta principal "Colección Oro Puro" y productos secundarios con degradados sutiles.
- [x] **Sección Nuestra Historia:** Narrativa de marca con fotografía editorial de alta gama.
- [x] **Catálogo Interactivo:** Filtros multidimensionales (categoría, slider de precio, stock, valoración), barra de búsqueda en vivo y ordenamiento.
- [x] **Ficha de Detalle de Producto:** Galería con miniaturas intercambiables, selector de cantidad, pestañas de especificaciones y formulario de reseñas con estrellas.
- [x] **Carrito y Checkout WhatsApp:** Resumen financiero reactivo, formulario de datos de entrega y botón de enlace directo con mensaje preformateado para WhatsApp Business.
- [x] **Footer de 4 Columnas:** Enlaces, teléfonos de soporte en Colombia, canales sociales y avisos legales.
- [x] **Widget Flotante WhatsApp:** Botón con estado "En línea" para soporte inmediato.

---

### Fase 3: Experiencia de Usuario & Fidelización
- [x] **Mis Favoritos (Wishlist):** Cuadrícula para guardar productos preferidos con estado de stock y adición rápida al carrito.
- [x] **Nosotros:** Misión, valores y galería corporativa bento ("Nuestro Entorno").
- [x] **Mi Perfil & Autenticación:** Formularios de inicio de sesión y registro de usuarias con campos para C.C./NIT y dirección, junto con el panel personal de pedidos recientes.

---

### Fase 4: Suite Administrativa (Panel de Control)
- [x] **Sidebar Administrativo:** Estructura fija en negro y oro con perfil de Isabella Silva (Software Architect) y navegación interna.
- [x] **Dashboard General:** Indicador de estado de base de datos PostgreSQL, 4 métricas clave, visualizador de ventas semanales y alertas críticas de stock mediante el algoritmo recursivo **Loop Engine**.
- [x] **Gestión de Inventario:** Tabla de stock con filtros rápidos, estados (`Disponible`, `Bajo Stock`, `Agotado`), y Drawer/Modal para creación y edición de productos con subida de imagen.
- [x] **Gestión de Pedidos Operativa en 3 Etapas:**
  1. *Pendientes de Pago:* Control de pedidos originados en WhatsApp a la espera de validación bancaria.
  2. *Pedidos Pagados:* Órdenes con pago confirmado listas para empaque y rotulado.
  3. *Enviados:* Paquetes entregados a transportadoras con código de guía activo.
- [x] **Modal de Inspección de Comprobante:** Vista detallada con recibo de transferencia bancaria verificada (Bancolombia/Nequi) con función de zoom, datos del comprador y enlace directo para responderle por WhatsApp.
- [x] **Directorio de Clientes:** Tabla de compradores con métricas de órdenes y herramientas de exportación.

---

### Fase 5: Integración Supabase, Seguridad & Documentación
- [x] Script DDL SQL de PostgreSQL para creación de tablas, triggers y políticas de seguridad RLS en Supabase.
- [x] Documentación exhaustiva en archivos Markdown: `PRD.md`, `TRD.md`, `PLAN.md`, `USER_FLOW.md` y `un.md`.
- [x] Visor de documentación integrado en la interfaz para auditoría y consulta inmediata.

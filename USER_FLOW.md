# USER FLOW (Flujos de Navegación)
## Proyecto: Mujer Latina — Tienda & Suite Administrativa

---

### Flujo 1: Navegación, Selección y Compra por WhatsApp (Cliente)
```
[Página de Inicio (Home)]
         │
         ├──► Clic en "Ver Colección" o Categoría Destacada (ej. Cosméticos)
         │
         ▼
[Catálogo de Productos]
         │
         ├──► Aplica filtros (Categoría, Precio $0-$200, Disponibilidad, Valoración)
         ├──► Búsqueda por texto ("Argán", "Labial")
         │
         ▼
[Tarjeta de Producto] ──► Clic en imagen / título
         │
         ▼
[Detalle de Producto]
         ├──► Interactúa con galería de miniaturas
         ├──► Lee descripción y reseñas
         ├──► Selecciona cantidad deseada (+ / -)
         ├──► Deja su propia valoración y comentario
         └──► Clic en "Añadir al Carrito"
                   │
                   ▼
         [Carrito de Compras]
                   ├──► Revisa lista de artículos y subtotales
                   ├──► Completa formulario de envío (Nombre, Teléfono, Depto, Ciudad, Dirección)
                   └──► Clic en "Procesar pedido por WhatsApp"
                             │
                             ▼
                   [Apertura de WhatsApp Oficial]
                   (Mensaje pre-estructurado con detalle del pedido, total y dirección)
```

---

### Flujo 2: Gestión de Favoritos (Wishlist)
```
[Catálogo o Detalle de Producto]
         │
         └──► Clic en icono de corazón ♡ (Favoritos)
                   │
                   ▼
         [Contador reactivo en TopNavBar se incrementa (+1)]
                   │
                   ▼
         [Página "Mis Favoritos"]
                   ├──► Ver productos guardados con estado de stock
                   ├──► Clic en "Añadir al Carrito" (pasa directo al carrito)
                   └──► Clic en "X" para quitar de favoritos
```

---

### Flujo 3: Registro y Consulta de Perfil
```
[TopNavBar] ──► Clic en icono de usuario
         │
         ▼
[Pantalla de Autenticación]
         ├──► Modo "Iniciar Sesión" (Correo y Contraseña)
         └──► Modo "Crear Cuenta" (Nombre, C.C./NIT, Teléfono, Depto, Ciudad, Dirección, Contraseña)
                   │
                   ▼
         [Dashboard de Mi Perfil]
                   ├──► Datos personales y dirección de despacho predeterminada
                   └──► Historial de pedidos recientes con estados (Entregado, Finalizado)
```

---

### Flujo 4: Operación Administrativa de Pedidos & Validación Bancaria (Admin)
```
[Admin Suite] ──► Módulo "Pedidos"
         │
         ▼
[Tablero de Control Operativo en 3 Fases]
         │
         ├──► FASE 1: "Pendientes de Pago" (Pedidos ingresados vía WhatsApp)
         │       ├── Clic en "Detalle →" o en la fila
         │       ▼
         │    [Modal Detalle de Pedido]
         │       ├── Visualiza comprobante bancario (Bancolombia, Nequi) con zoom
         │       ├── Si el comprobante es válido ──► Marca checkbox "Pagado"
         │       └── Guarda cambios
         │               │
         │               ▼
         ├──► FASE 2: "Pedidos Pagados" (El pedido se mueve automáticamente aquí)
         │       ├── Bodega alista los productos
         │       ├── Selecciona transportadora (Envía, Servientrega, Coordinadora)
         │       ├── Ingresa número de guía
         │       └── Marca checkbox "Enviado"
         │               │
         │               ▼
         └──► FASE 3: "Enviados" (El pedido pasa a tracking activo con guía)
```

---

### Flujo 5: Gestión de Inventario & Alerta Recursiva (Admin)
```
[Admin Suite] ──► Módulo "Inventario"
         │
         ├──► Visualiza KPIs: Total Productos, Bajo Stock, Agotados
         ├──► Consulta de productos con alertas en tiempo real
         │
         ├──► Clic en "+ Agregar Producto"
         │       ▼
         │    [Drawer / Modal "Nuevo Producto"]
         │       ├── Sube imagen
         │       ├── Define SKU, Nombre, Categoría, Precio, Stock Inicial y Umbral
         │       └── Guarda producto ──► Aparece de inmediato en Catálogo e Inventario
         │
         └──► Clic en "Editar" sobre cualquier producto
                 ▼
              [Drawer / Modal "Editar Producto"]
                 ├── Modifica stock, precio o descripción
                 └── Guarda cambios ──► Loop Engine recalcula criticidad al instante
```

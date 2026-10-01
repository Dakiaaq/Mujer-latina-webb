# PRD (Product Requirements Document)
## Proyecto: Mujer Latina — Plataforma E-Commerce & Admin Suite

### 1. Visión y Propósito del Producto
**Mujer Latina** es una marca de alta gama dedicada a resaltar la fuerza, belleza y sofisticación de la mujer latina a través de cosméticos, tratamientos capilares, esmaltes y accesorios de lujo accesible.
La plataforma combina una experiencia de compra elegante y fluida con un flujo transaccional adaptado al mercado hispanohablante (orden directa y confirmación por WhatsApp con verificación de comprobante bancario), complementado por una **Suite Administrativa Integral** para el control de inventario, sincronización de stock y auditoría de pedidos.

---

### 2. Objetivos de Negocio y Métricas de Éxito (KPIs)
1. **Conversión Fluida:** Permitir que las clientas armen su carrito en segundos y transfieran la orden formateada con datos de envío a WhatsApp Business con 1 solo clic.
2. **Reducción de Fricción en Pagos:** Implementar un módulo de carga y verificación visual de comprobantes de transferencia (Bancolombia, Nequi, Daviplata, etc.) en el panel administrativo.
3. **Gestión de Stock en Tiempo Real:** Alertar preventivamente sobre productos con stock crítico ($\le 5$ unidades) usando un motor recursivo de supervisión (Loop Engine).
4. **Seguridad y Confianza del Consumidor:** Garantizar la integridad de los datos, protección contra accesos no autorizados y respaldo en base de datos relacional PostgreSQL (Supabase).

---

### 3. Audiencia Objetivo & Arquetipos de Usuario
* **Cliente Final (Consumidora Latina):** Busca productos auténticos, formulados para su tono de piel y texturas capilares. Valora la estética refinada, fotos en alta resolución, reseñas verificadas y asistencia personalizada vía WhatsApp.
* **Administrador / Operador de Tienda (Isabella Silva & Equipo):** Requiere un panel ágil y claro para validar pagos, cambiar estados de pedidos (Pendiente WA $\rightarrow$ Confirmado $\rightarrow$ Enviado), generar guías de transporte y actualizar inventario en segundos.

---

### 4. Especificación Funcional de Módulos (Storefront)
#### 4.1. Página de Inicio (Home)
* **Navbar Superior:** Fijado en negro prestigio (`#111111`) con acentos dorados (`#d4af37`). Logotipo con emblema circular, enlaces de navegación (Inicio, Catálogo, Nosotros), contadores reactivos de Favoritos, Carrito y acceso a Mi Perfil.
* **Hero Banner:** Retrato editorial de alta definición con iluminación cálida dorada, título display "Belleza que Empodera", descripción y botón de llamado a la acción "Ver Colección".
* **Categorías Destacadas:** Carrusel/grid circular interactivo con zoom suave (Cosméticos, Esmaltes, Accesorios, Tratamientos, Tintes).
* **Productos Destacados (Bento Grid Asimétrico):** Tarjeta hero dominante ("Colección Oro Puro") y tarjetas secundarias ("Labial Velvet Intenso", "Serum Revitalizante") con tipografía Playfair Display y precios claros.
* **Nuestra Historia:** Reseña de marca acompañada de fotografía corporativa de empoderamiento femenino y botón "Conoce Más".
* **Widget Flotante WhatsApp:** Botón verde (`#25D366`) con badge pulsante "En línea: ¿Necesitas ayuda? Chatea con nosotros".
* **Footer Institucional:** 4 columnas (Identidad de marca, Enlaces útiles, Canales de soporte oficial con números telefónicos de Colombia, Redes sociales Facebook e Instagram, Términos y Privacidad).

#### 4.2. Catálogo Interactivo & Filtros
* **Filtros Laterales Reactivos:**
  * Categorías con conteo dinámico.
  * Selector de rango de precio continuo ($0 a $200+ USD / COP).
  * Filtro de disponibilidad ("En Stock", "Promociones").
  * Calificación por estrellas ($\ge 4$ estrellas).
* **Barra de Herramientas:** Búsqueda en tiempo real por nombre/SKU y selector de ordenamiento (Relevancia, Menor precio, Mayor precio, Novedades).
* **Grid de Productos:** Tarjetas con botón de favoritos, imagen optimizada, calificación acumulada, badges dinámicos ("Bajo Stock", "Agotado", "Nuevo"), botón directo "Añadir al Carrito".
* **Paginación:** Navegación por páginas numeradas con control previo/siguiente.

#### 4.3. Detalle de Producto
* **Breadcrumb de Navegación:** `Inicio > Catálogo > [Nombre del Producto]`.
* **Galería Interactiva:** Imagen principal con transiciones suaves y 4 miniaturas con borde dorado activo al ser seleccionadas.
* **Panel de Compra:** Título display, estrellas de valoración con número de reseñas, precio destacado, descripción sensorial, selector numérico de cantidad (- 1 +), botón "Añadir al Carrito", botón "Añadir a Lista de Deseos" y sellos de confianza (Envío gratis, Garantía de calidad).
* **Pestañas de Información:** "Descripción Detallada", "Especificaciones" y "Reseñas de Clientes".
* **Formulario de Reseñas:** Selector de puntuación por estrellas, campos de nombre y comentario, botón "Enviar Reseña" con confirmación inmediata.
* **Sección de Productos Relacionados:** Carrusel de recomendaciones afines.

#### 4.4. Carrito de Compras & Checkout WhatsApp
* **Lista de Artículos:** Imagen en miniatura, nombre, categoría, precio unitario, botones de incremento/decremento y botón de eliminación (X).
* **Resumen de Pedido:** Subtotal calculado de forma reactiva, desglose de envío, total estimado con acento dorado.
* **Formulario de Despacho:** Nombre completo, teléfono, selector de departamentos (Guatemala / Colombia según moneda), ciudad y dirección exacta con validación de campos obligatorios.
* **Procesamiento de Pedido por WhatsApp:** Generación automática de mensaje estructurado codificado en URI con listado de items, cantidad, precios, total y dirección de entrega, abriendo la API oficial de WhatsApp.

#### 4.5. Lista de Favoritos (Mis Favoritos ♡)
* Visualización en cuadrícula bento de productos guardados con persistencia local o vinculada a cuenta.
* Acciones rápidas: "Añadir al Carrito", botón "Avisarme" para productos agotados y eliminación rápida.
* Estado vacío ilustrado con enlace directo al catálogo.

#### 4.6. Módulo "Nosotros"
* Reseña fundacional, retrato de fundadora y tarjetas de "Misión y Propósito" (Belleza Auténtica, Calidad Premium, Comunidad).
* Galería corporativa "Nuestro Entorno" mostrando laboratorio, formulación cosmética, sesiones de equipo y detalles de producto.

#### 4.7. Mi Perfil / Autenticación
* Selector entre inicio de sesión y registro de cuenta con campos completos (C.C./NIT, teléfono, dirección, ciudad).
* Dashboard de cliente: Resumen de datos de contacto, libreta de direcciones y pedidos recientes con estado ("Entregado", "Finalizado").

---

### 5. Especificación Funcional de la Suite Administrativa (Admin)
* **Barra Lateral Negra y Dorada:** Acceso a Dashboard, Inventario, Pedidos, Clientes, Configuración y Cierre de Sesión. Indicador del usuario activo ("Isabella Silva - Software Architect").
* **Dashboard Operativo:**
  * Indicador en vivo de estado de base de datos (`PostgreSQL / Supabase Online`).
  * Tarjetas KPI: Ventas Totales acumuladas, Pedidos del mes, Stock Crítico ($\le 5$), Pedidos de la semana con comparativa porcentual.
  * Alertas de Stock Crítico (Loop Engine) con botón de reabastecimiento rápido.
  * Visualizador de desempeño semanal de ventas por días (Lunes a Domingo) con exportación a CSV.
* **Gestión de Inventario:**
  * Tabla con filtro, búsqueda en tiempo real, SKU, categoría, precio, stock y estado badge (`Disponible`, `Bajo Stock`, `Agotado`).
  * Modal/Drawer lateral "Nuevo Producto" y "Editar Producto" con previsualización de imagen, SKU autogenerable, categoría, precio, stock inicial, umbral de alerta y descripción.
  * Acciones CRUD inmediatas con persistencia.
* **Gestión de Pedidos en 3 Fases Operativas:**
  1. *Pendientes de Pago:* Pedidos recibidos por WhatsApp sin comprobante bancario validado. Permite subir o inspeccionar el comprobante.
  2. *Pedidos Pagados:* Órdenes con pago verificado listas para empaque y despacho logístico.
  3. *Enviados:* Paquetes entregados a transportadora (Envía, Servientrega, Coordinadora, etc.) con número de guía visible.
  * *Modal Detalle de Pedido:* Inspección visual de la transferencia bancaria (soporta zoom a pantalla completa), datos del cliente con botón directo de chat de WhatsApp, desglose de items y botón de guardar cambios de estado.
* **Gestión de Clientes:** Tabla con historial de compradores, pedidos acumulados y opciones de exportación.

---

### 6. Criterios de Calidad y No Negociables
* **Fidelidad Estética Total:** Estricto cumplimiento del Design System "Black & Gold Prestige" con tipografías Playfair Display y Manrope, bordes matemáticos calculados y cero clichés de IA.
* **Responsividad Completa:** Diseño fluido desde teléfonos móviles (360px) hasta pantallas 4K.
* **Sin Dependencia Forzada de API Externa para Demostración:** El sistema opera con base de datos reactiva desacoplada que funciona de inmediato en el preview, y se enlaza de forma nativa a Supabase mediante variables de entorno.

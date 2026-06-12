# Vitis & Byte 🍷

> Plataforma e-commerce de vinos y licores con cálculo fiscal mexicano (IEPS + IVA), pagos con PayPal y emisión de recibos CFDI.

---

## Descripción general

**Vitis & Byte** (Vinoteca) es una aplicación full-stack de comercio electrónico para la venta de vinos y licores. Integra catálogo público, carrito con checkout, historial de pedidos, panel de administración de inventario y gestión de perfil/direcciones del usuario.

Incluye autenticación basada en JWT, control de roles (cliente / administrador), integración de pagos con **PayPal** (sandbox) y generación de un **CFDI 4.0** que se envía por correo al completar la compra. El cálculo de precios aplica la cascada fiscal mexicana con **IEPS variable** según la graduación alcohólica del producto.

---

## Módulos del sistema

| Módulo | Funcionalidad |
|---|---|
| Autenticación | Registro, login y gestión de perfil con JWT (8 h) y bcrypt |
| Catálogo | Listado de productos con filtros por categoría, búsqueda y disponibilidad |
| Carrito y checkout | Carrito reactivo, selección de dirección y pago con PayPal en la misma vista |
| Pedidos | Historial de órdenes del usuario con detalle por compra |
| Recibo CFDI | Generación de CFDI 4.0 y envío por correo como XML adjunto |
| Inventario (admin) | CRUD de productos con *soft delete*, protegido por rol administrador |
| Perfil | Edición de datos, gestión de direcciones (máx. 4) y eliminación de cuenta |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 21 (componentes standalone, signals, HttpClient con `withFetch`) |
| Backend | Express.js 5 (Node.js, CommonJS) |
| Base de datos | MySQL (esquema `VITISBYTE`), vía `mysql2` |
| Autenticación | JWT (8 h) + bcrypt (12 rondas) |
| Pagos | PayPal REST API (sandbox) |
| Correo / Facturación | Nodemailer + Gmail; generación de CFDI 4.0 (XML) |
| Control de versiones | Git / GitHub |

---

## Reglas de negocio destacadas

- **Cálculo fiscal (cascada con IEPS variable):** la tasa de IEPS depende de la graduación alcohólica:
  - ≤ 14° → 26.5 %
  - ≤ 20° → 30 %
  - \> 20° → 53 %
  - Fórmula: `precio_neto × (1 + tasaIEPS) × 1.16`
- **Reducción de stock al capturar el pago**, no al agregar al carrito.
- **Dirección de entrega como snapshot:** la orden guarda la dirección en texto plano tal como estaba al comprar.
- **Soft delete en inventario:** desactivar un producto hace `activo = 0` (no se borra la fila).
- **Resiliencia del pago:** si PayPal cobra pero falla el guardado en BD, no se bloquea al comprador.

---

## Esquema de base de datos (MySQL)

```
usuarios ──< ordenes ──< orden_detalle >── productos
   │           │
   │           ├──< pagos
   │           └──> direccion_entrega (snapshot de texto)
   │
   └──< direcciones
```

**Tablas principales:**
- `usuarios` — id, nombre, email, password_hash, rol (`administrador` | `cliente`), activo
- `productos` — sku, nombre, categoría, graduación_alcohólica, precio_neto, stock, activo
- `ordenes` — folio, estado, totales, paypal_order_id, direccion_entrega (snapshot)
- `orden_detalle` — líneas de productos por orden
- `pagos` — un registro por captura exitosa de PayPal (incluye el JSON crudo)
- `direcciones` — direcciones de envío del usuario (máximo 4, validadas en backend)

---

## Estructura del repositorio

```
vinoteca/
├── backend/                  # API Express.js
│   └── src/
│       ├── app.js            # Configuración de Express, CORS y montaje de rutas
│       ├── server.js         # Punto de entrada del servidor
│       ├── controllers/      # Lógica por recurso (auth, productos, ordenes, paypal, ...)
│       ├── routes/           # Definición de endpoints /api/*
│       ├── services/         # PayPal, CFDI, email y persistencia de órdenes
│       ├── middlewares/      # Verificación de JWT y de rol administrador
│       └── config/           # Conexión MySQL y credenciales de PayPal
├── src/                      # Frontend Angular
│   └── app/
│       ├── components/       # auth, catálogo, carrito, pedidos, inventario, perfil
│       ├── services/         # Servicios HTTP y estado reactivo (signals)
│       ├── guards/           # authGuard, adminGuard, clienteGuard
│       └── models/           # Interfaces (Product, ...)
└── README.md
```

---

## Cómo ejecutar

### Requisitos previos

- Node.js 18+ y npm
- Servidor MySQL con el esquema `VITISBYTE` creado
- Credenciales de PayPal (sandbox) y una cuenta de Gmail con *app password* para el envío de correos

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Ulmac19/ViniedoCentral.git
cd ViniedoCentral

# 2. Configurar el backend
cd backend
npm install
# Crear el archivo .env (ver sección Variables de entorno) y luego:
npm start          # API en http://localhost:3000

# 3. Configurar el frontend (en otra terminal, desde la raíz del proyecto)
npm install
npm start          # App en http://localhost:4200
```

> Ambos servidores deben estar corriendo simultáneamente para tener la funcionalidad completa.

### Variables de entorno (`backend/.env`)

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_NAME=VITISBYTE
DB_PASSWORD=
PAYPAL_CLIENT_ID=<sandbox client id>
PAYPAL_CLIENT_SECRET=<sandbox secret>
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
JWT_SECRET=super_secreto_vitisbyte
EMAIL_USER=vitisbyte@gmail.com
EMAIL_PASS=<app password de Gmail>
EMAIL_FROM=Vinoteca <vitisbyte@gmail.com>
```

---

## Comandos útiles

| Comando | Ubicación | Acción |
|---|---|---|
| `npm start` | raíz | Servidor de desarrollo Angular (`http://localhost:4200`) |
| `npm run build` | raíz | Build de producción del frontend |
| `npm test` | raíz | Pruebas unitarias |
| `npm start` | `backend/` | Inicia la API en `http://localhost:3000` |

---

## Decisiones de diseño destacadas

- **Angular moderno** — componentes standalone y estado reactivo con `signal()` / `computed()`, sin `NgModule`.
- **Separación por capas en el backend** — rutas → controladores → servicios, con transacciones MySQL para mantener atómica la creación y captura de órdenes.
- **Seguridad por rol** — middlewares de JWT y de administrador en el backend; guards equivalentes en el frontend.
- **Cumplimiento fiscal mexicano** — IEPS variable e IVA en cascada, con emisión de CFDI 4.0 (para fines académicos, sin validez ante el SAT).

---

## Estado del proyecto

🟢 **Funcional** — Aplicación operativa en entorno de desarrollo con PayPal en modo sandbox.

---

## Autores

Tecnólogos en Desarrollo de Software — CETI Colomos

**Ulises Alberto Macías Ramírez**
[LinkedIn](https://www.linkedin.com/in/ulmac19) · [GitHub](https://github.com/Ulmac19)

**Daniel Eduardo Pelayo Gómez**
[LinkedIn](https://www.linkedin.com/in/daniel-pelayo-4097ab414) · [GitHub](https://github.com/Pelayo04)

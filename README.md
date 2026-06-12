[README_VitisAndByte.md](https://github.com/user-attachments/files/28676814/README_VitisAndByte.md)
# Vitis & Byte 🍷

> Sistema ERP y plataforma e-commerce diseñados específicamente para el sector vitivinícola.

---

## Descripción general

**Vitis & Byte** es una solución de software empresarial completa desarrollada para digitalizar y optimizar las operaciones de un negocio vitivinícola. El sistema integra un módulo de planificación de recursos empresariales (ERP) con una tienda en línea, permitiendo gestionar desde el inventario y las ventas hasta la facturación y el catálogo de productos desde una sola plataforma.

El proyecto abarca más de 200 SKUs de productos, con un esquema de base de datos relacional normalizado hasta Tercera Forma Normal (3FN) para garantizar integridad y eficiencia en las consultas.

---

## Módulos del sistema

### ERP
| Módulo | Funcionalidad |
|---|---|
| Inventario | Alta, baja y consulta de productos; control de stock |
| Ventas | Registro de pedidos, historial de clientes |
| Facturación | Generación de comprobantes de venta |
| Reportes | Consultas de ventas en tiempo real |

### E-commerce
| Módulo | Funcionalidad |
|---|---|
| Catálogo | Exhibición paginada de más de 200 SKUs |
| Carrito | Gestión de órdenes de compra en línea |
| Panel admin | Gestión de productos y pedidos desde interfaz web |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend / Lógica de negocio | Java, C# |
| Frontend | JavaScript, HTML5, CSS3 |
| Base de datos | SQL (esquema relacional normalizado hasta 3FN) |
| Control de versiones | Git / GitHub |

---

## Diseño de base de datos

El esquema relacional fue diseñado siguiendo el proceso de normalización hasta **Tercera Forma Normal (3FN)**, eliminando redundancias y garantizando la integridad referencial entre entidades clave:

```
Productos ──< Inventario >── Almacén
    │
    └──< DetalleVenta >── Venta ──> Cliente
                              │
                              └──> Factura
```

**Entidades principales:**
- `Producto` — SKU, nombre, categoría, precio, stock
- `Cliente` — datos de contacto, historial de compras
- `Venta` — encabezado de transacción
- `DetalleVenta` — líneas de productos por venta
- `Inventario` — movimientos de entrada/salida
- `Factura` — comprobante vinculado a venta

---

## Capturas del sistema

> *(Próximamente — imágenes de la interfaz de inventario, módulo de ventas y catálogo e-commerce)*

---

## Estructura del repositorio

```
VitisAndByte/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio por módulo
│   │   ├── models/           # Entidades y acceso a datos
│   │   └── services/         # Servicios transversales
│   └── db/
│       ├── schema.sql        # Esquema completo de la BD
│       └── seed.sql          # Datos de prueba
├── frontend/
│   ├── erp/                  # Interfaz del sistema interno
│   └── ecommerce/            # Tienda en línea
└── README.md
```

---

## Cómo ejecutar

### Requisitos previos

- Java 17+ o .NET 6+
- Servidor de base de datos compatible con SQL (MySQL / SQL Server)
- Navegador moderno para el frontend

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/Pelayo04/VitisAndByte.git

# 2. Crear la base de datos
# Ejecutar backend/db/schema.sql en tu servidor SQL
# Ejecutar backend/db/seed.sql para datos de prueba

# 3. Configurar cadena de conexión
# Editar backend/src/config (ver archivo de ejemplo config.example)

# 4. Ejecutar el backend
# Java: mvn spring-boot:run
# C#:   dotnet run

# 5. Abrir el frontend
# Abrir frontend/ecommerce/index.html en el navegador
# Abrir frontend/erp/index.html para el panel de administración
```

---

## Decisiones de diseño destacadas

- **Normalización 3FN** — evita anomalías de actualización y reduce redundancia en catálogo con más de 200 SKUs
- **Separación ERP / e-commerce** — arquitectura modular que permite escalar cada sistema de forma independiente
- **Interfaz orientada a usuarios no técnicos** — flujos simplificados para captura de pedidos y gestión de inventario

---

## Aprendizajes clave del proyecto

- Modelado de bases de datos relacionales para dominio de negocio real
- Desarrollo de interfaces administrativas usables y eficientes
- Integración de lógica de negocio compleja (inventario, facturación, ventas) en un solo sistema
- Gestión de un catálogo de producto a escala (200+ SKUs)

---

## Estado del proyecto

🟢 **Completado** — Sistema funcional entregado. Pendiente de despliegue en producción.

---

## Autor

**Daniel Eduardo Pelayo Gómez**
**Ulises Alberto Macías Ramírez**
Tecnólogos en Desarrollo de Software — CETI Colomos
[LinkedIn](https://www.linkedin.com/in/daniel-pelayo-4097ab414) · [GitHub](https://github.com/Pelayo04)

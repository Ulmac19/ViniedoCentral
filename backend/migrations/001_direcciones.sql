-- ============================================================
-- Migración 001: Tabla de direcciones por usuario
-- Ejecutar en la base de datos VITISBYTE
-- ============================================================

-- 0. Eliminar columna obsoleta direccion_entrega de usuarios
ALTER TABLE usuarios DROP COLUMN direccion_entrega;

-- 1. Crear tabla de direcciones con FK CASCADE hacia usuarios
CREATE TABLE IF NOT EXISTS direcciones (
  id_direccion    INT           AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT           NOT NULL,
  alias           VARCHAR(50)   NOT NULL,
  calle           VARCHAR(150)  NOT NULL,
  numero_exterior VARCHAR(20)   NOT NULL,
  numero_interior VARCHAR(20)   NULL,
  colonia         VARCHAR(100)  NOT NULL,
  municipio       VARCHAR(100)  NOT NULL,
  ciudad          VARCHAR(100)  NOT NULL,
  estado          VARCHAR(100)  NOT NULL,
  codigo_postal   CHAR(5)       NOT NULL,
  referencias     VARCHAR(255)  NULL,
  CONSTRAINT fk_direcciones_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- 2. Agregar FK constraint con CASCADE en ordenes.id_usuario
--    La tabla ordenes solo tenía un KEY (índice), no un FOREIGN KEY real.
--    Se agrega directamente sin necesidad de DROP.
ALTER TABLE ordenes
  ADD CONSTRAINT fk_ordenes_usuario
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- 3. Verificar/agregar CASCADE en orden_detalle → ordenes
--    Ejecuta primero el SHOW CREATE TABLE para ver si ya existe un FK:
--    SHOW CREATE TABLE orden_detalle;
--
--    Si no tiene FK con CASCADE, ejecutar (ajusta el nombre si ya existe uno):
-- ALTER TABLE orden_detalle DROP FOREIGN KEY <nombre_constraint_existente>;
-- ALTER TABLE orden_detalle
--   ADD CONSTRAINT fk_detalle_orden
--   FOREIGN KEY (id_orden) REFERENCES ordenes(id_orden)
--   ON DELETE CASCADE;

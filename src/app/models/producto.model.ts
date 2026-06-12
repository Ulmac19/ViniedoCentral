/**
 * Product — Modelo de producto que usa el frontend.
 *
 * Es la versión "de vista" del producto: ProductsService traduce aquí la fila
 * de la BD (snake_case) a camelCase y agrega campos calculados.
 *   price      → precio final con impuestos (IEPS + IVA), ya calculado.
 *   precioNeto → precio sin impuestos; se conserva para el desglose fiscal.
 *   cantidad   → unidades elegidas/agregadas (no es el stock).
 */
export interface Product{
    id: number;                    // id_producto en la BD
    name: string;                  // nombre del producto
    price: number;                 // precio final con IEPS + IVA
    imageUrl: string;              // URL de la imagen
    category:string;               // categoría (vino, tequila, etc.)
    description: string;           // descripción
    inStock: boolean;              // true si stock > 0
    stock: number;                 // unidades disponibles
    cantidad: number;              // unidades seleccionadas por el usuario
    precioNeto: number;            // precio sin impuestos
    graduacionAlcoholica: number;  // grados de alcohol (determina la tasa de IEPS)
}
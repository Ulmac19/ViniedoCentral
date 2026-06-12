import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/producto.model';

/**
 * ProductsService — Obtiene el catálogo y calcula el precio final con impuestos.
 *
 * El backend devuelve el precio neto (sin impuestos). Aquí se aplica la cascada
 * fiscal mexicana: IEPS variable según la graduación alcohólica + IVA 16%, y se
 * mapea la fila de la BD (snake_case) al modelo Product que usa el frontend.
 */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  // Ruta del catálogo público en el backend
  private apiUrl = 'http://localhost:3000/api/productos';

  /**
   * Tasa de IEPS según la graduación alcohólica del producto.
   * Misma lógica que en el backend (cfdi.service.js) y en CarritoService.
   */
  private tasaIEPS(graduacion: number): number {
    if (graduacion <= 14) return 0.265; // ≤ 14° → 26.5%
    if (graduacion <= 20) return 0.30;  // ≤ 20° → 30%
    return 0.53;                        // > 20° → 53%
  }

  /** Trae el catálogo y transforma cada producto agregando el precio final con impuestos. */
  getAll(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(productosDB =>
        productosDB.map(p => {
          const tasa = this.tasaIEPS(p.graduacion_alcoholica ?? 0);
          // Cascada fiscal: precio_neto × (1 + IEPS) × 1.16 (IVA)
          const precioFinal = p.precio_neto * (1 + tasa) * 1.16;

          return {
            id: p.id_producto,
            name: p.nombre,
            price: precioFinal,
            imageUrl: p.imagen_url,
            category: p.categoria,
            description: p.descripcion,
            inStock: p.stock > 0,
            stock: p.stock ?? 0,
            cantidad: 1,
            precioNeto: p.precio_neto,
            graduacionAlcoholica: p.graduacion_alcoholica ?? 0,
          };
        })
      )
    );
  }
}
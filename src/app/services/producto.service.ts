import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  
  // Tu ruta hacia el backend
  private apiUrl = 'http://localhost:3000/api/productos';

  private tasaIEPS(graduacion: number): number {
    if (graduacion <= 14) return 0.265;
    if (graduacion <= 20) return 0.30;
    return 0.53;
  }

  getAll(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(productosDB =>
        productosDB.map(p => {
          const tasa = this.tasaIEPS(p.graduacion_alcoholica ?? 0);
          const precioFinal = p.precio_neto * (1 + tasa) * 1.16;

          return {
            id: p.id_producto,
            name: p.nombre,
            price: precioFinal,
            imageUrl: p.imagen_url,
            category: p.categoria,
            description: p.descripcion,
            inStock: p.stock > 0,
            cantidad: 1,
            precioNeto: p.precio_neto,
            graduacionAlcoholica: p.graduacion_alcoholica ?? 0,
          };
        })
      )
    );
  }
}
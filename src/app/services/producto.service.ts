import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  
  // Tu ruta hacia el backend
  private apiUrl = 'http://localhost:3000/api/productos';

  getAll(): Observable<Product[]> {
    // Usamos <any[]> porque los datos de la BD vienen con otros nombres
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(productosDB => 
        productosDB.map(p => {
          // APLICACIÓN DEL ANEXO FISCAL
          // Precio Neto * IEPS (53%) * IVA (16%) = Precio Final Público
          // 1.53 * 1.16 = 1.7748
          const precioFinal = p.precio_neto * 1.7748;

          return {
            id: p.id_producto,        // Traducimos id_producto -> id
            name: p.nombre,           // Traducimos nombre -> name
            price: precioFinal,       // Mandamos el precio ya con impuestos
            imageUrl: p.imagen_url,   // Traducimos imagen_url -> imageUrl
            category: p.categoria,    // Traducimos categoria -> category
            description: p.descripcion,
            inStock: p.stock > 0,     // Si el stock es mayor a 0, hay inventario
            cantidad: 1               // Requisito para el carrito
          };
        })
      )
    );
  }
}
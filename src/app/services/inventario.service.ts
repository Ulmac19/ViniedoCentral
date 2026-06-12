import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

/**
 * InventarioService — CRUD de productos para el panel de administración.
 *
 * Consume /api/inventario, protegido en el backend por rol 'administrador'.
 * Cada método adjunta el JWT; sin un token de admin el backend responde 403.
 */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private apiUrl = 'http://localhost:3000/api/inventario';

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.token()}` });
  }

  getProductos() {
    return this.http.get<any[]>(this.apiUrl, { headers: this.headers() });
  }

  crearProducto(producto: any) {
    return this.http.post<any>(this.apiUrl, producto, { headers: this.headers() });
  }

  actualizarProducto(id: number, producto: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, producto, { headers: this.headers() });
  }

  eliminarProducto(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  toggleActivo(id: number, activo: boolean) {
    return this.http.put<any>(`${this.apiUrl}/${id}/activo`, { activo }, { headers: this.headers() });
  }
}

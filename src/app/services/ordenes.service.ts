import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api/ordenes';

  // Función privada para armar las cabeceras con el token
  private getHeaders() {
    const token = this.authService.token();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Traer todos los pedidos
  getMisPedidos() {
    return this.http.get<any[]>(`${this.apiUrl}/mis-pedidos`, { headers: this.getHeaders() });
  }

  // Traer el detalle de un pedido específico
  getDetallePedido(idOrden: number) {
    return this.http.get<any>(`${this.apiUrl}/mis-pedidos/${idOrden}`, { headers: this.getHeaders() });
  }
}
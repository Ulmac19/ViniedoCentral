import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })

export class PaypalService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api/paypal'; 

  // Función para armar las cabeceras con el token
  private getHeaders() {
    const token = this.authService.token();
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${token}`) };
  }

  crearOrden(payload: any) {
    // Agregamos getHeaders() al final
    return this.http.post<any>(`${this.apiUrl}/crear-orden`, payload, this.getHeaders());
  }

  capturarOrden(orderId: string) {
    // Agregamos getHeaders() al final
    return this.http.post<any>(`${this.apiUrl}/capturar-orden`, { orderId }, this.getHeaders());
  }
}
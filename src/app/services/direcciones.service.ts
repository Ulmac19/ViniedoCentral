import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface Direccion {
  id_direccion?: number;
  id_usuario?: number;
  alias: string;
  calle: string;
  numero_exterior: string;
  numero_interior?: string;
  colonia: string;
  municipio: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;
  referencias?: string;
}

@Injectable({ providedIn: 'root' })
export class DireccionesService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api/direcciones';

  private headers() {
    return { Authorization: `Bearer ${this.authService.token()}` };
  }

  getDirecciones() {
    return this.http.get<Direccion[]>(this.apiUrl, { headers: this.headers() });
  }

  crearDireccion(datos: Direccion) {
    return this.http.post<any>(this.apiUrl, datos, { headers: this.headers() });
  }

  actualizarDireccion(id: number, datos: Direccion) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, datos, { headers: this.headers() });
  }

  eliminarDireccion(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}

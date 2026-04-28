import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({ providedIn: 'root' })

export class PaypalService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/paypal`;

    crearOrden(payload: {items: any[]; total: number}){
        return this.http.post<{id: string, status: string}>(`${this.apiUrl}/create-order`,payload);
    }

    capturarOrden(orderId: string){
        return this.http.post<any>(`${this.apiUrl}/capture-order`,{orderId});
    }
}
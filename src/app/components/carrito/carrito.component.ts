import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CurrencyPipe, RouterLink], // [cite: 87]
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  // Inyectamos el servicio directamente
  private carritoService = inject(CarritoService);

  // Ahora estas propiedades pueden acceder al servicio sin error
  productos = this.carritoService.productos; // [cite: 95]
  subtotal = this.carritoService.subtotal;
  costoEnvio = this.carritoService.costoEnvio;
  total = this.carritoService.total; // [cite: 93]

  quitar(id: number) { 
    this.carritoService.quitar(id); // [cite: 98]
  }

  exportarXML() { 
    this.carritoService.exportarXML(); // [cite: 104]
  }

  realizarPago() {
    alert('Procesando pago (RF4.2)...');
  }

  cambiarCantidad(id: number, event: Event) {
  const input = event.target as HTMLInputElement;
  const valor = Number(input.value); // Convertimos a número
  
  if (valor > 0) {
    this.carritoService.actualizarCantidad(id, valor);
  }
}
}
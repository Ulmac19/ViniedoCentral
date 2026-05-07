import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdenesService } from '../../services/ordenes.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink], // DatePipe es vital para formatear las fechas de SQL
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  private ordenesService = inject(OrdenesService);

  // Señales reactivas
  pedidos = signal<any[]>([]);
  pedidoSeleccionado = signal<any>(null);
  modalAbierto = signal(false);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.ordenesService.getMisPedidos().subscribe({
      next: (data) => this.pedidos.set(data),
      error: (err) => console.error('Error al cargar historial', err)
    });
  }

  verDetalle(idOrden: number) {
    this.ordenesService.getDetallePedido(idOrden).subscribe({
      next: (data) => {
        this.pedidoSeleccionado.set(data);
        this.modalAbierto.set(true); // Abrimos la ventana emergente
      },
      error: (err) => console.error('Error al cargar detalle', err)
    });
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.pedidoSeleccionado.set(null);
  }
}
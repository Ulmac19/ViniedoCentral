import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdenesService } from '../../services/ordenes.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  private ordenesService = inject(OrdenesService);

  pedidos = signal<any[]>([]);
  pedidoSeleccionado = signal<any>(null);
  modalAbierto = signal(false);
  cargando = signal(true);
  errorCarga = signal('');
  cargandoDetalle = signal(false);

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.ordenesService.getMisPedidos().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el historial de pedidos. Intenta de nuevo.');
        this.cargando.set(false);
      }
    });
  }

  verDetalle(idOrden: number) {
    this.cargandoDetalle.set(true);
    this.errorCarga.set('');
    this.ordenesService.getDetallePedido(idOrden).subscribe({
      next: (data) => {
        this.pedidoSeleccionado.set(data);
        this.modalAbierto.set(true);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.errorCarga.set('No se pudo cargar el detalle del pedido.');
        this.cargandoDetalle.set(false);
      }
    });
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.pedidoSeleccionado.set(null);
  }
}

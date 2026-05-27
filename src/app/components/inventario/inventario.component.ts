import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);

  productos = signal<any[]>([]);
  modalAbierto = signal(false);
  modoEdicion = signal(false);
  mensaje = signal('');

  formulario = signal({
    id_producto: 0, sku: '', nombre: '', categoria: '',
    descripcion: '', imagen_url: '', volumen_ml: 0,
    graduacion_alcoholica: 0, precio_neto: 0, stock: 0, umbral_alerta: 5
  });

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.inventarioService.getProductos().subscribe({
      next: (data) => this.productos.set(data),
      error: () => this.mensaje.set('Error al cargar productos')
    });
  }

  abrirFormularioNuevo() {
    this.formulario.set({
      id_producto: 0, sku: '', nombre: '', categoria: '',
      descripcion: '', imagen_url: '', volumen_ml: 0,
      graduacion_alcoholica: 0, precio_neto: 0, stock: 0, umbral_alerta: 5
    });
    this.modoEdicion.set(false);
    this.modalAbierto.set(true);
  }

  abrirFormularioEdicion(producto: any) {
    this.formulario.set({ ...producto });
    this.modoEdicion.set(true);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
    this.mensaje.set('');
  }

  guardar() {
    const f = this.formulario();
    const datos = {
      sku: f.sku, nombre: f.nombre, categoria: f.categoria,
      descripcion: f.descripcion, imagen_url: f.imagen_url,
      volumen_ml: f.volumen_ml, graduacion_alcoholica: f.graduacion_alcoholica,
      precio_neto: f.precio_neto, stock: f.stock, umbral_alerta: f.umbral_alerta
    };

    if (this.modoEdicion()) {
      this.inventarioService.actualizarProducto(f.id_producto, datos).subscribe({
        next: () => { this.cargarProductos(); this.cerrarModal(); },
        error: () => this.mensaje.set('Error al actualizar producto')
      });
    } else {
      this.inventarioService.crearProducto(datos).subscribe({
        next: () => { this.cargarProductos(); this.cerrarModal(); },
        error: () => this.mensaje.set('Error al crear producto')
      });
    }
  }

  eliminar(id: number) {
    if (!confirm('¿Desactivar este producto?')) return;
    this.inventarioService.eliminarProducto(id).subscribe({
      next: () => this.cargarProductos(),
      error: () => this.mensaje.set('Error al eliminar producto')
    });
  }

  toggleActivo(producto: any) {
    const nuevoEstado = !producto.activo;
    const accion = nuevoEstado ? '¿Reactivar este producto?' : '¿Desactivar este producto?';
    if (!confirm(accion)) return;
    this.inventarioService.toggleActivo(producto.id_producto, nuevoEstado).subscribe({
      next: () => this.cargarProductos(),
      error: () => this.mensaje.set('Error al cambiar estado del producto')
    });
  }

  actualizarCampo(campo: string, valor: any) {
    this.formulario.update(f => ({ ...f, [campo]: valor }));
  }
}

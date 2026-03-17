import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Product[]>([]);
  productos = this.productosSignal.asReadonly();

  subtotal = computed(() =>
    this.productosSignal().reduce((acc, p) => acc + (p.price * p.cantidad), 0));
  costoEnvio = signal(199.00);
  total = computed(() => this.subtotal() + (this.productosSignal().length > 0 ? this.costoEnvio() : 0));

  agregar(producto: Product) {
    this.productosSignal.update(lista => {
      // Revisamos si el producto ya existe en el carrito 
      const existe = lista.find(p => p.id === producto.id);

      if (existe) {
        // Si existe, solo aumentamos su cantidad
        return lista.map(p =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      }

      // Si es nuevo, lo agregamos con cantidad inicial de 1
      return [...lista, { ...producto, cantidad: 1 }];
    });
  }

  actualizarCantidad(id: number, nuevaCantidad: number) {
    this.productosSignal.update(lista =>
      lista.map(p => p.id === id ? { ...p, cantidad: nuevaCantidad } : p)
    );
  }

  quitar(id: number) {
    this.productosSignal.update(lista => lista.filter(p => p.id !== id));
  }


  exportarXML() {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<pedido>\n`;
    xml += `  <productos>\n`;

    this.productosSignal().forEach(p => {
      const totalPorProducto = p.price * p.cantidad;
      xml += `    <item>\n`;
      xml += `      <nombre>${p.name}</nombre>\n`;
      xml += `      <precio_unitario>${p.price}</precio_unitario>\n`;
      xml += `      <cantidad>${p.cantidad}</cantidad>\n`;
      xml += `      <subtotal_producto>${totalPorProducto}</subtotal_producto>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </productos>\n`;
    xml += `  <resumen_financiero>\n`;
    xml += `    <subtotal_carrito>${this.subtotal()}</subtotal_carrito>\n`;
    xml += `    <costo_envio>${this.costoEnvio()}</costo_envio>\n`;
    xml += `    <total_final>${this.total()}</total_final>\n`;
    xml += `  </resumen_financiero>\n`;
    xml += `</pedido>`;

    // Lógica de descarga
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_vitis_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

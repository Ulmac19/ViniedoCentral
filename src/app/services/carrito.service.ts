import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/producto.model';

function tasaIEPS(graduacion: number): number {
  if (graduacion <= 14) return 0.265;
  if (graduacion <= 20) return 0.30;
  return 0.53;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private productosSignal = signal<Product[]>([]);
  productos = this.productosSignal.asReadonly();

  subtotal = computed(() =>
    this.productosSignal().reduce((acc, p) => acc + (p.price * p.cantidad), 0));
  costoEnvio = signal(199.00);
  total = computed(() => this.subtotal() + (this.productosSignal().length > 0 ? this.costoEnvio() : 0));
  totalArticulos = computed(() => 
  this.productosSignal().reduce((acc, p) => acc + p.cantidad, 0));

  agregar(producto: Product, cantidadAgregada: number) {
    this.productosSignal.update(lista => {
      // Revisamos si el producto ya existe en el carrito 
      const existe = lista.find(p => p.id === producto.id);

      if (existe) {
        // Si existe, solo aumentamos su cantidad
        return lista.map(p =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + cantidadAgregada } : p
        );
      }

      // Si es nuevo, lo agregamos con cantidad inicial de 1
      return [...lista, { ...producto, cantidad: cantidadAgregada }];
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

  /** Se llama tras un pago exitoso para limpiar el estado del carrito (vista). */
  vaciarCarrito() {
    this.productosSignal.set([]);
  }

  private desgloseImpuestos(producto: Product): {
    neto: number; ieps: number; iva: number; tasa: number;
  } {
    const neto = producto.precioNeto;
    const tasa = tasaIEPS(producto.graduacionAlcoholica);
    const ieps = neto * tasa;
    const iva = neto * (1 + tasa) * 0.16;
    return { neto, ieps, iva, tasa };
  }

  private fmt(n: number): string {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  exportarXML() {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<pedido>\n`;
    xml += `  <productos>\n`;

    let sumaNeto = 0;
    let sumaIeps = 0;
    let sumaIva = 0;

    this.productosSignal().forEach(p => {
      const totalPorProducto = p.price * p.cantidad;
      const u = this.desgloseImpuestos(p);
      const netoLinea = u.neto * p.cantidad;
      const iepsLinea = u.ieps * p.cantidad;
      const ivaLinea = u.iva * p.cantidad;
      const pctLabel = `${Math.round(u.tasa * 100)}pct`;
      sumaNeto += netoLinea;
      sumaIeps += iepsLinea;
      sumaIva += ivaLinea;

      xml += `    <item>\n`;
      xml += `      <nombre>${p.name}</nombre>\n`;
      xml += `      <precio_unitario>${this.fmt(p.price)}</precio_unitario>\n`;
      xml += `      <cantidad>${p.cantidad}</cantidad>\n`;
      xml += `      <impuestos>\n`;
      xml += `        <subtotal_neto>${this.fmt(u.neto)}</subtotal_neto>\n`;
      xml += `        <ieps_${pctLabel}>${this.fmt(u.ieps)}</ieps_${pctLabel}>\n`;
      xml += `        <iva_16pct>${this.fmt(u.iva)}</iva_16pct>\n`;
      xml += `      </impuestos>\n`;
      xml += `      <subtotal_producto>${this.fmt(totalPorProducto)}</subtotal_producto>\n`;
      xml += `      <desglose_linea>\n`;
      xml += `        <neto>${this.fmt(netoLinea)}</neto>\n`;
      xml += `        <ieps>${this.fmt(iepsLinea)}</ieps>\n`;
      xml += `        <iva>${this.fmt(ivaLinea)}</iva>\n`;
      xml += `      </desglose_linea>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </productos>\n`;
    xml += `  <resumen_financiero>\n`;
    xml += `    <subtotal_carrito>${this.fmt(this.subtotal())}</subtotal_carrito>\n`;
    xml += `    <impuestos_totales>\n`;
    xml += `      <subtotal_neto>${this.fmt(sumaNeto)}</subtotal_neto>\n`;
    xml += `      <total_ieps>${this.fmt(sumaIeps)}</total_ieps>\n`;
    xml += `      <total_iva>${this.fmt(sumaIva)}</total_iva>\n`;
    xml += `      <suma_impuestos>${this.fmt(sumaIeps + sumaIva)}</suma_impuestos>\n`;
    xml += `    </impuestos_totales>\n`;
    xml += `    <costo_envio>${this.fmt(this.costoEnvio())}</costo_envio>\n`;
    xml += `    <total_final>${this.fmt(this.total())}</total_final>\n`;
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

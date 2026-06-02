import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../../models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;

  @Output() add = new EventEmitter<{producto: Product, cantidad: number}>();
  @Output() verDetalle = new EventEmitter<Product>();

  cantidadValida = signal(true);

  onCantidadChange(value: string) {
    const n = parseInt(value);
    this.cantidadValida.set(!!n && n >= 1);
  }

  onAdd(cantidadStr: string) {
    const cantidad = parseInt(cantidadStr);
    if (!cantidad || cantidad < 1) return; // Validamos que la cantidad sea un número positivo o al menos 1
    this.add.emit({ producto: this.product, cantidad }); // Emitimos el producto junto con la cantidad seleccionada
  }
}


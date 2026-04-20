import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  
  // Ahora el EventEmitter manda un objeto con el producto y la cantidad
  @Output() add = new EventEmitter<{producto: Product, cantidad: number}>();

  onAdd(cantidadStr: string) {
    const cantidad = parseInt(cantidadStr) || 1;
    this.add.emit({ producto: this.product, cantidad: cantidad });
  }
}


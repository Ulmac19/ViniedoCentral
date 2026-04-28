import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CarritoService } from '../../services/carrito.service';
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements AfterViewInit {
  @ViewChild('paypalHost') paypalHost?: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly carrito = inject(CarritoService);
  private readonly paypalApi = inject(PaypalService);

  readonly productos = this.carrito.productos;
  readonly subtotal = this.carrito.subtotal;
  readonly costoEnvio = this.carrito.costoEnvio;
  readonly total = this.carrito.total;

  readonly cargandoSdk = signal(true);
  readonly errorMsg = signal<string | null>(null);

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.carrito.productos().length === 0) {
      void this.router.navigate(['/carrito']);
      return;
    }
    void this.inicializarPaypal();
  }

  /** Misma forma que espera el backend (`nombre`, `cantidad`, `precio`) + línea de envío. */
  private construirPayload(): { items: any[]; total: number } {
    const lineas: any[] = this.carrito.productos().map((p) => ({
      id_producto: p.id,
      nombre: p.name,
      cantidad: p.cantidad,
      precio: p.price,
    }));
    if (this.carrito.productos().length > 0 && this.carrito.costoEnvio() > 0) {
      lineas.push({
        nombre: 'Envío',
        cantidad: 1,
        precio: this.carrito.costoEnvio(),
      });
    }
    return { items: lineas, total: this.carrito.total() };
  }

  /** El SDK se carga desde `index.html` (script de la práctica); aquí solo esperamos a `window.paypal`. */
  private mensajeDeErrorHttp(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error as Record<string, unknown> | null | undefined;
      if (body && typeof body === 'object') {
        if (typeof body['detalle'] === 'string') return body['detalle'];
        if (typeof body['error'] === 'string') return body['error'];
      }
      return e.message || `Error de red (HTTP ${e.status}). ¿Está el backend en ${e.url ?? 'la API'}?`;
    }
    if (e instanceof Error) return e.message;
    return String(e);
  }

  private esperarPayPalDesdeIndexHtml(): Promise<void> {
    const deadline = Date.now() + 20000;
    return new Promise((resolve, reject) => {
      const tick = () => {
        const win = window as unknown as {
          paypal?: { Buttons: (opts: unknown) => { render: (el: HTMLElement) => Promise<void> } };
        };
        if (win.paypal?.Buttons) {
          resolve();
          return;
        }
        if (Date.now() > deadline) {
          reject(
            new Error(
              'No se cargó PayPal. Revisa el <script> en index.html (client-id válido).',
            ),
          );
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private async inicializarPaypal(): Promise<void> {
    this.cargandoSdk.set(true);
    this.errorMsg.set(null);
    const host = this.paypalHost?.nativeElement;
    if (!host) {
      this.cargandoSdk.set(false);
      return;
    }

    try {
      await this.esperarPayPalDesdeIndexHtml();
      const win = window as unknown as {
        paypal: { Buttons: (opts: unknown) => { render: (el: HTMLElement) => Promise<void> } };
      };

      await win.paypal
        .Buttons({
          style: { layout: 'vertical', shape: 'rect', label: 'pay' },
          createOrder: async () => {
            try {
              const payload = this.construirPayload();
              const orden = await firstValueFrom(this.paypalApi.crearOrden(payload));
              if (!orden?.id) {
                throw new Error('El servidor no devolvió un id de orden.');
              }
              return orden.id;
            } catch (e) {
              const msg = this.mensajeDeErrorHttp(e);
              this.errorMsg.set(msg);
              throw new Error(msg);
            }
          },
          onApprove: async (data: { orderID: string }) => {
            try {
              await firstValueFrom(this.paypalApi.capturarOrden(data.orderID));
              this.carrito.exportarXML();
              this.carrito.vaciarCarrito();
              void this.router.navigate(['/'], { queryParams: { pago: 'ok' } });
            } catch (e) {
              this.errorMsg.set(this.mensajeDeErrorHttp(e));
              throw e;
            }
          },
          onError: (err: unknown) => {
            const msg = this.mensajeDeErrorHttp(err);
            this.errorMsg.set(msg);
          },
          onCancel: () => {
            this.errorMsg.set('Pago cancelado.');
          },
        })
        .render(host);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo iniciar PayPal';
      this.errorMsg.set(msg);
    } finally {
      this.cargandoSdk.set(false);
    }
  }
}

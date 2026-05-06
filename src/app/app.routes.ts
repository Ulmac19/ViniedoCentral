import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/producto/catalogo/catalogo.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { CheckoutComponent } from './components/checkout/checkout';
import { AuthComponent } from './components/auth/auth';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Cuando entran a la raíz de la página, los manda al login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // La pantalla de autenticación pública
    { path: 'login', component: AuthComponent },
    
    //Ruta del catálogo protegida
    { path: 'catalogo', component: CatalogoComponent, canActivate: [authGuard] },
    
    //Rutas de carrito y pago protegidas
    { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
    { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
    
    // 5. Si escriben una ruta que no existe, los devuelve al login
    { path: '**', redirectTo: 'login' },
];
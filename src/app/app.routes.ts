import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/producto/catalogo/catalogo.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { AuthComponent } from './components/auth/auth';
import { authGuard } from './guards/auth.guard';
import { PedidosComponent } from './components/pedidos/pedidos.component';

export const routes: Routes = [
    // Cuando entran a la raíz de la página, los manda al login
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // La pantalla de autenticación pública
    { path: 'login', component: AuthComponent },
    
    //Ruta del catálogo protegida
    { path: 'catalogo', component: CatalogoComponent, canActivate: [authGuard] },
    
    //Rutas de carrito y pedidos protegidas
    { path: 'carrito', component: CarritoComponent, canActivate: [authGuard] },
    { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },

    //Si escriben una ruta que no existe, los devuelve al login
    { path: '**', redirectTo: 'login' },
];
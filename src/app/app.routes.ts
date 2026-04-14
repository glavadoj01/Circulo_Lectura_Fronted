import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { Bienvenida } from './pages/bienvenida/bienvenida';
import { Eventos } from './pages/catalogos/eventos/eventos';
import { Libros } from './pages/catalogos/libros/libros';
import { Listas } from './pages/catalogos/listas/listas';
import { Evento } from './pages/detalle/evento/evento';
import { DetalleLibro } from './pages/detalle/libro/detalleLibro';
import { DetalleLista } from './pages/detalle/lista/lista';

export const routes: Routes = [
    { path: 'auth', component: Auth },
    { path: 'bienvenida', component: Bienvenida },
    { path: 'catalogos/eventos', component: Eventos },
    { path: 'catalogos/libros', component: Libros },
    { path: 'catalogos/listas', component: Listas },
    { path: 'detalle/evento/:id', component: Evento },
    { path: 'detalle/libro/:id', component: DetalleLibro },
    { path: 'detalle/lista/:id', component: DetalleLista },
    /* Ruta por defecto www.webapp.es */
    {
        path: '',
        redirectTo: 'bienvenida',
        pathMatch: 'full',
    },
    /* Ruta para cuando no existe la ruta www.webapp.es/loquesea */
    {
        path: '**',
        redirectTo: 'bienvenida',
    },
    /* Realmente la default es redundante, ya que está la cualquiera **; que atraparia la ruta vacia igualmente, 
        pero se puede aprovechar para incluir algun codigo de error
        => WIP
    */
];

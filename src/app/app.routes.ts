import { Routes } from '@angular/router';
import { Auth } from './pages/auth/auth';
import { Bienvenida } from './pages/bienvenida/bienvenida';
import { Eventos } from './pages/catalogos/eventos/eventos';
import { Libros } from './pages/catalogos/libros/libros';
import { Listas } from './pages/catalogos/listas/listas';
import { Evento } from './pages/detalle/evento/evento';
import { Libro } from './pages/detalle/libro/libro';
import { Lista } from './pages/detalle/lista/lista';

export const routes: Routes = [
    { path: 'auth', component: Auth },
    { path: 'bienvenida', component: Bienvenida },
    { path: 'catalogos/eventos', component: Eventos },
    { path: 'catalogos/libros', component: Libros },
    { path: 'catalogos/listas', component: Listas },
    { path: 'detalle/evento', component: Evento },
    { path: 'detalle/libro', component: Libro },
    { path: 'detalle/lista', component: Lista },
    { path: '', redirectTo: 'bienvenida', pathMatch: 'full' }, /* Ruta por defecto www.webapp.es */
    { path: '**', redirectTo: 'bienvenida' } /* Ruta para cuando no existe la ruta www.webapp.es/loquesea */
    /* Realmente la default es redundante, ya que está la cualquiera **; que atraparia la ruta vacia igualmente, 
        pero se puede aprovechar para incluir algun codigo de error => WIP */
];

import { Routes } from '@angular/router';
import { Bienvenida } from './pages/bienvenida/bienvenida';
import { Libros } from './pages/catalogos/libros/libros';
import { Eventos } from './pages/catalogos/eventos/eventos';
import { Listas } from './pages/catalogos/listas/listas';
import { Evento } from './pages/detalle/evento/evento';
import { Libro } from './pages/detalle/libro/libro';
import { Lista } from './pages/detalle/lista/lista';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
    { path: 'auth', component: Auth },
    { path: 'bienvenida', component: Bienvenida },
    { path: 'catalogos/eventos', component: Eventos },
    { path: 'catalogos/libros', component: Libros },
    { path: 'catalogos/listas', component: Listas },
    { path: 'detalle/evento', component: Evento },
    { path: 'detalle/libro', component: Libro },
    { path: 'detalle/lista', component: Lista },
    { path: '**', redirectTo: 'bienvenida' }
];

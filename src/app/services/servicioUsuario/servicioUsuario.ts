// Importaciones node_modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importaciones propias
import { environment } from '@environments/environments';
import {
    CriticaConTitulo,
    EventoResumen,
    LibroResumen,
    ListaApp,
    UsuarioCompleto,
} from '@app/interfaces/modelosApp/modelosApp';

@Injectable({
    providedIn: 'root',
})
export class ServicioUsuario {
    private readonly apiUrl = `${environment.apiUrl}:${environment.puerto}`;

    constructor(private readonly http: HttpClient) {}

    getNombreUsuarioComentario(id: number): Observable<string> {
        const url = `${this.apiUrl}/usuarios`;
        const filtros = { id_usuario: id };
        console.log('URL para obtener usuario:', url);
        console.log('Filtros para obtener usuario:', filtros);
        return this.http.get<string>(url, {
            params: {
                filtros: JSON.stringify(filtros),
                columnas: 'nombre_usuario',
            },
        });
    }

    getUsuarioCompleto(id: number): Observable<UsuarioCompleto> {
        const filtros = JSON.stringify({ id_usuario: id });

        return this.http.get<UsuarioCompleto>(`${this.apiUrl}/usuarios`, {
            params: {
                filtros,
                columnas: '*',
            },
        });
    }

    getLibrosLeidos(id: number): Observable<LibroResumen[]> {
        return this.http.get<LibroResumen[]>(`${this.apiUrl}/usuario/libros/leidos/${id}`);
    }

    getLibrosPendientes(id: number): Observable<LibroResumen[]> {
        return this.http.get<LibroResumen[]>(`${this.apiUrl}/usuario/libros/pendientes/${id}`);
    }

    getListasCreadas(id: number): Observable<ListaApp[]> {
        return this.http.get<ListaApp[]>(`${this.apiUrl}/usuario/listas/creadas/${id}`);
    }

    getListasSeguidas(id: number): Observable<ListaApp[]> {
        return this.http.get<ListaApp[]>(`${this.apiUrl}/usuario/listas/seguidas/${id}`);
    }

    getEventosCreados(id: number): Observable<EventoResumen[]> {
        return this.http.get<EventoResumen[]>(`${this.apiUrl}/usuario/eventos/creados/${id}`);
    }

    getEventosAsistidos(id: number): Observable<EventoResumen[]> {
        return this.http.get<EventoResumen[]>(`${this.apiUrl}/usuario/eventos/asistidos/${id}`);
    }

    getCriticas(id: number): Observable<CriticaConTitulo[]> {
        return this.http.get<CriticaConTitulo[]>(`${this.apiUrl}/usuario/criticas/${id}`);
    }

    static avatarUsuario(idUsuario: number = 1): string {
        return `https://i.pravatar.cc/150?u=usuario-${idUsuario}`;
    }
}

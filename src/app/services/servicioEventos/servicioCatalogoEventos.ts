import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { EventoResumen } from '@interfaces/modelosApp/modelosApp';

@Injectable({ providedIn: 'root' })
export class ServicioCatalogoEventos {
    constructor(private readonly http: HttpClient) {}

    getEventosProximos(filtros = {}, pagina = 1, limit = 6): Observable<EventoResumen[]> {
        filtros = {
            ...filtros,
            tipo: 'proximos',
            pagina,
            limit,
        };
        return this.http.get<EventoResumen[]>(
            `${environment.apiUrl}:${environment.puerto}/eventos`,
            {
                params: filtros,
            },
        );
    }

    getEventosPasados(filtros = {}, pagina = 1, limit = 4): Observable<EventoResumen[]> {
        filtros = {
            ...filtros,
            tipo: 'pasados',
            pagina,
            limit,
        };
        return this.http.get<EventoResumen[]>(
            `${environment.apiUrl}:${environment.puerto}/eventos`,
            {
                params: filtros,
            },
        );
    }

    getTotalEventosProximos(filtros = {}): Observable<number> {
        filtros = {
            ...filtros,
            tipo: 'proximos',
        };
        return this.http.get<number>(`${environment.apiUrl}:${environment.puerto}/eventos/total`, {
            params: filtros,
        });
    }

    getTotalEventosPasados(filtros = {}): Observable<number> {
        filtros = {
            ...filtros,
            tipo: 'pasados',
        };
        return this.http.get<number>(
            `${environment.apiUrl}:${environment.puerto}/eventos/pasados/total`,
            {
                params: filtros,
            },
        );
    }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environments';
import { catchError, map, of } from 'rxjs';

export interface FiltroGenero {
    id_genero: number;
    nombre_genero: string;
}
export interface FiltroAutor {
    id_autor: number;
    nombre_autor: string;
    apellido_autor: string;
}

@Injectable({ providedIn: 'root' })
export class ServicioFiltrosLibros {
    readonly generos = signal<FiltroGenero[]>([]);
    readonly autores = signal<FiltroAutor[]>([]);
    readonly years = signal<number[]>([]);
    readonly valoraciones = signal<number[]>([1, 2, 3, 4, 5]);

    constructor(private readonly http: HttpClient) {}

    cargarGeneros() {
        const url = `${environment.apiUrl}:${environment.puerto}/generos`;
        this.http
            .get<any>(url)
            .pipe(
                map((resp) => {
                    if (Array.isArray(resp)) return resp;
                    if (Array.isArray(resp?.payload)) return resp.payload;
                    if (Array.isArray(resp?.data)) return resp.data;
                    return [];
                }),
                catchError(() => of([])),
            )
            .subscribe(this.generos.set);
    }

    cargarAutores() {
        const url = `${environment.apiUrl}:${environment.puerto}/autores`;
        this.http
            .get<any>(url)
            .pipe(
                map((resp) => {
                    if (Array.isArray(resp)) return resp;
                    if (Array.isArray(resp?.payload)) return resp.payload;
                    if (Array.isArray(resp?.data)) return resp.data;
                    return [];
                }),
                catchError(() => of([])),
            )
            .subscribe(this.autores.set);
    }

    cargarYears() {
        const url = `${environment.apiUrl}:${environment.puerto}/years`;
        this.http
            .get<any>(url)
            .pipe(
                map((resp) => {
                    if (Array.isArray(resp)) return resp;
                    if (Array.isArray(resp?.payload))
                        return resp.payload.map((y: any) => y.year_publicacion);
                    if (Array.isArray(resp?.data))
                        return resp.data.map((y: any) => y.year_publicacion);
                    return [];
                }),
                catchError(() => of([])),
            )
            .subscribe(this.years.set);
    }

    cargarTodosFiltros() {
        this.cargarGeneros();
        this.cargarAutores();
        this.cargarYears();
    }
}

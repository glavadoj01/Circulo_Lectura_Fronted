import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, forkJoin } from 'rxjs';
import { environment } from '@environments/environments';
import { ListaApp, DetalleListaCompleta, LibroResumen } from '@interfaces/modelosApp/modelosApp';
import { ListaComentarios } from '@interfaces/modelosBD/modelosBD';
import { manejarError, AppError } from '@app/shared/utils/error.utils';

@Injectable({ providedIn: 'root' })
export class ServicioDetalleListas {
    constructor(readonly http: HttpClient) {}

    /**
     * Obtiene el detalle de una lista por su ID, incluyendo los libros asociados en formato resumen.
     * @param id ID de la lista a obtener
     * @returns Observable con la lista mapeada y validada, o error tipificado en caso de fallo
     */
    private getListaPorId(id: number): Observable<ListaApp> {
        const url = `${environment.apiUrl}:${environment.puerto}/lista/${id}`;
        return this.http.get<ListaApp>(url).pipe(
            map((resp) => {
                if (!resp?.id_lista) {
                    throw new AppError('lista_respuesta_invalida', { id });
                }
                return resp;
            }),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleListas.getListaPorId', { id });
            }),
        );
    }

    private getComentariosPorIdLista(id: number): Observable<ListaComentarios[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/lista/${id}/comentarios`;
        return this.http.get<ListaComentarios[]>(url).pipe(
            map((resp) => (Array.isArray(resp) ? resp : [])),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleListas.getComentariosPorIdLista', { id });
            }),
        );
    }

    private getLibrosPorIdLista(id: number): Observable<LibroResumen[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/lista/${id}/libros`;
        return this.http.get<LibroResumen[]>(url).pipe(
            map((resp) => (Array.isArray(resp) ? resp : [])),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleListas.getLibrosPorIdLista', { id });
            }),
        );
    }

    getDetalleLista(id: number): Observable<DetalleListaCompleta> {
        return this.getListaPorId(id).pipe(
            switchMap((lista) => {
                return (
                    // Obtener libros y comentarios en paralelo
                    forkJoin({
                        libros: this.getLibrosPorIdLista(lista.id_lista),
                        comentarios: this.getComentariosPorIdLista(lista.id_lista),
                    }).pipe(
                        map(({ libros, comentarios }) => ({
                            lista,
                            libros,
                            comentarios,
                            errorComentarios: false,
                        })),
                        catchError((error) => {
                            return of({
                                lista,
                                libros: [],
                                comentarios: [],
                                errorComentarios: true,
                            });
                        }),
                    )
                );
            }),
        );
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, forkJoin } from 'rxjs';
import { environment } from '@environments/environments';
import { ListaApp, DetalleListaCompleta, LibroResumen } from '@interfaces/modelosApp/modelosApp';
import { ListaComentarios } from '@interfaces/modelosBD/modelosBD';
import { manejarError } from '@sharedUtils/error.utils';
import { procesarRespuestaArray, procesarRespuestaUnica } from '@sharedUtils/procesarRespuesta';

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
        return this.http.get<{ data: ListaApp }>(url).pipe(
            map((resp) => {
                return procesarRespuestaUnica<ListaApp>(resp, 'lista');
            }),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleListas.getListaPorId', { id });
            }),
        );
    }

    private getComentariosPorIdLista(id: number): Observable<ListaComentarios[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/lista/${id}/comentarios`;
        return this.http.get<{ data: ListaComentarios[] }>(url).pipe(
            map((resp) => procesarRespuestaArray<ListaComentarios>(resp, 'comentarios')),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleListas.getComentariosPorIdLista', { id });
            }),
        );
    }

    private getLibrosPorIdLista(id: number): Observable<LibroResumen[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/lista/${id}/libros`;
        return this.http.get<{ data: LibroResumen[] }>(url).pipe(
            map((resp) => procesarRespuestaArray<LibroResumen>(resp, 'libros')),
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
                            lista: procesarRespuestaUnica<ListaApp>({ data: lista }, 'lista'),
                            libros: procesarRespuestaArray<LibroResumen>(
                                { data: libros },
                                'libros',
                            ),
                            comentarios: procesarRespuestaArray<ListaComentarios>(
                                { data: comentarios },
                                'comentarios',
                            ),
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

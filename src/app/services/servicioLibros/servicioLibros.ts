import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LibroApp, RespuestaCriticas } from '@app/interfaces/modelosApp/modelosApp';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { environment } from '@environments/environments';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

/** Respuesta procesada con libro + críticas + distribución de notas */
interface DetalleLibroCompleto {
    libro: LibroApp;
    criticas: LibroCritica[];
    notasDistribucion: { nota: number; cantidad: number; frecuencia: number }[];
    errorCriticas: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class servicioLibros {
    constructor(private http: HttpClient) {}

    /**
     * MÉTODO CENTRALIZADO: obtiene libro + críticas + procesa todo
     * Lanza errores tipificados (LIBRO_NOT_FOUND, LIBRO_BAD_REQUEST, etc)
     */
    getDetalleLibro(id: number): Observable<DetalleLibroCompleto> {
        console.log('[servicioLibros] Iniciando carga detalle para libro id=', id);

        return this.getLibroPorId(id).pipe(
            switchMap((libro) => {
                console.log('[servicioLibros] Libro validado:', {
                    id: libro.id_libro,
                    titulo: libro.titulo_libro,
                });

                // Pide críticas del libro, pero si fallan devuelve arrays vacíos (no rompe)
                return this.getCriticasPorIdLibro(libro.id_libro).pipe(
                    map((respuesta) => ({
                        libro,
                        criticas: respuesta.criticas,
                        frecuencias: respuesta.frecuencias,
                        errorCriticas: false,
                    })),
                    catchError((error) => {
                        console.warn('[servicioLibros] Error al cargar críticas:', error.status);
                        return of({
                            libro,
                            criticas: [],
                            frecuencias: [0, 0, 0, 0, 0, 0],
                            errorCriticas: true,
                        });
                    }),
                );
            }),
            map((data) => ({
                libro: data.libro,
                criticas: data.criticas,
                notasDistribucion: this._calcularDistribucion(data.criticas, data.frecuencias),
                errorCriticas: data.errorCriticas,
            })),
            catchError((error: unknown) => {
                // Tipifica el error para que el componente lo entienda
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 404) {
                        throw new Error('LIBRO_NOT_FOUND');
                    }
                    if (error.status === 400) {
                        throw new Error('LIBRO_BAD_REQUEST');
                    }
                    if (error.status === 500) {
                        throw new Error('LIBRO_SERVER_ERROR');
                    }
                    throw new Error(`HTTP_ERROR_${error.status}`);
                }

                if (error instanceof Error) {
                    throw error;
                }

                throw new Error('ERROR_DESCONOCIDO');
            }),
        );
    }

    /** Obtiene libro por ID, valida estructura */
    private getLibroPorId(id: number): Observable<LibroApp> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}`;
        console.log('[servicioLibros] GET', url);

        return this.http.get<LibroApp>(url).pipe(
            map((libro) => {
                // Valida que exista y tenga id_libro
                if (!libro || !libro.id_libro) {
                    throw new Error('LIBRO_RESPONSE_INVALID');
                }

                // Normaliza calificación
                const promedioRaw = libro.calificacionPromedio;
                const calificacionNum =
                    typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);

                return {
                    ...libro,
                    calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
                };
            }),
        );
    }

    /** Obtiene críticas por ID libro, valida frecuencias */
    private getCriticasPorIdLibro(id: number): Observable<RespuestaCriticas> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}/criticas`;
        console.log('[servicioLibros] GET', url);

        return this.http.get<RespuestaCriticas>(url).pipe(
            map((resp) => {
                const frec = Array.isArray(resp.frecuencias) ? resp.frecuencias : [];
                const frecuenciasNormalizadas = [0, 1, 2, 3, 4, 5].map((i) => {
                    const val = Number(frec[i] ?? 0);
                    return Number.isFinite(val) ? val : 0;
                });

                return {
                    ...resp,
                    frecuencias: frecuenciasNormalizadas as [
                        number,
                        number,
                        number,
                        number,
                        number,
                        number,
                    ],
                };
            }),
        );
    }

    /** Calcula distribución de notas a partir de críticas y frecuencias */
    private _calcularDistribucion(
        criticas: LibroCritica[],
        frecuencias: number[],
    ): { nota: number; cantidad: number; frecuencia: number }[] {
        const total = criticas.length;

        return [0, 1, 2, 3, 4, 5]
            .map((nota) => {
                const cantidad = frecuencias[nota] ?? 0;
                const frecuencia = total > 0 ? Number(((cantidad * 100) / total).toFixed(2)) : 0;

                return { nota, cantidad, frecuencia };
            })
            .filter((item) => item.cantidad > 0 || item.nota > 0); // Evita notas vacías
    }
}

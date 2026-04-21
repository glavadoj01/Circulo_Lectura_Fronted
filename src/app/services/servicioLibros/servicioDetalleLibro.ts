// Servicio para detalle de libro (detalle, críticas, distribución)
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '@environments/environments';
import {
    DetalleLibroCompleto,
    LibroApp,
    RespuestaCriticas,
} from '@interfaces/modelosApp/modelosApp';
import { BaseLibros } from './baseLibros';
import { manejarError, AppError } from '@app/shared/utils/error.utils';
import { valorNumeroSeguro } from '@app/shared/utils/validation.utils';
import { normalizarPuntuacion } from '@app/shared/utils/format.utils';

@Injectable({ providedIn: 'root' })
export class ServicioDetalleLibro {
    /**
     * Inicializa el servicio con el cliente HTTP de Angular para realizar las solicitudes al backend.
     * @param http Cliente HTTP de Angular para realizar las solicitudes al backend.
     */
    constructor(private readonly http: HttpClient) {}

    /**
     * Obtiene libro por ID, valida estructura y mapea campos
     * @param id ID del libro a obtener
     * @returns Observable con el libro mapeado y validado, o error tipificado en caso de fallo
     */
    private getLibroPorId(id: number): Observable<LibroApp> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}`;
        return this.http.get<DetalleLibroCompleto>(url).pipe(
            map((resp) => {
                const libro = resp.libro;
                if (!libro?.id_libro) {
                    throw new AppError('libro_respuesta_invalida', { id });
                }
                return BaseLibros.mapLibroApp(libro);
            }),
            catchError((error) => {
                throw manejarError(error, 'ServicioDetalleLibro.getLibroPorId', { id });
            }),
        );
    }

    /**
     * Obtiene críticas por ID libro, valida frecuencias y maneja errores HTTP
     * @param id ID del libro para obtener sus críticas
     * @returns Observable con las críticas y frecuencias normalizadas, o error tipificado en caso de fallo
     */
    private getCriticasPorIdLibro(id: number): Observable<RespuestaCriticas> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}/criticas`;
        return this.http.get<RespuestaCriticas>(url).pipe(
            map((resp) => {
                const frec = Array.isArray(resp.frecuencias) ? resp.frecuencias : [];
                const frecuenciasNormalizadas = [1, 2, 3, 4, 5].map((i) => {
                    const val = valorNumeroSeguro(frec[i - 1] ?? 0);
                    return normalizarPuntuacion(val);
                });
                return {
                    ...resp,
                    frecuencias: frecuenciasNormalizadas as [
                        number,
                        number,
                        number,
                        number,
                        number,
                    ],
                };
            }),
            catchError((error) => {
                throw manejarError(error, 'ServicioDetalleLibro.getCriticasPorIdLibro', { id });
            }),
        );
    }

    /**
     * Calcula distribución de notas a partir de críticas y frecuencias
     * @param frecuencias Array de frecuencias por nota
     * @returns Array con la distribución de notas (nota, cantidad, frecuencia)
     */
    private calcularDistribucion(
        frecuencias: number[],
    ): { nota: number; cantidad: number; frecuencia: number }[] {
        const total = frecuencias.reduce((sum, val) => sum + val, 0);
        return [5, 4, 3, 2, 1].map((nota) => {
            const cantidad = valorNumeroSeguro(Number(frecuencias[nota - 1] ?? 0));
            const frecuencia = total > 0 ? Number(((cantidad * 100) / total).toFixed(2)) : 0;
            return { nota, cantidad, frecuencia };
        });
    }

    /**
     * Método centralizado: obtiene libro + críticas + procesa todo
     * Lanza errores tipificados (LIBRO_NOT_FOUND, LIBRO_BAD_REQUEST, etc)
     * @param id ID del libro a obtener el detalle
     * @return Observable con el detalle completo del libro, incluyendo críticas y distribución de notas, o error tipificado en caso de fallo
     */
    getDetalleLibro(id: number): Observable<DetalleLibroCompleto> {
        return this.getLibroPorId(id).pipe(
            switchMap((libro) => {
                return this.getCriticasPorIdLibro(libro.id_libro).pipe(
                    map((respuesta) => ({
                        libro,
                        criticas: respuesta.criticas,
                        frecuencias: respuesta.frecuencias,
                        errorCriticas: false,
                    })),
                    catchError((error) => {
                        return of({
                            libro,
                            criticas: [],
                            frecuencias: [0, 0, 0, 0, 0],
                            errorCriticas: true,
                            error: manejarError(
                                error,
                                'ServicioDetalleLibro.getDetalleLibro.criticas',
                                {
                                    id,
                                },
                            ),
                        });
                    }),
                );
            }),
            map((data) => ({
                libro: data.libro,
                criticas: data.criticas,
                notasDistribucion: this.calcularDistribucion(data.frecuencias),
                errorCriticas: data.errorCriticas,
            })),
            catchError((error) => {
                throw manejarError(error, 'ServicioDetalleLibro.getDetalleLibro', { id });
            }),
        );
    }
}

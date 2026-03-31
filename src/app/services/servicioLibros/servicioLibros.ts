import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LibroApp, RespuestaCriticas } from '@app/interfaces/modelosApp/modelosApp';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { environment } from '@environments/environments';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

interface CacheCatalogoLibros {
    total: number | null;
    pages: Record<string, LibroApp[]>;
}

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
    private readonly cacheCatalogoKey = 'cacheCatalogoLibros';

    constructor(private http: HttpClient) {}

    getTotalLibros(): Observable<number> {
        const cache = this.leerCacheCatalogo();
        if (cache.total !== null) {
            console.log('[servicioLibros] Cache total hit:', cache.total);
            return of(cache.total);
        }

        const url = `${environment.apiUrl}:${environment.puerto}/libros/total`;
        console.log('[servicioLibros] GET', url);
        return this.http.get<{ total: number }>(url).pipe(
            map((resp) => {
                const total = Number(resp?.total ?? 0);
                const totalSeguro = Number.isFinite(total) && total > 0 ? total : 0;
                const cacheActual = this.leerCacheCatalogo();
                this.guardarCacheCatalogo({ ...cacheActual, total: totalSeguro });
                console.log('[servicioLibros] Total recibido y cacheado:', totalSeguro);
                return totalSeguro;
            }),
            catchError((error: unknown) => {
                if (error instanceof HttpErrorResponse) {
                    console.error('[servicioLibros] Error GET /libros/total:', error.status);
                    throw new Error(`CATALOGO_TOTAL_HTTP_${error.status}`);
                }
                console.error('[servicioLibros] Error desconocido en total');
                throw new Error('CATALOGO_TOTAL_ERROR');
            }),
        );
    }

    getCatalogoLibrosPaginado(page: number, limit = 10): Observable<LibroApp[]> {
        const key = `${page}_${limit}`;
        const cache = this.leerCacheCatalogo();
        if (cache.pages[key]) {
            console.log('[servicioLibros] Cache pagina hit:', key, 'items=', cache.pages[key].length);
            return of(cache.pages[key]);
        }

        const url = `${environment.apiUrl}:${environment.puerto}/libros?page=${page}&limit=${limit}`;
        console.log('[servicioLibros] GET', url);
        return this.http.get<LibroApp[]>(url).pipe(
            map((libros) => {
                const normalizados = this.normalizarYOrdenarLibros(libros);
                const cacheActual = this.leerCacheCatalogo();
                this.guardarCacheCatalogo({
                    ...cacheActual,
                    pages: {
                        ...cacheActual.pages,
                        [key]: normalizados,
                    },
                });
                console.log('[servicioLibros] Pagina recibida y cacheada:', key, 'items=', normalizados.length);
                return normalizados;
            }),
            catchError((error: unknown) => {
                if (error instanceof HttpErrorResponse) {
                    console.error('[servicioLibros] Error GET /libros paginado:', error.status, { page, limit });
                    throw new Error(`CATALOGO_PAGINA_HTTP_${error.status}`);
                }
                console.error('[servicioLibros] Error desconocido en pagina catalogo', { page, limit });
                throw new Error('CATALOGO_PAGINA_ERROR');
            }),
        );
    }

    limpiarCacheCatalogo(): void {
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(this.cacheCatalogoKey);
        }
    }

    /** Obtiene el catalogo completo de libros ordenado por id ascendente */
    getCatalogoLibros(): Observable<LibroApp[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/libros`;
        console.log('[servicioLibros] GET', url);

        return this.http.get<LibroApp[]>(url).pipe(
            map((libros) => this.normalizarYOrdenarLibros(libros)),
            catchError((error: unknown) => {
                if (error instanceof HttpErrorResponse) {
                    if (error.status === 404) {
                        throw new Error('CATALOGO_NOT_FOUND');
                    }
                    if (error.status === 500) {
                        throw new Error('CATALOGO_SERVER_ERROR');
                    }
                    throw new Error(`CATALOGO_HTTP_${error.status}`);
                }

                if (error instanceof Error) {
                    throw error;
                }

                throw new Error('CATALOGO_ERROR_DESCONOCIDO');
            }),
        );
    }

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

    private normalizarYOrdenarLibros(libros: LibroApp[]): LibroApp[] {
        const lista = Array.isArray(libros) ? libros : [];

        return lista
            .map((libro) => {
                const promedioRaw = libro.calificacionPromedio;
                const calificacionNum =
                    typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);

                return {
                    ...libro,
                    calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
                };
            })
            .sort((a, b) => Number(a.id_libro) - Number(b.id_libro));
    }

    private leerCacheCatalogo(): CacheCatalogoLibros {
        if (typeof window === 'undefined') {
            return { total: null, pages: {} };
        }

        const raw = window.sessionStorage.getItem(this.cacheCatalogoKey);
        if (!raw) {
            return { total: null, pages: {} };
        }

        try {
            const parsed = JSON.parse(raw) as CacheCatalogoLibros;
            return {
                total:
                    typeof parsed?.total === 'number' && Number.isFinite(parsed.total)
                        ? parsed.total
                        : null,
                pages: parsed?.pages && typeof parsed.pages === 'object' ? parsed.pages : {},
            };
        } catch {
            return { total: null, pages: {} };
        }
    }

    private guardarCacheCatalogo(cache: CacheCatalogoLibros): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
    }
}

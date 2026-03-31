// Importaciones node_modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
// Importaciones propias
import { LibroApp, RespuestaCriticas } from '@interfaces/modelosApp/modelosApp';
import { LibroCritica } from '@interfaces/modelosBD/modelosBD';
import { environment } from '@environments/environments';
import { throwMappedHttpError } from '@sharedUtils/http-error.utils';

interface CacheCatalogoLibros {
    total: number | null;
    pages: Record<string, LibroApp[]>;
    currentPage: number;
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

    private valorTextoSeguro(valor: unknown): string {
        if (typeof valor === 'string') {
            const limpio = valor.trim();
            return limpio.length > 0 ? limpio : '';
        }
        if (typeof valor === 'number' && Number.isFinite(valor)) {
            return String(valor);
        }
        return '';
    }

    private validarAutores(autores: unknown): Array<{ nombre_autor: string }> {
        if (!Array.isArray(autores)) {
            return [];
        }
        return autores
            .filter((item) => item && typeof item.nombre_autor === 'string')
            .map((item) => ({
                nombre_autor: item.nombre_autor.trim(),
            }));
    }

    private validarGeneros(generos: unknown): Array<{ nombre_genero: string }> {
        if (!Array.isArray(generos)) {
            return [];
        }
        return generos
            .filter((item) => item && typeof item.nombre_genero === 'string')
            .map((item) => ({
                nombre_genero: item.nombre_genero.trim(),
            }));
    }

    private mapLibroApp(libro: LibroApp): LibroApp {
        const promedioRaw = libro.calificacionPromedio;
        const calificacionNum = typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);
        const nombreIdioma = this.valorTextoSeguro(libro.nombre_idioma_original) || 'N/A';
        const sinopsis = this.valorTextoSeguro(libro.sinopsis);
        const titulo = this.valorTextoSeguro(libro.titulo_libro);
        const isbn = this.valorTextoSeguro(libro.codigo_isbn);
        const paginas = Number.isFinite(Number(libro.paginas)) ? Number(libro.paginas) : 0;

        return {
            ...libro,
            titulo_libro: titulo || 'Título no disponible',
            nombre_idioma_original: nombreIdioma,
            sinopsis: sinopsis || 'Sinopsis no disponible',
            codigo_isbn: isbn || 'N/A',
            paginas,
            calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
            autores: this.validarAutores(libro.autores),
            generos: this.validarGeneros(libro.generos),
            totalResenas: Number.isFinite(Number(libro.totalResenas))
                ? Number(libro.totalResenas)
                : 0,
        };
    }

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
                return throwMappedHttpError(error, {
                    context: '[servicioLibros] Error GET /libros/total:',
                    statusErrorPrefix: 'CATALOGO_TOTAL_HTTP',
                    unknownErrorCode: 'CATALOGO_TOTAL_ERROR',
                });
            }),
        );
    }

    getCatalogoLibrosPaginado(page: number, limit = 10): Observable<LibroApp[]> {
        const key = `${page}_${limit}`;
        const cache = this.leerCacheCatalogo();
        if (cache.pages[key]) {
            console.log(
                '[servicioLibros] Cache pagina hit:',
                key,
                'items=',
                cache.pages[key].length,
            );
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
                console.log(
                    '[servicioLibros] Pagina recibida y cacheada:',
                    key,
                    'items=',
                    normalizados.length,
                );
                return normalizados;
            }),
            catchError((error: unknown) => {
                return throwMappedHttpError(error, {
                    context: '[servicioLibros] Error GET /libros paginado:',
                    statusErrorPrefix: 'CATALOGO_PAGINA_HTTP',
                    unknownErrorCode: 'CATALOGO_PAGINA_ERROR',
                    meta: { page, limit },
                });
            }),
        );
    }

    limpiarCacheCatalogo(): void {
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(this.cacheCatalogoKey);
        }
    }

    getPaginaCatalogoActual(): number {
        const cache = this.leerCacheCatalogo();
        return cache.currentPage;
    }

    setPaginaCatalogoActual(page: number): void {
        const paginaSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const cacheActual = this.leerCacheCatalogo();
        this.guardarCacheCatalogo({
            ...cacheActual,
            currentPage: paginaSegura,
        });
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

                return this.mapLibroApp(libro);
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

        // Si no hay críticas, devuelve distribución vacía pero válida
        if (total === 0) {
            return [];
        }

        return [5, 4, 3, 2, 1].map((nota) => {
            const cantidad = Number(frecuencias[nota] ?? 0);
            const cantidadSegura = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0;
            const frecuencia = total > 0 ? Number(((cantidadSegura * 100) / total).toFixed(2)) : 0;

            return { nota, cantidad: cantidadSegura, frecuencia };
        });
    }

    private normalizarYOrdenarLibros(libros: LibroApp[]): LibroApp[] {
        const lista = Array.isArray(libros) ? libros : [];

        return lista
            .map((libro) => this.mapLibroApp(libro))
            .sort((a, b) => Number(a.id_libro) - Number(b.id_libro));
    }

    private leerCacheCatalogo(): CacheCatalogoLibros {
        if (typeof window === 'undefined') {
            return { total: null, pages: {}, currentPage: 1 };
        }

        const raw = window.sessionStorage.getItem(this.cacheCatalogoKey);
        if (!raw) {
            return { total: null, pages: {}, currentPage: 1 };
        }

        try {
            const parsed = JSON.parse(raw) as CacheCatalogoLibros;
            return {
                total:
                    typeof parsed?.total === 'number' && Number.isFinite(parsed.total)
                        ? parsed.total
                        : null,
                pages: parsed?.pages && typeof parsed.pages === 'object' ? parsed.pages : {},
                currentPage:
                    typeof parsed?.currentPage === 'number' &&
                    Number.isFinite(parsed.currentPage) &&
                    parsed.currentPage > 0
                        ? Math.floor(parsed.currentPage)
                        : 1,
            };
        } catch {
            return { total: null, pages: {}, currentPage: 1 };
        }
    }

    private guardarCacheCatalogo(cache: CacheCatalogoLibros): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
    }
}

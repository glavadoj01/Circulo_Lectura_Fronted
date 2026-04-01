// Importaciones node_modules
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
// Importaciones propias
import { environment } from '@environments/environments';
import { LibroApp, RespuestaCriticas } from '@interfaces/modelosApp/modelosApp';
import { LibroCritica } from '@interfaces/modelosBD/modelosBD';
import { throwMappedHttpError } from '@sharedUtils/http-error.utils';
import { valorTextoSeguro, validarAutores, validarGeneros } from '@sharedUtils/validation.utils';

/** Cache almacenada para el catálogo de libros */
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
    /** Clave para almacenar el cache del catálogo en sessionStorage */
    private readonly cacheCatalogoKey = 'cacheCatalogoLibros';

    /** Señal reactiva para la página actual del catálogo */
    readonly paginaActual = signal<number>(1);

    /** Constructor que inyecta el cliente HTTP para el servicio */
    constructor(private http: HttpClient) {
        // Inicializa la señal con el valor del cache
        this.paginaActual.set(this.getPaginaCatalogoActual());
    }

    /* ------------------------------------------------------------------
     * MÉTODOS Comunes de Mapeo y Validación
     * ---------------------------------------------------------------
     */

    /** Mapeo y limpieza de datos para un libro
     * Centraliza la validación y normalización de campos del libro, para asegurar que el componente reciba datos consistentes y seguros.
     * @input libro Objeto libro recibido del backend, con campos potencialmente inconsistentes o mal formateados
     * @returns LibroApp con campos validados, normalizados y con valores por defecto si es necesario
     */
    private mapLibroApp(libro: LibroApp): LibroApp {
        const promedioRaw = libro.calificacionPromedio;
        const calificacionNum = typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);
        const nombreIdioma = valorTextoSeguro(libro.nombre_idioma_original) || 'N/A';
        const sinopsis = valorTextoSeguro(libro.sinopsis);
        const titulo = valorTextoSeguro(libro.titulo_libro);
        const isbn = valorTextoSeguro(libro.codigo_isbn);
        const paginas = Number.isFinite(Number(libro.paginas)) ? Number(libro.paginas) : 0;

        return {
            ...libro,
            titulo_libro: titulo || 'Título no disponible',
            nombre_idioma_original: nombreIdioma,
            sinopsis: sinopsis || 'Sinopsis no disponible',
            codigo_isbn: isbn || 'N/A',
            paginas,
            calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
            autores: validarAutores(libro.autores),
            generos: validarGeneros(libro.generos),
            totalResenas: Number.isFinite(Number(libro.totalResenas))
                ? Number(libro.totalResenas)
                : 0,
        };
    }

    /* ------------------------------------------------------------------
     * MÉTODOS DE CATALOGO DE LIBROS
     * ---------------------------------------------------------------
     */

    /** Nornmaliza y ordena  la respuesta de libros por id
     * Centraliza la normalización de campos y ordenamiento de libros por ID, para asegurar que el catálogo siempre se presente de forma consistente y ordenada, incluso si el backend devuelve datos con formatos o inconsistencias inesperadas.
     * @input libros Array de libros recibido del backend, que puede contener objetos con campos mal formateados o inconsistentes
     * @returns Array de libros normalizados y ordenados por ID, con valores por defecto si es necesario
     */
    private normalizarYOrdenarLibros(libros: LibroApp[]): LibroApp[] {
        const lista = Array.isArray(libros) ? libros : [];

        return lista
            .map((libro) => this.mapLibroApp(libro))
            .sort((a, b) => Number(a.id_libro) - Number(b.id_libro));
    }

    /** Obtiene el total de libros en el catálogo
     * Utiliza cache para evitar llamadas repetidas,
     * en caso contrario, hace petición al backend y cachea el resultado.
     * @returns Observable con el total de libros en el catálogo
     */
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

    /** Obtiene una pagina del catalog de libros
     * Utiliza cache para evitar llamadas repetidas a páginas ya obtenidas,
     * en caso contrario, hace petición al backend y cachea el resultado.
     * @input page Número de página a obtener (1-based)
     * @input limit Cantidad de libros por página (default: 10)
     * @returns Observable con el array de libros para la página solicitada
     */
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

    /** Obtiene la página actual del catálogo
     * Lee del cache la página actual, si no existe devuelve 1 por defecto.
     * @returns Número de página actual del catálogo (1-based)
     */
    getPaginaCatalogoActual(): number {
        const cache = this.leerCacheCatalogo();
        return cache.currentPage;
    }

    /** Establece la página actual del catálogo
     * Valida que el número de página sea un entero positivo, si no lo es, establece 1 por defecto.
     * @input page Número de página a establecer como actual (1-based)
     */
    setPaginaCatalogoActual(page: number): void {
        const paginaSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        const cacheActual = this.leerCacheCatalogo();
        this.guardarCacheCatalogo({
            ...cacheActual,
            currentPage: paginaSegura,
        });
        this.paginaActual.set(paginaSegura);
    }

    /* ------------------------------------------------------------------
     * MÉTODOS DE DETALLE DE LIBRO
     * ---------------------------------------------------------------
     */

    /** Obtiene libro por ID, valida estructura
     * Valida que el libro exista y tenga un ID válido, luego mapea y normaliza sus campos para asegurar que el componente reciba datos consistentes y seguros.
     * @input id ID del libro a obtener
     * @returns Observable con el libro mapeado y validado, o error tipificado en caso de fallo
     */
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

    /** Obtiene críticas por ID libro, valida frecuencias
     * Valida que la respuesta tenga el formato esperado, y normaliza las frecuencias para asegurar que sean números finitos, incluso si el backend devuelve datos inconsistentes.
     * @input id ID del libro para obtener sus críticas
     * @returns Observable con las críticas y frecuencias normalizadas, o error tipificado en caso de fallo
     */
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

    /** Calcula distribución de notas a partir de críticas y frecuencias
     * Calcula la cantidad y frecuencia de cada nota (1 a 5) basada en las críticas recibidas y las frecuencias proporcionadas por el backend, asegurando que los cálculos sean robustos incluso con datos inconsistentes.
     * @input criticas Array de críticas del libro, utilizado para calcular el total de críticas
     * @input frecuencias Array de frecuencias por nota proporcionado por el backend, que puede contener datos inconsistentes
     * @returns Array con la distribución de notas, incluyendo la nota, cantidad de críticas para esa nota, y la frecuencia porcentual respecto al total de críticas
     */
    private _calcularDistribucion(
        criticas: LibroCritica[],
        frecuencias: number[],
    ): { nota: number; cantidad: number; frecuencia: number }[] {
        const total = criticas.length;

        // Si no hay críticas, devuelve distribución vacía pero válida
        if (total === 0) {
            return [];
        }

        // Con esto, logramos la presentación más/arriba a menos/abajo
        return [5, 4, 3, 2, 1].map((nota) => {
            const cantidad = Number(frecuencias[nota] ?? 0);
            const cantidadSegura = Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 0;
            const frecuencia = total > 0 ? Number(((cantidadSegura * 100) / total).toFixed(2)) : 0;

            return { nota, cantidad: cantidadSegura, frecuencia };
        });
    }

    /** MÉTODO CENTRALIZADO: obtiene libro + críticas + procesa todo
     * Lanza errores tipificados (LIBRO_NOT_FOUND, LIBRO_BAD_REQUEST, etc)
     * @input id ID del libro a obtener el detalle
     * @return Observable con el detalle completo del libro, incluyendo críticas y distribución de notas, o error tipificado en caso de fallo
     */
    getDetalleLibro(id: number): Observable<DetalleLibroCompleto> {
        console.log('[servicioLibros] Iniciando carga detalle para libro id=', id);

        // Stream: Libro -> Criticas -> Unidon en $data
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

    /* ------------------------------------------------------------------
     * MÉTODOS DE CACHE PARA CATALOGO
     * ---------------------------------------------------------------
     */

    /** Lee la cache del catálgo de libros desde sessionStorage
     * @returns CacheCatalogoLibros con el total, páginas cacheadas y página actual, o valores por defecto si no existe o es inválida
     */
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

    /** Guarda la respuesta en cache de sessionStorage
     * @input cache CacheCatalogoLibros con el total, páginas cacheadas y página actual a guardar en sessionStorage
     */
    private guardarCacheCatalogo(cache: CacheCatalogoLibros): void {
        if (typeof window === 'undefined') {
            return;
        }

        window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
    }
}

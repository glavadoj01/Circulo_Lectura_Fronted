// Servicio para catálogo de libros (paginación, cache, total)
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { manejarError, AppError } from '@app/shared/utils/error.utils';
import { environment } from '@environments/environments';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { BaseLibros } from './baseLibros';

/**
 * Cache para el catálogo de libros, almacenando el total de libros, las páginas ya cargadas y la página actual.
 * Esto permite reducir las llamadas HTTP al backend y mejorar la experiencia del usuario al navegar por el catálogo.
 * - total: número total de libros en el catálogo (puede ser null si no se ha cargado aún).
 * - pages: objeto que mapea cada página (clave) a su lista de libros correspondiente (valor).
 * - currentPage: número de la página actual que el usuario está viendo.
 */
interface CacheCatalogoLibros {
    total: number | null;
    pages: Record<string, LibroApp[]>;
    currentPage: number;
}

@Injectable({ providedIn: 'root' })
export class servicioCatalogoLibros {
    private readonly cacheCatalogoKey = 'cacheCatalogoLibros';
    readonly paginaActual = signal<number>(1);

    /**
     * Inicializa el servicio, cargando la página actual del catálogo desde la cache si está disponible.
     * @param http Cliente HTTP de Angular para realizar las solicitudes al backend.
     */
    constructor(private http: HttpClient) {
        this.paginaActual.set(this.getPaginaCatalogoActual());
    }

    /**
     * Obtiene el número total de libros en el catálogo. Primero intenta leerlo desde la cache, y si no está disponible, realiza una solicitud HTTP al backend.
     * @returns Número total de libros en el catálogo.
     */
    getTotalLibros(): Observable<number> {
        try {
            let cacheActual = this.leerCacheCatalogo();
            if (cacheActual.total !== null) {
                return of(cacheActual.total);
            }
            const url = `${environment.apiUrl}:${environment.puerto}/libros/total`;
            return this.http.get<{ total: number }>(url).pipe(
                map((resp) => {
                    const total = Number(resp?.total ?? 0);
                    const totalSeguro = Number.isFinite(total) && total > 0 ? total : 0;

                    this.guardarCacheCatalogo({ ...cacheActual, total: totalSeguro });
                    return totalSeguro;
                }),
                catchError((error) => {
                    throw manejarError(error, 'servicioCatalogoLibros.getTotalLibros.http');
                }),
            );
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.getTotalLibros.cache');
        }
    }

    /**
     * Obtiene una página del catálogo de libros, utilizando la cache si está disponible.
     * Si la página no está en la cache, realiza una solicitud HTTP al backend para obtener los libros de esa página, los normaliza y los guarda en la cache antes de devolverlos.
     * @param page Número de página a obtener.
     * @param sort Propiedad por la cual ordenar los libros (por defecto 'id_libro').
     * @param limit Número de libros por página (por defecto es 10).
     * @returns Lista de libros correspondientes a la página solicitada.
     */
    getCatalogoLibrosPaginado(page: number, sort = 'id_libro', limit = 10): Observable<LibroApp[]> {
        const key = `${page}_${limit}`;

        try {
            let cacheActual = this.leerCacheCatalogo();
            if (cacheActual.pages[key]) {
                return of(cacheActual.pages[key]);
            }

            const url = `${environment.apiUrl}:${environment.puerto}/libros?page=${page}&limit=${limit}`;
            return this.http.get<LibroApp[]>(url).pipe(
                map((libros) => {
                    const normalizados = BaseLibros.normalizarYOrdenarLibros(libros, sort);
                    this.guardarCacheCatalogo({
                        ...cacheActual,
                        pages: {
                            ...cacheActual.pages,
                            [key]: normalizados,
                        },
                    });
                    return normalizados;
                }),
                catchError((error) => {
                    throw manejarError(
                        error,
                        'servicioCatalogoLibros.getCatalogoLibrosPaginado.http',
                    );
                }),
            );
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.getCatalogoLibrosPaginado.cache');
        }
    }

    /**
     * Obtiene la página actual del catálogo desde la cache. Si no hay una página guardada, devuelve 1 como valor predeterminado.
     * @returns Número de la página actual del catálogo.
     */
    getPaginaCatalogoActual(): number {
        try {
            const cache = this.leerCacheCatalogo();
            return cache.currentPage;
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.getPaginaCatalogoActual');
        }
    }

    /**
     * Actualiza la página actual del catálogo tanto en la señal reactiva como en la cache, asegurando que el número de página sea un entero positivo.
     * @param page Número de la página a establecer.
     */
    setPaginaCatalogoActual(page: number): void {
        const paginaSegura = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
        try {
            const cacheActual = this.leerCacheCatalogo();
            this.guardarCacheCatalogo({
                ...cacheActual,
                currentPage: paginaSegura,
            });
            this.paginaActual.set(paginaSegura);
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.setPaginaCatalogoActual');
        }
    }

    /**
     * Lee la cache del catálogo de libros desde sessionStorage, asegurando que los datos estén correctamente parseados y validados.
     * @returns Objeto con la información del catálogo almacenada en cache.
     */
    private leerCacheCatalogo(): CacheCatalogoLibros {
        if (typeof window === 'undefined') {
            throw new AppError('catalogo_cache_no_window');
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
        } catch (error) {
            throw new AppError('catalogo_cache_parse', { raw });
        }
    }

    /**
     * Guarda la información del catálogo de libros en sessionStorage, asegurando que los datos se serialicen correctamente y manejando cualquier error que pueda ocurrir durante el proceso.
     * @param cache Objeto con la información del catálogo que se desea guardar en cache.
     */
    private guardarCacheCatalogo(cache: CacheCatalogoLibros): void {
        if (typeof window === 'undefined') {
            throw new AppError('catalogo_cache_no_window');
        }
        try {
            window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
        } catch (error) {
            throw new AppError('catalogo_cache_guardar', { error });
        }
    }
}

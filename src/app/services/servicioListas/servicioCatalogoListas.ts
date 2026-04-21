import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { manejarError, AppError } from '@app/shared/utils/error.utils';
import { environment } from '@environments/environments';
import { ListaApp } from '@app/interfaces/modelosApp/modelosApp';

interface CacheCatalogoListas {
    total: number | null;
    pages: Record<string, ListaApp[]>;
    currentPage: number;
}

@Injectable({ providedIn: 'root' })
export class ServicioCatalogoListas {
    private readonly cacheCatalogoKey = 'cacheCatalogoListas';
    readonly paginaActual = signal<number>(1);

    constructor(private readonly http: HttpClient) {
        this.paginaActual.set(this.getPaginaCatalogoActual());
    }

    getTotalListas(): Observable<number> {
        try {
            let cacheActual = this.leerCacheCatalogo();
            if (cacheActual.total !== null) {
                return of(cacheActual.total);
            }
            const url = `${environment.apiUrl}:${environment.puerto}/listas`;
            return this.http.get<ListaApp[]>(url).pipe(
                map((resp) => {
                    const total = Array.isArray(resp) ? resp.length : 0;
                    this.guardarCacheCatalogo({ ...cacheActual, total });
                    return total;
                }),
                catchError((error) => {
                    throw manejarError(error, 'ServicioCatalogoListas.getTotalListas.http');
                }),
            );
        } catch (error) {
            throw manejarError(error, 'ServicioCatalogoListas.getTotalListas.cache');
        }
    }

    getCatalogoListasPaginado(page: number, limit = 10): Observable<ListaApp[]> {
        const key = `${page}_${limit}`;
        try {
            let cacheActual = this.leerCacheCatalogo();
            if (cacheActual.pages[key]) {
                return of(cacheActual.pages[key]);
            }
            const url = `${environment.apiUrl}:${environment.puerto}/listas?page=${page}&limit=${limit}`;
            return this.http.get<ListaApp[]>(url).pipe(
                map((listas) => {
                    this.guardarCacheCatalogo({
                        ...cacheActual,
                        pages: {
                            ...cacheActual.pages,
                            [key]: listas,
                        },
                    });
                    return listas;
                }),
                catchError((error) => {
                    throw manejarError(
                        error,
                        'ServicioCatalogoListas.getCatalogoListasPaginado.http',
                    );
                }),
            );
        } catch (error) {
            throw manejarError(error, 'ServicioCatalogoListas.getCatalogoListasPaginado.cache');
        }
    }

    getPaginaCatalogoActual(): number {
        try {
            const cache = this.leerCacheCatalogo();
            return cache.currentPage;
        } catch (error) {
            throw manejarError(error, 'ServicioCatalogoListas.getPaginaCatalogoActual');
        }
    }

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
            throw manejarError(error, 'ServicioCatalogoListas.setPaginaCatalogoActual');
        }
    }

    private leerCacheCatalogo(): CacheCatalogoListas {
        if (globalThis.window === undefined) {
            throw new AppError('catalogo_cache_no_window');
        }
        const raw = globalThis.window.sessionStorage.getItem(this.cacheCatalogoKey);
        if (!raw) {
            return { total: null, pages: {}, currentPage: 1 };
        }
        try {
            const parsed = JSON.parse(raw) as CacheCatalogoListas;
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

    private guardarCacheCatalogo(cache: CacheCatalogoListas): void {
        if (globalThis.window === undefined) {
            throw new AppError('catalogo_cache_no_window');
        }
        try {
            globalThis.window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
        } catch (error) {
            throw new AppError('catalogo_cache_guardar', { error });
        }
    }
}

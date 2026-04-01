// Servicio para catálogo de libros (paginación, cache, total)
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { manejarError, AppError } from '@app/shared/utils/error.utils';
import { environment } from '@environments/environments';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { BaseLibros } from './baseLibros';

interface CacheCatalogoLibros {
    total: number | null;
    pages: Record<string, LibroApp[]>;
    currentPage: number;
}

@Injectable({ providedIn: 'root' })
export class servicioCatalogoLibros {
    private readonly cacheCatalogoKey = 'cacheCatalogoLibros';
    readonly paginaActual = signal<number>(1);

    constructor(private http: HttpClient) {
        this.paginaActual.set(this.getPaginaCatalogoActual());
    }

    getTotalLibros(): Observable<number> {
        try {
            const cache = this.leerCacheCatalogo();
            if (cache.total !== null) {
                return of(cache.total);
            }
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.getTotalLibros.cache');
        }
        const url = `${environment.apiUrl}:${environment.puerto}/libros/total`;
        return this.http.get<{ total: number }>(url).pipe(
            map((resp) => {
                const total = Number(resp?.total ?? 0);
                const totalSeguro = Number.isFinite(total) && total > 0 ? total : 0;
                let cacheActual;
                try {
                    cacheActual = this.leerCacheCatalogo();
                } catch (error) {
                    throw manejarError(error, 'servicioCatalogoLibros.getTotalLibros.cache');
                }
                this.guardarCacheCatalogo({ ...cacheActual, total: totalSeguro });
                return totalSeguro;
            }),
            catchError((error) => {
                throw manejarError(error, 'servicioCatalogoLibros.getTotalLibros.http');
            })
        );
    }

    getCatalogoLibrosPaginado(page: number, limit = 10): Observable<LibroApp[]> {
        const key = `${page}_${limit}`;
        let cache;
        try {
            cache = this.leerCacheCatalogo();
        } catch (error) {
            throw manejarError(error, 'servicioCatalogoLibros.getCatalogoLibrosPaginado.cache');
        }
        if (cache.pages[key]) {
            return of(cache.pages[key]);
        }
        const url = `${environment.apiUrl}:${environment.puerto}/libros?page=${page}&limit=${limit}`;
        return this.http.get<LibroApp[]>(url).pipe(
            map((libros) => {
                const normalizados = BaseLibros.normalizarYOrdenarLibros(libros);
                let cacheActual;
                try {
                    cacheActual = this.leerCacheCatalogo();
                } catch (error) {
                    throw manejarError(error, 'servicioCatalogoLibros.getCatalogoLibrosPaginado.cache');
                }
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
                throw manejarError(error, 'servicioCatalogoLibros.getCatalogoLibrosPaginado.http');
            })
        );
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
        this.paginaActual.set(paginaSegura);
    }

    private leerCacheCatalogo(): CacheCatalogoLibros {
        if (typeof window === 'undefined') {
            throw new AppError('catalogo_cache_window');
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

    private guardarCacheCatalogo(cache: CacheCatalogoLibros): void {
        if (typeof window === 'undefined') {
            return;
        }
        window.sessionStorage.setItem(this.cacheCatalogoKey, JSON.stringify(cache));
    }
}

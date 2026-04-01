// Importaciones node_modules
import { Component, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
// Importaciones propias
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { servicioLibros } from '@services/servicioLibros/servicioLibros';
import { BannerCargando } from '@sharedComponents/banner-cargando/banner-cargando';
import { BannerError } from '@sharedComponents/banner-error/banner-error';
import { Paginacion } from '@sharedComponents/paginacion/paginacion';
import { LibroCard } from '@sharedComponents/libro-card/libro-card';

@Component({
    selector: 'app-libros',
    imports: [BannerCargando, BannerError, Paginacion, LibroCard],
    templateUrl: './libros.html',
})
export class Libros {
    private readonly destroyRef = inject(DestroyRef);

    // Propiedades de estado reactivas con valor inicial
    librosPagina = signal<LibroApp[]>([]);
    readonly tamanioPagina = 10;
    cargando = signal(true);
    errorCarga = signal(false);
    totalResultados = signal(0);

    // Propiedades computadas (reaccionan a cambios en las señales que utilizan)
    totalPaginas = computed(() =>
        Math.max(1, Math.ceil(this.totalResultados() / this.tamanioPagina)),
    );
    primeraPosicionPagina = computed(() => {
        if (this.totalResultados() === 0) {
            return 0;
        }
        return (this.servicioLibros.paginaActual() - 1) * this.tamanioPagina + 1;
    });
    ultimaPosicionPagina = computed(() =>
        Math.min(this.servicioLibros.paginaActual() * this.tamanioPagina, this.totalResultados()),
    );

    // Inyección de servicios y carga inicial del catálogo
    constructor(private servicioLibros: servicioLibros) {
        console.log('[CatalogoLibros] Constructor: iniciando carga de catalogo');
        this.cargarCatalogo();
    }

    /**
     *
     * @param nuevaPagina
     * @returns void
     */
    cambiarPagina(nuevaPagina: number): void {
        if (
            nuevaPagina < 1 ||
            nuevaPagina > this.totalPaginas() ||
            nuevaPagina === this.servicioLibros.paginaActual()
        ) {
            return;
        }

        this.servicioLibros.setPaginaCatalogoActual(nuevaPagina);
        console.log('[CatalogoLibros] Cambio de pagina:', nuevaPagina);
        this.cargarPagina(nuevaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    private cargarCatalogo(): void {
        console.log('[CatalogoLibros] cargarCatalogo: inicio');
        this.cargando.set(true);
        this.errorCarga.set(false);

        this.servicioLibros
            .getTotalLibros()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (total) => {
                    console.log('[CatalogoLibros] total recibido:', total);
                    this.totalResultados.set(total);

                    if (total === 0) {
                        this.servicioLibros.setPaginaCatalogoActual(1);
                        this.librosPagina.set([]);
                        this.cargando.set(false);
                        return;
                    }

                    const totalPaginas = Math.max(1, Math.ceil(total / this.tamanioPagina));
                    const paginaPersistida = this.servicioLibros.getPaginaCatalogoActual();
                    const paginaInicial = Math.min(Math.max(1, paginaPersistida), totalPaginas);

                    this.servicioLibros.setPaginaCatalogoActual(paginaInicial);
                    this.cargarPagina(paginaInicial);
                },
                error: (error: unknown) => {
                    const mensaje = error instanceof Error ? error.message : 'ERROR_DESCONOCIDO';
                    console.error('[CatalogoLibros] Error al cargar catalogo:', mensaje);
                    console.error('[CatalogoLibros] Detalle error catalogo:', error);
                    this.errorCarga.set(true);
                    this.librosPagina.set([]);
                    this.cargando.set(false);
                },
            });
    }

    private cargarPagina(pagina: number): void {
        console.log('[CatalogoLibros] cargarPagina: inicio', {
            pagina,
            tamanio: this.tamanioPagina,
        });
        this.cargando.set(true);
        this.errorCarga.set(false);

        this.servicioLibros
            .getCatalogoLibrosPaginado(pagina, this.tamanioPagina)
            .pipe(
                finalize(() => this.cargando.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (libros: LibroApp[]) => {
                    console.log('[CatalogoLibros] pagina recibida:', {
                        pagina,
                        items: libros.length,
                    });
                    this.librosPagina.set(libros);
                },
                error: (error: unknown) => {
                    const mensaje = error instanceof Error ? error.message : 'ERROR_DESCONOCIDO';
                    console.error('[CatalogoLibros] Error al cargar pagina:', mensaje);
                    console.error('[CatalogoLibros] Detalle error pagina:', error);
                    this.errorCarga.set(true);
                    this.librosPagina.set([]);
                },
            });
    }
}

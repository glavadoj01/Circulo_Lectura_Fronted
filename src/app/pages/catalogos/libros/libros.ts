import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { LibroApp } from '@app/interfaces/modelosApp/modelosApp';
import { EstrellasPuntuacion } from '@app/shared/components/estrellas-puntuacion/estrellas-puntuacion';
import { BannerCargando } from '@app/shared/components/banner-cargando/banner-cargando';
import { BannerError } from '@app/shared/components/banner-error/banner-error';
import { Paginacion } from '@app/shared/components/paginacion/paginacion';
import { servicioLibros } from '@services/servicioLibros/servicioLibros';

@Component({
    selector: 'app-libros',
    imports: [RouterLink, EstrellasPuntuacion, BannerCargando, BannerError, Paginacion],
    templateUrl: './libros.html',
})
export class Libros {
    librosPagina = signal<LibroApp[]>([]);
    paginaActual = signal(1);
    readonly tamanioPagina = 10;
    cargando = signal(true);
    errorCarga = signal(false);
    totalResultados = signal(0);

    totalPaginas = computed(() =>
        Math.max(1, Math.ceil(this.totalResultados() / this.tamanioPagina)),
    );

    primeraPosicionPagina = computed(() => {
        if (this.totalResultados() === 0) {
            return 0;
        }
        return (this.paginaActual() - 1) * this.tamanioPagina + 1;
    });

    ultimaPosicionPagina = computed(() =>
        Math.min(this.paginaActual() * this.tamanioPagina, this.totalResultados()),
    );

    constructor(private servicioLibros: servicioLibros) {
        console.log('[CatalogoLibros] Constructor: iniciando carga de catalogo');
        this.cargarCatalogo();
    }

    cambiarPagina(nuevaPagina: number): void {
        if (
            nuevaPagina < 1 ||
            nuevaPagina > this.totalPaginas() ||
            nuevaPagina === this.paginaActual()
        ) {
            return;
        }

        this.paginaActual.set(nuevaPagina);
        console.log('[CatalogoLibros] Cambio de pagina:', nuevaPagina);
        this.cargarPagina(nuevaPagina);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    portadaLibro(idLibro: number): string {
        return `https://picsum.photos/seed/libro-${idLibro}/400/600`;
    }

    autorPrincipal(libro: LibroApp): string {
        const autor = libro.autores?.[0]?.nombre_autor;
        return autor ?? 'Autor desconocido';
    }

    puntuacionTexto(libro: LibroApp): string {
        const puntuacion = Number(libro.calificacionPromedio ?? 0);
        return puntuacion.toFixed(1);
    }

    private cargarCatalogo(): void {
        console.log('[CatalogoLibros] cargarCatalogo: inicio');
        this.cargando.set(true);
        this.errorCarga.set(false);

        this.servicioLibros
            .getTotalLibros()
            .pipe(finalize(() => this.cargando.set(false)))
            .subscribe({
                next: (total) => {
                    console.log('[CatalogoLibros] total recibido:', total);
                    this.totalResultados.set(total);
                    this.paginaActual.set(1);

                    if (total === 0) {
                        this.librosPagina.set([]);
                        return;
                    }

                    this.cargarPagina(1);
                },
                error: (error: unknown) => {
                    const mensaje = error instanceof Error ? error.message : 'ERROR_DESCONOCIDO';
                    console.error('[CatalogoLibros] Error al cargar catalogo:', mensaje);
                    console.error('[CatalogoLibros] Detalle error catalogo:', error);
                    this.errorCarga.set(true);
                    this.librosPagina.set([]);
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
            .pipe(finalize(() => this.cargando.set(false)))
            .subscribe({
                next: (libros) => {
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

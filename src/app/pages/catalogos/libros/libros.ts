// Importaciones node_modules
import { Component, signal, computed, inject, DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
// Importaciones propias
import { ServicioCatalogoLibros } from '@services/servicioLibros/servicioCatalogoLibros';
import { BannerCargando } from '@sharedComponents/banner-cargando/banner-cargando';
import { BannerError } from '@sharedComponents/banner-error/banner-error';
import { manejarError } from '@sharedUtils/error.utils';
import { Paginacion } from '@sharedComponents/paginacion/paginacion';
import { LibroCard } from '@sharedComponents/libro-card/libro-card';
import { LibroResumen } from '@interfaces/modelosApp/modelosApp';
import { FiltrosLibros } from '@app/shared/components/filtros-libros/filtros-libros';

/**
 * Componente para mostrar un catálogo de libros con paginación. Permite navegar entre páginas de libros, mostrando un número limitado de libros por página. El componente maneja el estado de carga y errores, y utiliza servicios para obtener los datos del catálogo desde el backend.
 * El componente utiliza señales para manejar el estado de los libros, la página actual, el total de resultados, y los estados de carga y error. También incluye propiedades computadas para calcular el total de páginas y las posiciones de los libros mostrados en la página actual.
 * La lógica de carga del catálogo se realiza en dos pasos: primero se obtiene el total de libros para calcular el número de páginas, y luego se carga la página específica de libros. El componente también maneja la persistencia de la página actual en el servicio para mantener la navegación consistente.
 */

@Component({
    selector: 'app-libros',
    imports: [BannerCargando, BannerError, Paginacion, LibroCard, FiltrosLibros],
    templateUrl: './libros.html',
})
export class Libros {
    filtrosSeleccionados = signal<{
        generos: number[];
        autores: number[];
        years: number[];
        valoraciones: number[];
    } | null>(null);
    private readonly destroyRef = inject(DestroyRef);
    private readonly servicioLibros = inject(ServicioCatalogoLibros);
    readonly tamanioPagina: number = 12;

    librosPagina = signal<LibroResumen[]>([]);
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
        return (this.servicioLibros.paginaActual() - 1) * this.tamanioPagina + 1;
    });
    ultimaPosicionPagina = computed(() =>
        Math.min(this.servicioLibros.paginaActual() * this.tamanioPagina, this.totalResultados()),
    );

    /**
     * Inicializa el componente
     */
    constructor() {
        console.log('[CatalogoLibros] Constructor: iniciando carga de catalogo');
        this.cargarCatalogo();
    }

    onFiltrosAplicados(filtros: {
        generos: number[];
        autores: number[];
        years: number[];
        valoraciones: number[];
    }) {
        this.servicioLibros
            .getTotalLibros(filtros)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (totalFiltrado) => {
                    this.totalResultados.set(totalFiltrado);

                    // 2. Resetear página a 1
                    this.servicioLibros.setPaginaCatalogoActual(1);

                    // 3. Cargar página 1 con filtros
                    this.cargarPagina(1, filtros);
                },
                error: (error) => {
                    manejarError(error, 'onFiltrosAplicados.totalFiltrado');
                    this.totalResultados.set(0);
                    this.librosPagina.set([]);
                },
            });
    }

    /**
     * Carga el catálogo de libros, obteniendo primero el total de libros para calcular el número de páginas, y luego cargando la página específica de libros. Maneja los estados de carga y error, y persiste la página actual en el servicio para mantener la navegación consistente. En caso de error, muestra un mensaje de error y limpia la lista de libros.
     * El método utiliza el operador `takeUntilDestroyed` para asegurar que las suscripciones se limpien automáticamente cuando el componente se destruya, evitando fugas de memoria. También utiliza el operador `finalize` para asegurar que el estado de carga se actualice correctamente al finalizar la carga, independientemente de si fue exitosa o si ocurrió un error.
     */
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
                    manejarError(error, 'Libros.cargarCatalogo');
                    this.errorCarga.set(true);
                    this.librosPagina.set([]);
                    this.cargando.set(false);
                },
            });
    }

    /**
     * Carga una página específica de libros, actualizando el estado de carga y error según corresponda. El método obtiene los libros paginados desde el servicio, y en caso de éxito actualiza la lista de libros para la página actual. En caso de error, muestra un mensaje de error y limpia la lista de libros.
     * @param pagina Número de página a cargar. Debe ser un número entero positivo que corresponda a una página válida dentro del total de páginas calculado. El método valida que la página sea válida antes de realizar la carga, y maneja los estados de carga y error de manera adecuada para proporcionar una experiencia de usuario consistente.
     */
    private cargarPagina(
        pagina: number,
        filtros?: { generos: number[]; autores: number[]; years: number[]; valoraciones: number[] },
    ): void {
        console.log('[CatalogoLibros] cargarPagina: inicio', {
            pagina,
            tamanio: this.tamanioPagina,
            filtros,
        });
        this.cargando.set(true);
        this.errorCarga.set(false);

        this.servicioLibros
            .getCatalogoLibrosPaginado(
                pagina,
                'id_libro',
                this.tamanioPagina,
                filtros ?? this.filtrosSeleccionados() ?? undefined,
            )
            .pipe(
                finalize(() => this.cargando.set(false)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (libros: LibroResumen[]) => {
                    console.log('[CatalogoLibros] pagina recibida:', {
                        pagina,
                        items: libros.length,
                    });
                    this.librosPagina.set(libros);
                },
                error: (error: unknown) => {
                    manejarError(error, 'Libros.cargarPagina');
                    this.errorCarga.set(true);
                    this.librosPagina.set([]);
                },
            });
    }

    /**
     * Obtiene la página actual del catálogo desde el servicio. Esta propiedad es computada para asegurar que siempre refleje el valor actual del servicio, permitiendo que el componente reaccione a cambios en la página actual de manera automática. La página actual se utiliza para calcular las posiciones de los libros mostrados y para gestionar la navegación entre páginas.
     * @returns Número de página actual del catálogo, obtenido del servicio. Debe ser un número entero positivo que corresponda a una página válida dentro del total de páginas calculado. El valor se obtiene directamente del servicio para asegurar la consistencia en la navegación y la gestión del estado de la página actual.
     */
    get paginaActual(): WritableSignal<number> {
        return this.servicioLibros.paginaActual;
    }

    /**
     * Cambia la página actual del catálogo y carga los libros correspondientes. Valida que la nueva página sea válida y diferente a la página actual antes de realizar el cambio. Si la página es válida, actualiza la página actual en el servicio, carga los libros de la nueva página, y desplaza la ventana hacia arriba para mejorar la experiencia del usuario.
     * @param nuevaPagina Número de la nueva página a cargar. Debe ser un número entero positivo que corresponda a una página válida dentro del total de páginas calculado. El método valida que la página sea válida antes de realizar el cambio.
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
        this.cargarPagina(nuevaPagina, this.filtrosSeleccionados() ?? undefined);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

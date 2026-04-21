import { Component, signal, computed, inject } from '@angular/core';
import { FiltrosListasComponent } from '@sharedComponents/filtros-listas/filtros-listas';
import { BusquedaListasComponent } from '@sharedComponents/busqueda-listas/busqueda-listas';
import { ListaCardComponent } from '@sharedComponents/lista-card/lista-card';
import { Paginacion } from '@sharedComponents/paginacion/paginacion';
import type { ListaApp } from '@interfaces/modelosApp/modelosApp';
import { ServicioCatalogoListas } from '@app/services/servicioListas/servicioCatalogoListas';
import { BannerCargando } from '@app/shared/components/banner-cargando/banner-cargando';
import { BannerError } from '@app/shared/components/banner-error/banner-error';

@Component({
    selector: 'app-listas',
    imports: [
        FiltrosListasComponent,
        BusquedaListasComponent,
        ListaCardComponent,
        Paginacion,
        BannerCargando,
        BannerError,
    ],
    templateUrl: './listas.html',
})
export class Listas {
    // Signals para datos
    listas = signal<ListaApp[]>([]);
    categorias = signal<string[]>([]);
    filtroCategoria = signal<string>('Todas');
    terminoBusqueda = signal<string>('');
    pagina = signal(1);
    totalPaginas = signal(1);
    cargando = signal(false);
    error = signal(false);

    private readonly servicio = inject(ServicioCatalogoListas);

    // Listas filtradas y buscadas
    listasFiltradas = computed(() => {
        let resultado = this.listas();
        console.log(
            '[CatalogoListas - listasFiltradas] Aplicando filtros. Categoría:',
            this.filtroCategoria(),
            'Término búsqueda:',
            this.terminoBusqueda(),
        );
        if (this.filtroCategoria() && this.filtroCategoria() !== 'Todas') {
            resultado = resultado.filter((l) => l.categorias.includes(this.filtroCategoria()));
        }
        if (this.terminoBusqueda()) {
            const t = this.terminoBusqueda().toLowerCase();
            resultado = resultado.filter(
                (l) =>
                    l.nombre_lista.toLowerCase().includes(t) ||
                    l.nombreCreador.toLowerCase().includes(t),
            );
        }
        console.log('[CatalogoListas - listasFiltradas] Listas después de filtrar:', resultado);
        return resultado;
    });
    constructor() {
        this.cargarListas();
    }

    cargarListas() {
        this.cargando.set(true);
        if (!this.filtroCategoria()) {
            this.filtroCategoria.set('Todas');
        }
        console.log('[CatalogoListas] Filtro de categoría establecido a:', this.filtroCategoria());
        const page = this.pagina();
        console.log('[CatalogoListas] Cargando listasRespuesta para página', page);
        this.servicio.getCatalogoListasPaginado(page, 9).subscribe({
            next: (listasRespuesta) => {
                console.log('[CatalogoListas] Listas recibidas:', listasRespuesta);
                this.listas.set(listasRespuesta);
                // Extraer categorías únicas
                const cats = Array.from(new Set(listasRespuesta.flatMap((l) => l.categorias)));
                console.log('[CatalogoListas] Categorías extraídas:', cats);
                this.categorias.set(['Todas', ...cats]);
                this.error.set(false);
                this.cargando.set(false);
                console.log(
                    '[CatalogoListas] Carga de listas completada. Total listas:',
                    this.listas().length,
                );
            },
            error: () => {
                this.listas.set([]);
                this.categorias.set([]);
                this.error.set(true);
                this.cargando.set(false);
            },
        });
        this.servicio.getTotalListas().subscribe({
            next: (total) => {
                this.totalPaginas.set(Math.max(1, Math.ceil(total / 10)));
            },
            error: () => {
                this.totalPaginas.set(1);
            },
        });
    }

    onBuscar(termino: string) {
        console.log('[CatalogoListas] Término de búsqueda actualizado:', termino);
        this.terminoBusqueda.set(termino);
    }

    onSeleccionarCategoria(cat: string) {
        console.log('[CatalogoListas] Categoría seleccionada:', cat);
        this.filtroCategoria.set(cat);
    }

    onPaginaChange(p: number) {
        console.log('[CatalogoListas] Cambio de página a:', p);
        this.pagina.set(p);
        this.servicio.setPaginaCatalogoActual(p);
        this.cargarListas();
    }

    LimpiarFiltros() {
        console.log('[CatalogoListas] Limpiando filtros y búsqueda');
        this.filtroCategoria.set('Todas');
        this.terminoBusqueda.set('');
    }
}

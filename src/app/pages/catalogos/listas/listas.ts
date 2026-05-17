import { Component, signal, computed, inject } from "@angular/core";
import { FiltrosListasComponent } from "@sharedComponents/filtros-listas/filtros-listas";
import { BusquedaListasComponent } from "@sharedComponents/busqueda-listas/busqueda-listas";
import { ListaCardComponent } from "@sharedComponents/lista-card/lista-card";
import { Paginacion } from "@sharedComponents/paginacion/paginacion";
import type { ListaApp } from "@Interfaces/modelosApp/modelosApp";
import { ServicioCatalogoListas } from "@app/services/servicioListas/servicioCatalogoListas";
import { BannerCargando } from "@sharedComponents/banner-cargando/banner-cargando";
import { BannerError } from "@sharedComponents/banner-error/banner-error";

@Component({
	selector: "app-listas",
	imports: [
		FiltrosListasComponent,
		BusquedaListasComponent,
		ListaCardComponent,
		Paginacion,
		BannerCargando,
		BannerError,
	],
	templateUrl: "./listas.html",
})
export class Listas {
	/**
	 * Señal que contiene el conjunto de listas obtenidas del servicio, que se muestra en la interfaz. Esta señal se actualiza cada vez que se carga una nueva página de listas o se aplican nuevos filtros o términos de búsqueda, y es la fuente de datos principal para el componente de lista que muestra las listas al usuario.
	 * El tipo de esta señal es un array de objetos `ListaApp`, que representan las listas con sus propiedades como id, nombre, creador, categorías, libros de portada, total de libros, total de me gusta, y descripción.
	 */
	listas = signal<ListaApp[]>([]);
	// Filtros y estados
	categorias = signal<string[]>([]);
	filtroCategoria = signal<string>("Todas");
	terminoBusqueda = signal<string>("");
	pagina = signal<number>(1);
	totalPaginas = signal<number>(1);
	cargando = signal<boolean>(false);
	error = signal<boolean>(false);

	/**
	 * Injección del servicio de catálogo de listas, que se utiliza para obtener las listas desde el backend, incluyendo la obtención de páginas específicas de listas con filtros aplicados, y la obtención del total de listas para calcular el número de páginas. Este servicio es fundamental para la funcionalidad del componente, ya que proporciona los datos necesarios para mostrar las listas al usuario y manejar la paginación y los filtros.
	 */
	private readonly servicio = inject(ServicioCatalogoListas);

	/**
	 * Señal computada que devuelve el conjunto de listas filtradas según la categoría seleccionada y el término de búsqueda ingresado por el usuario. Esta señal se actualiza automáticamente cada vez que cambian las señales de `listas`, `filtroCategoria`, o `terminoBusqueda`, aplicando los filtros correspondientes para mostrar solo las listas que coinciden con los criterios seleccionados por el usuario. Si no se selecciona ninguna categoría (o se selecciona "Todas"), no se aplica filtro de categoría, y si no se ingresa ningún término de búsqueda, no se aplica filtro de búsqueda.
	 */
	listasFiltradas = computed(() => {
		let resultado = this.listas();
		console.log(
			"[CatalogoListas - listasFiltradas] Aplicando filtros. Categoría:",
			this.filtroCategoria(),
			"Término búsqueda:",
			this.terminoBusqueda(),
		);
		if (this.filtroCategoria() && this.filtroCategoria() !== "Todas") {
			resultado = resultado.filter(l => l.categorias.includes(this.filtroCategoria()));
		}
		if (this.terminoBusqueda()) {
			const t = this.terminoBusqueda().toLowerCase();
			resultado = resultado.filter(
				l => l.nombre_lista.toLowerCase().includes(t) || l.nombreCreador.toLowerCase().includes(t),
			);
		}
		console.log("[CatalogoListas - listasFiltradas] Listas después de filtrar:", resultado);
		return resultado;
	});

	/**
	 * Inicializador del componente con carga de la primera página sin filtros aplicados.
	 */
	constructor() {
		this.cargarListas();
	}

	/**
	 * Método para cargar las listas desde el servicio, obteniendo la página específica de listas según la página actual y los filtros aplicados.
	 * Este método se llama inicialmente en el constructor para cargar la primera página de listas, y también se llama cada vez que el usuario cambia de página o aplica nuevos filtros o términos de búsqueda.
	 * El método maneja los estados de carga y error, actualizando las señales correspondientes para mostrar mensajes de carga o error en la interfaz, y actualizando la señal de `listas` con los datos obtenidos del servicio.
	 */
	cargarListas() {
		this.cargando.set(true);
		if (!this.filtroCategoria()) {
			this.filtroCategoria.set("Todas");
		}
		console.log("[CatalogoListas] Filtro de categoría establecido a:", this.filtroCategoria());
		const page = this.pagina();
		console.log("[CatalogoListas] Cargando listasRespuesta para página", page);
		this.servicio.getCatalogoListasPaginado(page, 9).subscribe({
			next: listasRespuesta => {
				console.log("[CatalogoListas] Listas recibidas:", listasRespuesta);
				this.listas.set(listasRespuesta);
				// Extraer categorías únicas
				const cats = Array.from(new Set(listasRespuesta.flatMap(l => l.categorias)));
				console.log("[CatalogoListas] Categorías extraídas:", cats);
				this.categorias.set(["Todas", ...cats]);
				this.error.set(false);
				this.cargando.set(false);
				console.log("[CatalogoListas] Carga de listas completada. Total listas:", this.listas().length);
			},
			error: () => {
				this.listas.set([]);
				this.categorias.set([]);
				this.error.set(true);
				this.cargando.set(false);
			},
		});
		this.servicio.getTotalListas().subscribe({
			next: total => {
				this.totalPaginas.set(Math.max(1, Math.ceil(total / 10)));
			},
			error: () => {
				this.totalPaginas.set(1);
			},
		});
	}

	buscarLista(termino: string) {
		console.log("[CatalogoListas] Término de búsqueda actualizado:", termino);
		this.terminoBusqueda.set(termino);
	}

	seleccionarCategoria(cat: string) {
		console.log("[CatalogoListas] Categoría seleccionada:", cat);
		this.filtroCategoria.set(cat);
	}

	cambiarPagina(p: number) {
		console.log("[CatalogoListas] Cambio de página a:", p);
		this.pagina.set(p);
		this.servicio.setPaginaCatalogoActual(p);
		this.cargarListas();
	}

	limpiarFiltros() {
		console.log("[CatalogoListas] Limpiando filtros y búsqueda");
		this.filtroCategoria.set("Todas");
		this.terminoBusqueda.set("");
	}
}

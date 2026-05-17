// Importaciones node_modules
import { Component, signal, computed, inject, DestroyRef, WritableSignal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
// Importaciones propias
import { ServicioCatalogoLibros } from "@Services/servicioLibros/servicioCatalogoLibros";
import { BannerCargando } from "@sharedComponents/banner-cargando/banner-cargando";
import { BannerError } from "@sharedComponents/banner-error/banner-error";
import { manejarError } from "@Utils/error.utils";
import { Paginacion } from "@sharedComponents/paginacion/paginacion";
import { LibroCard } from "@sharedComponents/libro-card/libro-card";
import { LibroResumen } from "@Interfaces/modelosApp/modelosApp";
import { FiltrosLibros } from "@sharedComponents/filtros-libros/filtros-libros";

/**
 * Componente para mostrar un catálogo de libros con paginación. Permite navegar entre páginas de libros, mostrando un número limitado de libros por página. El componente maneja el estado de carga y errores, y utiliza servicios para obtener los datos del catálogo desde el backend.
 * El componente utiliza señales para manejar el estado de los libros, la página actual, el total de resultados, y los estados de carga y error. También incluye propiedades computadas para calcular el total de páginas y las posiciones de los libros mostrados en la página actual.
 * La lógica de carga del catálogo se realiza en dos pasos: primero se obtiene el total de libros para calcular el número de páginas, y luego se carga la página específica de libros. El componente también maneja la persistencia de la página actual en el servicio para mantener la navegación consistente.
 */

@Component({
	selector: "app-libros",
	imports: [BannerCargando, BannerError, Paginacion, LibroCard, FiltrosLibros],
	templateUrl: "./libros.html",
})
export class Libros {
	filtrosSeleccionados = signal<{
		generos: number[];
		autores: number[];
		years: number[];
		valoraciones: number[];
	}>({
		generos: [],
		autores: [],
		years: [],
		valoraciones: [],
	});
	/**
	 * Inyección de servicios y referencias necesarias para el componente.
	 * Se inyecta el servicio de catálogo de libros para obtener los datos del catálogo
	 * Se utiliza `DestroyRef` para manejar la limpieza de suscripciones al destruir el componente.
	 * La referencia a `DestroyRef` se utiliza junto con el operador `takeUntilDestroyed` para asegurar que las suscripciones se limpien automáticamente, evitando fugas de memoria.
	 */
	private readonly destroyRef = inject(DestroyRef);
	private readonly servicioLibros = inject(ServicioCatalogoLibros);

	/**
	 * Número de libros a mostrar por página. Este valor es fijo y se utiliza para calcular el número total de páginas y para solicitar la cantidad correcta de libros al servicio cuando se carga una página específica. El valor de 12 libros por página proporciona un equilibrio entre mostrar suficientes libros para que el usuario tenga opciones, y no sobrecargar la interfaz con demasiados libros a la vez, lo que podría afectar la experiencia del usuario y el rendimiento de la aplicación.
	 */
	readonly tamanioPagina: number = 12;

	/**
	 * Señal que contiene la lista de libros que se muestran en la página actual.
	 * Esta señal se actualiza cada vez que se carga una nueva página de libros, y es utilizada en la plantilla para mostrar los libros correspondientes a la página actual.
	 */
	librosPagina = signal<LibroResumen[]>([]);

	/**
	 * Señales auxiliares para manejar el estado de carga y error del catálogo.
	 */
	cargando = signal<boolean>(true);
	errorCarga = signal<boolean>(false);
	totalResultados = signal<number>(0);

	/**
	 * Señal computada para calcular el total de páginas disponibles en función del total de resultados y el tamaño de página.
	 * Esta propiedad se actualiza automáticamente cada vez que cambian el total de resultados o el tamaño de página, asegurando que la navegación entre páginas se mantenga consistente y refleje correctamente el número de páginas disponibles para el usuario. El cálculo utiliza `Math.ceil` para redondear hacia arriba, garantizando que cualquier resultado parcial cuente como una página adicional, y `Math.max` para asegurar que siempre haya al menos una página, incluso si no hay resultados.
	 */
	totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalResultados() / this.tamanioPagina)));

	/**
	 * Señal computada para calcular la posición del primer libro mostrado en la página actual.
	 * Esta propiedad se utiliza para realizar la peticción al servicio de libros, indicando desde qué posición se deben cargar los libros para la página actual.
	 * El cálculo se basa en la página actual obtenida del servicio y el tamaño de página, asegurando que se carguen los libros correctos para cada página.
	 * Si no hay resultados, la primera posición se establece en 0 para evitar cálculos innecesarios.
	 */
	primeraPosicionPagina = computed(() => {
		if (this.totalResultados() === 0) {
			return 0;
		}
		return (this.servicioLibros.paginaActual() - 1) * this.tamanioPagina + 1;
	});

	/**
	 * Señal computada para calcular la posición del último libro mostrado en la página actual. Esta propiedad se utiliza para mostrar al usuario el rango de libros que se están mostrando en la página actual, y también para realizar la petición al servicio de libros, indicando hasta qué posición se deben cargar los libros para la página actual. El cálculo se basa en la página actual obtenida del servicio, el tamaño de página, y el total de resultados, asegurando que se muestre el rango correcto de libros para cada página. Si no hay resultados, la última posición se establece en 0 para evitar cálculos innecesarios.
	 * El uso de `Math.min` garantiza que la última posición no exceda el total de resultados disponibles, lo que es especialmente importante en la última página del catálogo, donde el número de libros mostrados puede ser menor que el tamaño de página.
	 * En conjunto con `primeraPosicionPagina`, esta propiedad permite mostrar al usuario información clara sobre qué libros están siendo mostrados en la página actual (por ejemplo, "Mostrando libros 13-24 de 100").
	 */
	ultimaPosicionPagina = computed(() =>
		Math.min(this.servicioLibros.paginaActual() * this.tamanioPagina, this.totalResultados()),
	);

	/**
	 * Inicializa el componente y carga la 1ª página sin filtros
	 */
	constructor() {
		console.log("[CatalogoLibros] Constructor: iniciando carga de catalogo");
		this.cargarCatalogo();
	}

	/**
	 * Método para solicitar una página con filtros diversos aplicados. Este método se llama desde el componente de filtros cuando el usuario aplica nuevos filtros, y se encarga de actualizar la señal de filtros seleccionados, obtener el total de libros filtrados para recalcular el número de páginas, resetear la página actual a 1, y cargar la página 1 con los filtros aplicados.
	 * El método maneja los estados de carga y error, mostrando un mensaje de error en caso de que la obtención del total de libros filtrados falle, y limpiando la lista de libros mostrada.
	 * @param filtros Objeto que contiene los filtros aplicados por el usuario, incluyendo géneros, autores, años y valoraciones. Este objeto se utiliza para solicitar al servicio el total de libros filtrados y la página específica de libros filtrados.
	 * @returns void -> Actualiza la señal sin llegar a devolver ningún valor, ya que la actualización de la interfaz se maneja a través de las señales y la reactividad del componente.
	 */
	aplicarFiltros(filtros: { generos: number[]; autores: number[]; years: number[]; valoraciones: number[] }): void {
		this.filtrosSeleccionados.set(filtros);
		this.servicioLibros
			.getTotalLibros(filtros)
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: totalFiltrado => {
					this.totalResultados.set(totalFiltrado);

					// 2. Resetear página a 1
					this.servicioLibros.setPaginaCatalogoActual(1);

					// 3. Cargar página 1 con filtros
					this.cargarPagina(1, filtros);
				},
				error: error => {
					manejarError(error, "aplicarFiltros.totalFiltrado");
					this.totalResultados.set(0);
					this.librosPagina.set([]);
				},
			});
	}

	/**
	 * Carga el catálogo de libros, obteniendo primero el total de libros para calcular el número de páginas, y luego cargando la página específica de libros.
	 * Maneja los estados de carga y error, y persiste la página actual en el servicio para mantener la navegación consistente. En caso de error, muestra un mensaje de error y limpia la lista de libros.
	 * @returns void -> Actualiza las señales del componente para reflejar el estado de carga, error, total de resultados, y la lista de libros mostrada, sin devolver ningún valor directamente, ya que la actualización de la interfaz se maneja a través de las señales y la reactividad del componente.
	 */
	private cargarCatalogo(): void {
		console.log("[CatalogoLibros] cargarCatalogo: inicio");
		this.cargando.set(true);
		this.errorCarga.set(false);

		this.servicioLibros
			.getTotalLibros()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: total => {
					console.log("[CatalogoLibros] total recibido:", total);
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
					manejarError(error, "Libros.cargarCatalogo");
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
		console.log("[CatalogoLibros] cargarPagina: inicio", {
			pagina,
			tamanio: this.tamanioPagina,
			filtros,
		});
		this.cargando.set(true);
		this.errorCarga.set(false);
		const filtrosFinales = filtros ?? this.filtrosSeleccionados();

		this.servicioLibros
			.getCatalogoLibrosPaginado(pagina, "id_libro", this.tamanioPagina, filtrosFinales)
			.pipe(
				finalize(() => this.cargando.set(false)),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe({
				next: (libros: LibroResumen[]) => {
					console.log("[CatalogoLibros] pagina recibida:", {
						pagina,
						items: libros.length,
					});
					this.librosPagina.set(libros);
				},
				error: (error: unknown) => {
					manejarError(error, "Libros.cargarPagina");
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
		if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas() || nuevaPagina === this.servicioLibros.paginaActual()) {
			return;
		}

		this.servicioLibros.setPaginaCatalogoActual(nuevaPagina);
		console.log("[CatalogoLibros] Cambio de pagina:", nuevaPagina);
		this.cargarPagina(nuevaPagina, this.filtrosSeleccionados());
		window.scrollTo({ top: 0, behavior: "smooth" });
	}
}

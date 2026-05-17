// Importaciones node_modules
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { catchError, finalize, of } from "rxjs";
import { manejarError } from "@Utils/error.utils";
// Importaciones propias
import { DetalleListaCompleta } from "@Interfaces/modelosApp/modelosApp";
import { ServicioDetalleListas } from "@Services/servicioListas/servicioDetalleListas";
import { valorNumeroSeguro } from "@Utils/validation.utils";
import { ComentarioExistente } from "@sharedComponents/comentarioExistente/comentarioExistente";
import { BannerCargando } from "@sharedComponents/banner-cargando/banner-cargando";
import { BannerError } from "@sharedComponents/banner-error/banner-error";
import { LibroCard } from "@sharedComponents/libro-card/libro-card";

/**
 * Componente para mostrar el detalle de una lista, incluyendo su información general y comentarios. Utiliza el servicio `ServicioDetalleListas` para obtener los datos de la lista a partir de su ID, que se obtiene de la ruta activa. El componente maneja estados de carga, error y éxito para proporcionar una experiencia de usuario fluida.
 * El componente muestra un banner de carga mientras se obtienen los datos, y un banner de error si ocurre algún problema durante la carga. Si la lista se carga correctamente, se muestra su información y una lista de comentarios utilizando `ComentarioExistente`.
 */
@Component({
	selector: "app-lista-detalle",
	imports: [BannerCargando, BannerError, ComentarioExistente, LibroCard],
	templateUrl: "./lista.html",
	styleUrl: "./lista.css",
})
export class DetalleLista {
	private readonly destroyRef = inject(DestroyRef);

	detalle: DetalleListaCompleta | null = null;
	listaEncontrada = false;
	cargando = true;
	errorComentarios = false;

	/**
	 * Inicializa el componente, obteniendo el ID de la lista desde la ruta activa y cargando su detalle utilizando el servicio `servicioDetalleListas`. Maneja los estados de carga y error, y asegura que se limpien las suscripciones al destruir el componente para evitar memory leaks.
	 * @param rutaActiva Servicio de Angular para acceder a la ruta activa y obtener parámetros de la URL, como el ID de la lista.
	 * @param listaService Servicio para obtener los detalles de la lista y sus comentarios.
	 */
	constructor(
		private readonly rutaActiva: ActivatedRoute,
		private readonly listaService: ServicioDetalleListas,
	) {
		const id = this.rutaActiva.snapshot.paramMap.get("id");
		const idNum = valorNumeroSeguro(id ?? -1);
		if (idNum && !Number.isNaN(idNum) && idNum > 0) {
			this.cargarDetalle(idNum);
		} else {
			manejarError("detallelista_id_invalido", "ListaDetalle.constructor", { id });
			this.cargando = false;
		}
	}

	/**
	 * Obtiene el detalle de la lista por su ID utilizando el servicio `servicioDetalleListas`, y maneja los estados de carga, error y éxito. Si la carga es exitosa, se asignan los datos de la lista y sus comentarios a las propiedades correspondientes. Si ocurre un error, se maneja adecuadamente y se actualizan los estados para reflejar que la lista no fue encontrada o que hubo un error al cargar los comentarios.
	 * @param id Número ID de la lista a cargar, obtenido de la ruta activa. Se espera que sea un número válido y positivo.
	 */
	private cargarDetalle(id: number) {
		this.listaService
			.getDetalleLista(id)
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				catchError((error: unknown) => {
					manejarError(error, "ListaDetalle.cargarDetalle", { id });
					this.listaEncontrada = false;
					this.errorComentarios = false;
					return of(null);
				}),
				finalize(() => {
					this.cargando = false;
				}),
			)
			.subscribe((detalle: DetalleListaCompleta | null) => {
				if (!detalle) return;
				this.detalle = detalle;
				this.listaEncontrada = true;
				this.errorComentarios = detalle.errorComentarios;
			});
	}
}

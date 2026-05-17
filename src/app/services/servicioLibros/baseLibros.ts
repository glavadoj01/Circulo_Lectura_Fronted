// Métodos utilitarios y de mapeo/validación compartidos para libros
import { LibroResumen, LibroApp } from "@Interfaces/modelosApp/modelosApp";
import { valorTextoSeguro, validarAutores, validarGeneros, valorNumeroSeguro } from "@Utils/validation.utils";

export class BaseLibros {
	/**
	 * Mapea un objeto LibroApp, asegurando que sus propiedades estén normalizadas y validadas.
	 * @param libro Objeto LibroApp a mapear.
	 * @returns Objeto LibroApp mapeado y validado.
	 */
	static mapLibroApp(libro: LibroApp): LibroApp {
		console.log("Mapeando libro:", libro);
		const tituloSeguro = valorTextoSeguro(libro.titulo_libro);
		const idiomaOriginalSeguro = valorTextoSeguro(libro.nombre_idioma_original);
		const sinopsisSegura = valorTextoSeguro(libro.sinopsis);
		const isbnSeguro = valorTextoSeguro(libro.codigo_isbn);
		const paginasSeguras = valorNumeroSeguro(libro.paginas);
		const calificacionPromedioSegura = valorNumeroSeguro(libro.calificacionPromedio);
		const totalResenasSeguras = valorNumeroSeguro(libro.totalResenas);

		return {
			...libro,
			titulo_libro: tituloSeguro === "" ? "Título no disponible" : tituloSeguro,
			nombre_idioma_original: idiomaOriginalSeguro === "" ? "N/A" : idiomaOriginalSeguro,
			sinopsis: sinopsisSegura === "" ? "Sinopsis no disponible" : sinopsisSegura,
			codigo_isbn: isbnSeguro === "" ? "N/A" : isbnSeguro,
			paginas: paginasSeguras > 0 ? paginasSeguras : undefined,
			calificacionPromedio: calificacionPromedioSegura,
			totalResenas: totalResenasSeguras,
			autores: validarAutores(libro.autores),
			generos: validarGeneros(libro.generos),
		};
	}

	/**
	 * Normaliza y ordena un array de libros para el catálogo, devolviendo solo los campos mínimos requeridos (LibroResumen).
	 * @param libros Array de libros crudos del backend
	 * @param sort Campo por el que ordenar (por defecto id_libro)
	 */
	static normalizarYOrdenarLibros(libros: any[], sort: string = "id_libro"): LibroResumen[] {
		return [...libros]
			.map(libro => ({
				id_libro: libro.id_libro,
				titulo_libro: libro.titulo_libro,
				autores:
					libro.autores?.map((a: any) => ({
						nombre_autor: a.nombre_autor,
						apellido_autor: a.apellido_autor,
					})) ?? [],
				calificacionPromedio: libro.calificacionPromedio,
			}))
			.sort((a, b) => {
				const valueA = a[sort as keyof LibroResumen] ?? "";
				const valueB = b[sort as keyof LibroResumen] ?? "";
				if (typeof valueA === "string" && typeof valueB === "string") {
					return valueA.localeCompare(valueB);
				}
				return Number(valueA) - Number(valueB);
			});
	}
	/**
	 * Devuelve la URL de la portada de un libro dado su id.
	 * Por ahora usa un placeholder de picsum.photos.
	 */
	static portadaLibro(idLibro: number): string {
		return `https://picsum.photos/seed/libro-${idLibro}/400/600`;
	}
}

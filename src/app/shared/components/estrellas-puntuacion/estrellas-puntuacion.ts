import { Component, input } from "@angular/core";
import { normalizarPuntuacion } from "@Utils/format.utils";

/**
 * Componente para mostrar una representación visual de una puntuación utilizando estrellas. Recibe como input una puntuación numérica y calcula el tipo de estrella (completa, media o vacía) para cada una de las cinco posiciones. Utiliza funciones para determinar el icono y el estilo de cada estrella según la puntuación normalizada, asegurando que los valores sean presentados de manera clara y precisa. Este componente es ideal para mostrar valoraciones en aplicaciones relacionadas con libros, películas u otros productos que utilicen un sistema de puntuación basado en estrellas.
 * El componente normaliza la puntuación recibida para asegurar que esté dentro del rango permitido (0 a 5) y luego determina el tipo de estrella para cada posición. Las estrellas completas se muestran cuando la puntuación es igual o superior al índice de la estrella, las medias se muestran cuando la puntuación es al menos 0.5 por debajo del índice, y las vacías se muestran en caso contrario. Esto permite una representación visual precisa de la puntuación, incluso cuando se utilizan valores decimales.
 */

@Component({
	selector: "app-estrellas-puntuacion",
	imports: [],
	templateUrl: "./estrellas-puntuacion.html",
	styleUrl: "./estrellas-puntuacion.css",
})
export class EstrellasPuntuacion {
	puntuacion = input<number | null | undefined>(null);

	/**
	 * Determina el tipo de estrella (completa, media o vacía) para un índice específico basado en la puntuación normalizada.
	 * @param indice Número entero del 1 al 5 que representa la posición de la estrella (1 para la primera estrella, 2 para la segunda, etc.).
	 * @returns El tipo de estrella correspondiente al índice y puntuación proporcionados ['full', 'half', 'empty'].
	 */
	private tipoEstrella(indice: number): "full" | "half" | "empty" {
		const media = normalizarPuntuacion(this.puntuacion());
		const indiceSeguro = Math.max(1, Math.min(5, Math.floor(indice)));

		if (media >= indiceSeguro) {
			return "full";
		}

		if (media >= indiceSeguro - 0.5) {
			return "half";
		}

		return "empty";
	}

	/**
	 * Obtiene el icono de la estrella para un índice específico basado en su tipo.
	 * @param indice Número entero del 1 al 5 que representa la posición de la estrella.
	 * @returns El icono correspondiente al tipo de estrella para el índice proporcionado.
	 */
	iconoEstrella(indice: number): string {
		return this.tipoEstrella(indice) === "half" ? "star_half" : "star";
	}

	/**
	 * Obtiene el estilo de la estrella para un índice específico basado en su tipo, utilizando una cadena de estilos que incluye el relleno (fill) y otros atributos relacionados con la fuente.
	 * @param indice Número entero del 1 al 5 que representa la posición de la estrella.
	 * @returns La cadena de estilos correspondiente al tipo de estrella para el índice proporcionado.
	 */
	estiloEstrella(indice: number): string {
		const fill = this.tipoEstrella(indice) === "empty" ? 0 : 1;

		return `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
	}
}

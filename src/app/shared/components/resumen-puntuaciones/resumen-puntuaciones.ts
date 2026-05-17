import { DecimalPipe } from "@angular/common";
import { Component, input, computed } from "@angular/core";
import { valorNumeroSeguro, valorTextoSeguro } from "@Utils/validation.utils";
import { EstrellasPuntuacion } from "@sharedComponents/estrellas-puntuacion/estrellas-puntuacion";

/**
 * Componente para mostrar un resumen de puntuaciones, incluyendo la puntuación promedio, el total de elementos y la distribución de notas. Utiliza validaciones para asegurar que los datos sean seguros y presenta la información de manera clara y concisa.
 * Recibe como inputs la puntuación promedio, el total de elementos, el nombre del elemento (en plural) y la distribución de notas. Calcula un texto resumen del total de elementos y singulariza el nombre del elemento cuando corresponde.
 * El componente también incluye una función para calcular la distribución de notas a partir de las frecuencias proporcionadas, asegurando que los valores sean seguros y presentados correctamente.
 */

@Component({
	selector: "app-resumen-puntuaciones",
	imports: [DecimalPipe, EstrellasPuntuacion],
	templateUrl: "./resumen-puntuaciones.html",
})
export class ResumenPuntuaciones {
	puntuacionPromedio = input<number | null | undefined>(null);
	totalElementos = input<number | null | undefined>(0);
	nombreElemento = input.required<string>();
	distribucion = input.required<{ nota: number; cantidad: number; frecuencia: number }[]>();

	hayDistribucion = computed(() => {
		const dist = this.distribucion();
		return Array.isArray(dist) && dist.length > 0;
	});

	/**
	 * Devuelve un texto que resume la cantidad total de elementos, utilizando el nombre del elemento en singular o plural según corresponda. Si el total es 0, indica que no hay elementos.
	 * @returns Texto resumen del total de elementos (e.g., "Sin críticas", "1 crítica", "5 críticas").
	 */
	textoTotal(): string {
		const totalSeguro = valorNumeroSeguro(this.totalElementos() ?? 0);
		const nombre = valorTextoSeguro(this.nombreElemento()) || "elementos";

		if (totalSeguro === 0) {
			return `Sin ${nombre}`;
		}

		if (totalSeguro === 1) {
			return `1 ${this.singularizar(nombre)}`;
		}

		return `${totalSeguro} ${nombre}`;
	}

	/**
	 * Remueve la 's' final de un texto para singularizarlo, si es que la tiene. Si el texto no es válido, devuelve 'elemento' por defecto.
	 * @param texto Texto a singularizar, generalmente el nombre del elemento en plural (e.g., "críticas", "reseñas").
	 * @returns Texto singularizado (e.g., "crítica", "reseña") o 'elemento' si el texto no es válido.
	 */
	private singularizar(texto: string): string {
		if (!texto || typeof texto !== "string") {
			return "elemento";
		}
		return texto.endsWith("s") ? texto.slice(0, -1) : texto;
	}
}

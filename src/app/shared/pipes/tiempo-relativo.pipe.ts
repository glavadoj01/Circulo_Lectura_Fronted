import { valorTextoSeguro } from '@sharedUtils/validation.utils';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para mostrar el tiempo relativo desde una fecha dada hasta el momento actual.
 * Si la fecha es inválida, se muestra "Fecha invalida".
 * Ejemplo de uso en plantilla: {{ libro.fecha_publicacion | tiempoRelativo }}
 * Ejemplo de salida: "Hace 3 días", "Hace 2 horas", "Hace un momento", etc.
 * @param value Fecha de la que se quiere calcular el tiempo relativo. Puede ser una cadena de texto o un objeto Date.
 * @returns Cadena de texto que indica el tiempo transcurrido desde la fecha dada hasta ahora, o "Fecha invalida" si la fecha no es válida.
 */

@Pipe({
    name: 'tiempoRelativo',
})
export class TiempoRelativoPipe implements PipeTransform {
    transform(value: string | Date | null | undefined): string {
        const fechaConvertida = this.parseFechaFlexible(value ?? undefined);
        if (!fechaConvertida) return 'Fecha inválida';

        const ahora = new Date();
        const diferenciaMs = ahora.getTime() - fechaConvertida.getTime();

        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos < 1) return 'Hace un momento';
        if (diferenciaMinutos < 60) {
            return `Hace ${diferenciaMinutos} minuto${diferenciaMinutos > 1 ? 's' : ''}`;
        }

        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24) {
            return `Hace ${diferenciaHoras} hora${diferenciaHoras > 1 ? 's' : ''}`;
        }

        const diferenciaDias = Math.floor(diferenciaHoras / 24);
        if (diferenciaDias < 30) {
            return `Hace ${diferenciaDias} dia${diferenciaDias > 1 ? 's' : ''}`;
        }

        const diferenciaMeses = Math.floor(diferenciaDias / 30);
        if (diferenciaMeses < 12) {
            return `Hace ${diferenciaMeses} mes${diferenciaMeses > 1 ? 'es' : ''}`;
        }

        const diferenciaAnios = Math.floor(diferenciaMeses / 12);
        return `Hace ${diferenciaAnios} año${diferenciaAnios > 1 ? 's' : ''}`;
    }

    /**
     * Asegura que la fecha se pueda convertir a un objeto Date válido, aceptando tanto objetos Date como cadenas de texto en formatos comunes.
     * @param fecha Valor a convertir a fecha. Puede ser un objeto Date, una cadena de texto o undefined.
     * @returns Objeto Date válido o null si la conversión falla.
     */
    private parseFechaFlexible(fecha: Date | string | undefined): Date | null {
        if (!fecha) {
            return null;
        }

        if (fecha instanceof Date) {
            return Number.isNaN(fecha.getTime()) ? null : fecha;
        }

        if (typeof fecha !== 'string') {
            return null;
        }

        const valor = valorTextoSeguro(fecha);
        if (!valor) {
            return null;
        }

        const isoLike = valor.includes(' ') ? valor.replace(' ', 'T') : valor;
        const normalizado = /^\d{4}-\d{2}-\d{2}$/.test(isoLike) ? `${isoLike}T00:00:00` : isoLike;

        const fechaConvertida = new Date(normalizado);
        return Number.isNaN(fechaConvertida.getTime()) ? null : fechaConvertida;
    }
}

import { Pipe, PipeTransform } from '@angular/core';
import { normalizarPuntuacion } from '@sharedUtils/format.utils';

/**
 * Pipe para formatear una puntuación numérica a texto con un número específico de dígitos decimales.
 * Si el valor no es un número válido, se devuelve "0" con los dígitos especificados.
 * Ejemplo de uso en plantilla: {{ libro.puntuacion | puntuacionTexto:2 }}
 * @param value Valor a formatear como texto.
 * @param digits Número de dígitos decimales (opcional, por defecto 1).
 * @returns Cadena de texto con la puntuación formateada o "0" si el valor no es válido.
 */

@Pipe({
    name: 'puntuacionTexto',
})
export class PuntuacionTextoPipe implements PipeTransform {
    transform(value: unknown, digits = 1): string {
        // Normaliza la puntuación usando la utilidad centralizada
        const num = normalizarPuntuacion(value);
        const digitsSeguro = Math.max(0, Math.floor(Number(digits)));
        return num.toFixed(digitsSeguro);
    }
}

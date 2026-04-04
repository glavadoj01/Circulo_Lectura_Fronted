import { Pipe, PipeTransform } from '@angular/core';
import { normalizarPuntuacion } from '@sharedUtils/format.utils';

/**
 * Pipe para normalizar una puntuación a un formato numérico válido.
 * Si el valor no es un número válido, se devuelve 0.
 * Ejemplo de uso en plantilla: {{ libro.puntuacion | puntuacionNormalizada }}
 * @returns Número normalizado (0-5) o 0 si el valor no es válido.
 */

@Pipe({
    name: 'puntuacionNormalizada',
})
export class PuntuacionNormalizadaPipe implements PipeTransform {
    transform(value: unknown): number {
        return normalizarPuntuacion(value);
    }
}

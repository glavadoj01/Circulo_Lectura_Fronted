import { Pipe, PipeTransform } from '@angular/core';
import { normalizarPuntuacion } from '@sharedUtils/format.utils';

@Pipe({
    name: 'puntuacionNormalizada',
})
export class PuntuacionNormalizadaPipe implements PipeTransform {
    transform(value: unknown): number {
        return normalizarPuntuacion(value);
    }
}

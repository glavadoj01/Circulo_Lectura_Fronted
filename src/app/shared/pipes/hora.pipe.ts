import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'Hora',
})
export class HoraPipe implements PipeTransform {
    transform(hora: string): string | null {
        const arrHora = hora.split(':');
        if (Number.isNaN(arrHora[0]) || Number.isNaN(arrHora[1])) {
            return null;
        }
        const horas = Number(arrHora[0]);
        const minutos = Number(arrHora[1]);
        if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
            return null;
        }

        return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
    }
}

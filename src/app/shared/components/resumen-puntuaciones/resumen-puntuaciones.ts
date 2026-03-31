import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { EstrellasPuntuacion } from '@app/shared/components/estrellas-puntuacion/estrellas-puntuacion';

@Component({
    selector: 'app-resumen-puntuaciones',
    imports: [DecimalPipe, EstrellasPuntuacion],
    templateUrl: './resumen-puntuaciones.html',
})
export class ResumenPuntuaciones {
    puntuacionPromedio = input<number | null | undefined>(null);
    totalElementos = input<number | null | undefined>(0);
    nombreElemento = input.required<string>();
    distribucion = input.required<{ nota: number; cantidad: number; frecuencia: number }[]>();

    textoTotal(): string {
        const total = this.totalElementos() ?? 0;
        const nombre = this.nombreElemento().trim();

        if (total === 0) {
            return `Sin ${nombre}`;
        }

        if (total === 1) {
            return `1 ${this.singularizar(nombre)}`;
        }

        return `${total} ${nombre}`;
    }

    private singularizar(texto: string): string {
        return texto.endsWith('s') ? texto.slice(0, -1) : texto;
    }
}

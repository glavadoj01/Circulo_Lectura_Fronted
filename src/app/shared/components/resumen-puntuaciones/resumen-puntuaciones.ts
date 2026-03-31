import { DecimalPipe } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { EstrellasPuntuacion } from '@sharedComponents/estrellas-puntuacion/estrellas-puntuacion';

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

    hayDistribucion = computed(() => {
        const dist = this.distribucion();
        return Array.isArray(dist) && dist.length > 0;
    });

    textoTotal(): string {
        const total = Number(this.totalElementos() ?? 0);
        const totalSeguro = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
        const nombre = this.nombreElemento()?.trim() || 'elementos';

        if (totalSeguro === 0) {
            return `Sin ${nombre}`;
        }

        if (totalSeguro === 1) {
            return `1 ${this.singularizar(nombre)}`;
        }

        return `${totalSeguro} ${nombre}`;
    }

    private singularizar(texto: string): string {
        if (!texto || typeof texto !== 'string') {
            return 'elemento';
        }
        return texto.endsWith('s') ? texto.slice(0, -1) : texto;
    }
}

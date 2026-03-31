import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
    selector: 'app-resumen-puntuaciones',
    imports: [DecimalPipe],
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

    private promedioNormalizado(): number {
        const promedio = this.puntuacionPromedio();

        if (promedio == null || Number.isNaN(promedio)) {
            return 0;
        }

        return Math.max(0, Math.min(5, promedio));
    }

    private tipoEstrella(indice: number): 'full' | 'half' | 'empty' {
        const promedio = this.promedioNormalizado();

        if (promedio >= indice) {
            return 'full';
        }

        if (promedio >= indice - 0.5) {
            return 'half';
        }

        return 'empty';
    }

    iconoEstrella(indice: number): string {
        const tipo = this.tipoEstrella(indice);

        if (tipo === 'half') {
            return 'star_half';
        }

        return 'star';
    }

    estiloEstrella(indice: number): string {
        const tipo = this.tipoEstrella(indice);
        const fill = tipo === 'empty' ? 0 : 1;

        return `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
    }
}

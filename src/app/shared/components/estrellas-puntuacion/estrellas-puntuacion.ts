import { Component, input } from '@angular/core';

@Component({
    selector: 'app-estrellas-puntuacion',
    standalone: true,
    imports: [],
    templateUrl: './estrellas-puntuacion.html',
})
export class EstrellasPuntuacion {
    puntuacion = input<number | null | undefined>(null);

    private puntuacionNormalizada(): number {
        const valor = this.puntuacion();

        if (valor == null || Number.isNaN(valor)) {
            return 0;
        }

        return Math.max(0, Math.min(5, valor));
    }

    private tipoEstrella(indice: number): 'full' | 'half' | 'empty' {
        const media = this.puntuacionNormalizada();

        if (media >= indice) {
            return 'full';
        }

        if (media >= indice - 0.5) {
            return 'half';
        }

        return 'empty';
    }

    iconoEstrella(indice: number): string {
        return this.tipoEstrella(indice) === 'half' ? 'star_half' : 'star';
    }

    estiloEstrella(indice: number): string {
        const fill = this.tipoEstrella(indice) === 'empty' ? 0 : 1;

        return `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`;
    }
}

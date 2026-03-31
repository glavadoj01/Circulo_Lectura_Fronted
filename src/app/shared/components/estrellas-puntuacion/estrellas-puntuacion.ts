import { Component, computed, input } from '@angular/core';
import { normalizarPuntuacion } from '@sharedUtils/format.utils';

@Component({
    selector: 'app-estrellas-puntuacion',
    imports: [],
    templateUrl: './estrellas-puntuacion.html',
})
export class EstrellasPuntuacion {
    puntuacion = input<number | null | undefined>(null);

    private puntuacionNormalizada = computed(() => {
        return normalizarPuntuacion(this.puntuacion());
    });

    private tipoEstrella(indice: number): 'full' | 'half' | 'empty' {
        const media = this.puntuacionNormalizada();
        const indiceSeguro = Math.max(1, Math.min(5, Math.floor(indice)));

        if (media >= indiceSeguro) {
            return 'full';
        }

        if (media >= indiceSeguro - 0.5) {
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

import { Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'app-paginacion',
    imports: [],
    templateUrl: './paginacion.html',
})
export class Paginacion {
    paginaActual = input.required<number>();
    totalPaginas = input.required<number>();
    paginaSeleccionada = output<number>();

    paginasVisibles = computed(() => {
        const total = this.totalPaginas();
        const pagina = this.paginaActual();

        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const inicio = Math.max(1, pagina - 2);
        const fin = Math.min(total, inicio + 4);
        const inicioAjustado = Math.max(1, fin - 4);

        return Array.from({ length: fin - inicioAjustado + 1 }, (_, i) => inicioAjustado + i);
    });

    irAPagina(pagina: number): void {
        if (pagina < 1 || pagina > this.totalPaginas() || pagina === this.paginaActual()) {
            return;
        }

        this.paginaSeleccionada.emit(pagina);
    }
}
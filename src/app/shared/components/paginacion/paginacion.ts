import { Component, computed, input, output } from '@angular/core';
import { valorNumeroSeguro } from '@app/shared/utils/validation.utils';

/**
 * Componente de paginación para navegar entre páginas de contenido. Permite seleccionar la página actual y muestra un conjunto de páginas visibles para facilitar la navegación. El componente recibe como inputs la página actual y el total de páginas, y emite un evento cuando se selecciona una nueva página.
 * La lógica de paginación se basa en mostrar un máximo de 7 páginas visibles, centradas alrededor de la página actual. Si el total de páginas es menor o igual a 7, se muestran todas las páginas. Si el total es mayor, se ajusta el rango de páginas visibles para mantener la página actual en el centro siempre que sea posible.
 * El método `irAPagina` se encarga de emitir el número de página seleccionado, asegurándose de que la página seleccionada sea válida y diferente a la página actual.
 */

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
        const total = valorNumeroSeguro(this.totalPaginas());
        const pagina = valorNumeroSeguro(this.paginaActual());

        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const inicio = Math.max(1, pagina - 2);
        const fin = Math.min(total, inicio + 4);
        const inicioAjustado = Math.max(1, fin - 4);

        return Array.from({ length: fin - inicioAjustado + 1 }, (_, i) => inicioAjustado + i);
    });

    /**
     * Emite el número de página seleccionado, asegurándose de que sea una página válida (entre 1 y el total de páginas) y diferente a la página actual.
     * Si la página seleccionada no es válida o es la misma que la página actual, no se emite ningún evento.
     * @param pagina Número de página a la que se desea navegar. Debe ser un número entero entre 1 y el total de páginas, y diferente a la página actual para que se emita el evento de selección.
     */
    irAPagina(pagina: number): void {
        const paginaSegura = valorNumeroSeguro(pagina);
        const total = valorNumeroSeguro(this.totalPaginas());
        const actual = valorNumeroSeguro(this.paginaActual());
        if (paginaSegura < 1 || paginaSegura > total || paginaSegura === actual) {
            return;
        }
        this.paginaSeleccionada.emit(paginaSegura);
    }
}

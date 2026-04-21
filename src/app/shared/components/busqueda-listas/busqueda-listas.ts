import { Component, signal } from '@angular/core';

@Component({
    selector: 'busqueda-listas',
    templateUrl: './busqueda-listas.html',
    styleUrl: './busqueda-listas.css',
})
export class BusquedaListasComponent {
    termino = signal('');

    buscarCallback: (() => void) | null = null;

    setBuscarCallback(cb: () => void) {
        this.buscarCallback = cb;
    }

    onBuscar() {
        if (this.buscarCallback) this.buscarCallback();
    }

    onInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.termino.set(value);
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.onBuscar();
        }
    }

    constructor() {
        console.log('[BusquedaListas] Componente inicializado');
    }
}

import { Component, EventEmitter, Output, signal } from '@angular/core';

@Component({
    selector: 'busqueda-listas',
    templateUrl: './busqueda-listas.html',
    styleUrl: './busqueda-listas.css',
})
export class BusquedaListasComponent {
    termino = signal('');

    @Output() buscar = new EventEmitter<string>();

    buscarLista() {
        this.buscar.emit(this.termino());
    }

    onInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.termino.set(value);
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.buscarLista();
        }
    }

    constructor() {
        console.log('[BusquedaListas] Componente inicializado');
    }
}

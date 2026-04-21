import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';

@Component({
    selector: 'filtros-listas',
    templateUrl: './filtros-listas.html',
    styleUrl: './filtros-listas.css',
})
export class FiltrosListasComponent {
    // Recibe las categorías como array de strings
    @Input({ required: true }) categorias!: string[];
    // Filtro seleccionado
    @Input() filtro!: Signal<string>;
    @Output() filtroChange = new EventEmitter<string>();

    // Efecto para seleccionar el primero por defecto
    constructor() {
        console.log('[FiltrosListas] Componente inicializado con categorías:', this.categorias);
    }

    seleccionar(cat: string) {
        console.log('[FiltrosListas] Seleccionando categoría:', cat);
        this.filtroChange.emit(cat);
    }
}

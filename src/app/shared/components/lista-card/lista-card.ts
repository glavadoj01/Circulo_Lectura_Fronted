import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ListaApp } from '@interfaces/modelosApp/modelosApp';

@Component({
    selector: 'lista-card',
    imports: [RouterLink, NgClass],
    templateUrl: './lista-card.html',
})
export class ListaCardComponent {
    @Input({ required: true }) lista!: ListaApp;

    portadaLibro(idLibro: number): string {
        // Igual que en libro-card: usar imagen random si no hay assets locales
        return `https://picsum.photos/seed/libro-${idLibro}/400/600`;
    }

    constructor() {
        console.log('[ListaCard] Componente inicializado con lista:', this.lista);
    }
}

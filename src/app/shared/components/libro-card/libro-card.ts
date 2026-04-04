import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { EstrellasPuntuacion } from '@sharedComponents/estrellas-puntuacion/estrellas-puntuacion';
import { AutorPrincipalPipe } from '@sharedPipes/autor-principal.pipe';
import { PuntuacionTextoPipe } from '@sharedPipes/puntuacion-texto.pipe';

@Component({
    selector: 'app-libro-card',
    imports: [RouterLink, EstrellasPuntuacion, AutorPrincipalPipe, PuntuacionTextoPipe],
    templateUrl: './libro-card.html',
})
export class LibroCard {
    libro = input.required<LibroApp>();

    // TODO Portada Real -> While placeholder random webIMG
    portadaLibro(idLibro: number): string {
        return `https://picsum.photos/seed/libro-${idLibro}/400/600`;
    }
}

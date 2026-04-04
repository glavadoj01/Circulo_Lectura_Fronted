import { Component, input } from '@angular/core';

@Component({
    selector: 'app-portada-detalle-libro',
    imports: [],
    templateUrl: './portada-detalle-libro.html',
})
export class PortadaDetalleLibro {
    tituloLibro = input.required<string>();
}

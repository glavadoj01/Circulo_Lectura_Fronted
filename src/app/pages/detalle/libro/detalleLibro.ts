import { Component, signal, inject, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ObtenerLibro } from '@services/obtenerLibro/obtenerLibro';
import { LibroApp } from '@app/interfaces/modelosApp/modelosApp';

@Component({
    selector: 'app-libro-detalle',
    imports: [],
    templateUrl: './detalleLibro.html',
    styleUrl: './detalleLibro.css',
})
export class DetalleLibro {
    private route = inject(ActivatedRoute);
    private libroService = inject(ObtenerLibro);

    libro = signal<LibroApp | null>(null);

    // Efecto reactivo para obtener la id y pedir el libro
    constructor() {
        effect(() => {
            const id = Number(this.route.snapshot.paramMap.get('id'));
            if (id) {
                this.libroService.getLibroPorId(id).subscribe((data) => {
                    this.libro.set(data);
                });
            }
        });
    }
}

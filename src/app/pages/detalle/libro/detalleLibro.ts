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
            const idParam = this.route.snapshot.paramMap.get('id');
            const id = idParam ? Number(idParam) : null;
            console.log('ID leído de la ruta:', id);
            if (id && !isNaN(id) && id > 0) {
                this.libroService.getLibroPorId(id).subscribe((data) => {
                    const libro: LibroApp = {
                        ...data,
                        autores: data.autores?.map((a: any) => a.nombre_autor),
                        generos: data.generos?.map((g: any) => g.nombre),
                    };
                    this.libro.set(libro);
                });
            } else {
                console.error('ID inválido:', id);
            }
        });
    }
}

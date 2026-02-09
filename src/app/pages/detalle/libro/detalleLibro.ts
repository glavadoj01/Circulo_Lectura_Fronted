import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { LibroApp, RespuestaCriticas } from '@interfaces/modelosApp/modelosApp';
import { servicioLibros } from '@services/servicioLibros/servicioLibros';
import { ComentarioNuevo } from '@app/shared/components/comentarioNuevo/comentarioNuevo';
import { ComentarioExistente } from '@app/shared/components/comentarioExistente/comentarioExistente';

@Component({
    selector: 'app-libro-detalle',
    imports: [ComentarioNuevo, ComentarioExistente],
    templateUrl: './detalleLibro.html',
})
export class DetalleLibro {
    libro: LibroApp | null = null;
    notasIndividuales: { nota: number; cantidad: number; frecuencia: number }[] = [];
    criticas: Partial<LibroCritica>[] = [];

    @ViewChild('ENVIAR') enviarBtn!: ElementRef<HTMLButtonElement>;
    @ViewChild('selectorIrA') selectorIrA!: ElementRef<HTMLInputElement>;

    // Efecto reactivo para obtener la id y pedir el libro
    constructor(
        private rutaActiva: ActivatedRoute,
        private libroService: servicioLibros,
        private router: Router, // Temporalmente para navegar a otro libro desde el input
    ) {
        //prettier-ignore
        this.rutaActiva.paramMap.subscribe((paramMapa) => { // TEMPORAL => usamos una suscripción para reaccionar a cambios en la ruta,
            const idParam = paramMapa.get('id');           //  cuando se navega a otro libro mediante el input, finalmente sera un effect()
            const id = idParam ? Number(idParam) : null;  //  que lee la id de la ruta y ejecuta la carga 1 sola vez, sin necesidad de suscribirse a cambios
            console.log('ID leído de la ruta:', id);
            this.obtenerLibro(id);
            this.obtenerCriticas(id);
        });
    }

    onSubmitCambiarLibro(event: Event) {
        event.preventDefault();
        const id = this.selectorIrA?.nativeElement.value;
        if (id && !isNaN(Number(id)) && Number(id) > 0) {
            this.router.navigate([`/detalle/libro/${id}`]);
        }
    }

    obtenerLibro(id: number | null) {
        if (id && !isNaN(id) && id > 0) {
            this.libroService.getLibroPorId(id).subscribe((data) => {
                const libroData = Array.isArray(data) ? data[0] : data;
                const libro: LibroApp = {
                    ...libroData,
                    autores: libroData.autores?.map((a: any) => a.nombre_autor),
                    generos: libroData.generos?.map((g: any) => g.nombre),
                    calificacionPromedio:
                        parseFloat(libroData.calificacionPromedio).toFixed(2) || 0,
                };
                this.libro = libro;
            });
        } else {
            console.error('ID inválido:', id);
        }
    }

    obtenerCriticas(id: number | null) {
        if (id && !isNaN(id) && id > 0) {
            this.libroService.getCriticasPorIdLibro(id).subscribe((data: RespuestaCriticas) => {
                this.criticas = data.criticas;
                const total = data.criticas.length;
                const notas = data.frecuencias.map((cantidad, nota) => ({
                    nota,
                    cantidad,
                    frecuencia: total > 0 ? Number(((cantidad * 100) / total).toFixed(2)) : 0,
                }));
                this.notasIndividuales = notas.sort((a, b) => b.nota - a.nota);
            });
        } else {
            console.error('ID inválido para obtener notas individuales:', id);
        }
    }
}

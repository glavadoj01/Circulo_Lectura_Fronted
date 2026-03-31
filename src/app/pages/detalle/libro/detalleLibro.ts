// Importaciones node_modules
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
// Importaciones propias
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { LibroApp, RespuestaCriticas } from '@interfaces/modelosApp/modelosApp';
import { servicioLibros } from '@services/servicioLibros/servicioLibros';
import { ComentarioNuevo } from '@app/shared/components/comentarioNuevo/comentarioNuevo';
import { ComentarioExistente } from '@app/shared/components/comentarioExistente/comentarioExistente';

@Component({
    selector: 'app-libro-detalle',
    imports: [ComentarioNuevo, ComentarioExistente, DecimalPipe],
    templateUrl: './detalleLibro.html',
})
export class DetalleLibro {
    libro: LibroApp | null = null;
    notasIndividuales: { nota: number; cantidad: number; frecuencia: number }[] = [];
    criticas: LibroCritica[] = [];
    libroEncontrado = false;
    cargando = true;
    errorCriticas = false;

    private destroyRef = inject(DestroyRef);

    constructor(
        private rutaActiva: ActivatedRoute,
        private libroService: servicioLibros,
    ) {
        const id = this.rutaActiva.snapshot.paramMap.get('id');
        console.log('ID leído de la ruta:', id);
        const idNum = id ? Number(id) : null;
        console.log('ID convertido a número:', idNum);
        if (idNum && !isNaN(idNum) && idNum > 0) {
            this.cargarDetalle(idNum);
        } else {
            console.error('ID inválido:', id);
            this.cargando = false;
        }
    }

    private cargarDetalle(id: number) {
        console.log('[DetalleLibro] inicio carga Id :', id);
        const libro$ = this.libroService.getLibroPorId(id);
        const criticas$ = this.libroService.getCriticasPorIdLibro(id).pipe(
            catchError(() => {
                this.errorCriticas = true;
                return of({
                    criticas: [],
                    frecuencias: [0, 0, 0, 0, 0, 0],
                } as RespuestaCriticas);
            }),
        );

        forkJoin({ libro: libro$, criticas: criticas$ })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => (this.cargando = false)),
            )
            .subscribe({
                next: ({ libro, criticas }) => {
                    console.log('Datos recibidos del servicio:', { libro, criticas });

                    this.libro = libro;
                    this.libroEncontrado = true;

                    this.criticas = criticas.criticas;
                    console.log('Críticas recibidas:', this.criticas);

                    const total = criticas.criticas.length;
                    const notas = criticas.frecuencias.map((cantidad, nota) => ({
                        nota,
                        cantidad,
                        frecuencia: total > 0 ? Number(((cantidad * 100) / total).toFixed(2)) : 0,
                    }));
                    console.log('Cálculo de notas individuales:', notas);
                    console.log('Total de críticas:', total);

                    this.notasIndividuales = notas.sort((a, b) => b.nota - a.nota);
                    console.log('Notas individuales calculadas:', this.notasIndividuales);
                },
                error: (error: HttpErrorResponse) => {
                    if (error.status === 404) {
                        console.error('Libro no encontrado');
                        return;
                    }
                    if (error.status === 400) {
                        console.error('Petición inválida: falta o es incorrecto el id del libro');
                        return;
                    }
                    console.error('Error al cargar el libro o las críticas', error);
                },
            });
    }
}

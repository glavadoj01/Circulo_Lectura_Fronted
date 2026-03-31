// Importaciones node_modules
import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
// Importaciones propias
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { servicioLibros } from '@services/servicioLibros/servicioLibros';
import { ComentarioNuevo } from '@app/shared/components/comentarioNuevo/comentarioNuevo';
import { ComentarioExistente } from '@app/shared/components/comentarioExistente/comentarioExistente';
import { BannerCargando } from '@app/shared/components/banner-cargando/banner-cargando';
import { BannerError } from '@app/shared/components/banner-error/banner-error';
import { ResumenPuntuaciones } from '@app/shared/components/resumen-puntuaciones/resumen-puntuaciones';

@Component({
    selector: 'app-libro-detalle',
    imports: [
        ComentarioNuevo,
        ComentarioExistente,
        BannerCargando,
        BannerError,
        ResumenPuntuaciones,
        DecimalPipe,
    ],
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
        console.log('[DetalleLibro] ID en ruta:', id);

        const idNum = id ? Number(id) : null;
        console.log('[DetalleLibro] id parseado:', idNum);
        if (idNum && !isNaN(idNum) && idNum > 0) {
            this.cargarDetalle(idNum);
        } else {
            console.error('[DetalleLibro] Error: ID inválido recibido en ruta:', id);
            this.cargando = false;
        }
    }

    private cargarDetalle(id: number) {
        console.log('[DetalleLibro] Iniciando carga de detalle. id=', id);

        this.libroService
            .getDetalleLibro(id)
            .pipe(
                // takeUntilDestroyed: Se asegura de que si el componente se destruye (ej: el usuario navega a otra página) se cancele la suscripción al observable para evitar memory leaks.
                takeUntilDestroyed(this.destroyRef),
                catchError((error: unknown) => {
                    // error.message contiene: LIBRO_NOT_FOUND, LIBRO_BAD_REQUEST, etc
                    const tipo = error instanceof Error ? error.message : 'UNKNOWN';
                    console.warn('[DetalleLibro] Error:', tipo);
                    this.libroEncontrado = false;
                    this.errorCriticas = false;
                    return of(null);
                }),
                finalize(() => {
                    this.cargando = false;
                    console.log('[DetalleLibro] Fin.', {
                        libroEncontrado: this.libroEncontrado,
                        errorCriticas: this.errorCriticas,
                        totalCriticas: this.criticas.length,
                    });
                }),
            )
            .subscribe((detalle) => {
                if (!detalle) return;

                this.libro = detalle.libro;
                this.criticas = detalle.criticas;
                this.notasIndividuales = detalle.notasDistribucion;
                this.errorCriticas = detalle.errorCriticas;
                this.libroEncontrado = true;

                console.log('[DetalleLibro] ✓ Cargado:', {
                    id: this.libro?.id_libro,
                    titulo: this.libro?.titulo_libro,
                    críticas: this.criticas.length,
                    errorCriticas: this.errorCriticas,
                });
            });
    }
}

// Importaciones node_modules
import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { manejarError } from '@sharedUtils/error.utils';
// Importaciones propias
import { LibroCritica } from '@interfaces/modelosBD/modelosBD';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { servicioDetalleLibro } from '@services/servicioLibros/servicioDetalleLibro';
import { ComentarioNuevo } from '@sharedComponents/comentarioNuevo/comentarioNuevo';
import { ComentarioExistente } from '@sharedComponents/comentarioExistente/comentarioExistente';
import { BannerCargando } from '@sharedComponents/banner-cargando/banner-cargando';
import { BannerError } from '@sharedComponents/banner-error/banner-error';
import { ResumenPuntuaciones } from '@sharedComponents/resumen-puntuaciones/resumen-puntuaciones';
import { LibroMetadatos } from '@sharedComponents/libro-metadatos/libro-metadatos';

@Component({
    selector: 'app-libro-detalle',
    imports: [
        ComentarioNuevo,
        ComentarioExistente,
        BannerCargando,
        BannerError,
        ResumenPuntuaciones,
        LibroMetadatos,
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

    tieneSinopsisValida(): boolean {
        return this.libro?.sinopsis ? this.libro.sinopsis.trim().length > 0 : false;
    }

    constructor(
        private rutaActiva: ActivatedRoute,
        private libroService: servicioDetalleLibro,
    ) {
        const id = this.rutaActiva.snapshot.paramMap.get('id');
        console.log('[DetalleLibro] ID en ruta:', id);

        const idNum = id ? Number(id) : null;
        console.log('[DetalleLibro] id parseado:', idNum);
        if (idNum && !isNaN(idNum) && idNum > 0) {
            this.cargarDetalle(idNum);
        } else {
            manejarError('detallelibro_id_invalido', 'DetalleLibro.constructor', { id });
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
                    manejarError(error, 'DetalleLibro.cargarDetalle', { id });
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

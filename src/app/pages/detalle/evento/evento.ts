import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { manejarError } from '@sharedUtils/error.utils';
import { valorNumeroSeguro } from '@sharedUtils/validation.utils';
// Interfaces y servicios@interfaces/modelosBD/modelosBD';
import { ComentarioExistente } from '@sharedComponents/comentarioExistente/comentarioExistente';
import { BannerCargando } from '@sharedComponents/banner-cargando/banner-cargando';
import { BannerError } from '@sharedComponents/banner-error/banner-error';
import { LibroCard } from '@sharedComponents/libro-card/libro-card';
import { DetalleEventoCompleto } from '@app/interfaces/modelosApp/modelosApp';
import { ServicioDetalleEvento } from '@app/services/servicioEventos/servicioDetalleEvento';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-evento',
    imports: [BannerCargando, BannerError, ComentarioExistente, LibroCard, DatePipe],
    templateUrl: './evento.html',
})
export class Evento {
    private readonly destroyRef = inject(DestroyRef);

    detalle: DetalleEventoCompleto | null = null;
    eventoEncontrado = false;
    cargando = true;
    errorComentarios = false;

    constructor(
        private readonly rutaActiva: ActivatedRoute,
        private readonly eventoService: ServicioDetalleEvento,
    ) {
        const id = this.rutaActiva.snapshot.paramMap.get('id');
        const idNum = valorNumeroSeguro(id ?? -1);
        if (idNum && !Number.isNaN(idNum) && idNum > 0) {
            this.cargarDetalle(idNum);
        } else {
            manejarError('detalleevento_id_invalido', 'Evento.constructor', { id });
            this.cargando = false;
        }
    }

    private cargarDetalle(id: number) {
        this.eventoService
            .getDetalleEvento(id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError((error: unknown) => {
                    manejarError(error, 'Evento.cargarDetalle', { id });
                    this.eventoEncontrado = false;
                    this.errorComentarios = false;
                    return of(null);
                }),
                finalize(() => {
                    this.cargando = false;
                }),
            )
            .subscribe((detalle: DetalleEventoCompleto | null) => {
                if (!detalle) return;
                this.detalle = detalle;
                this.eventoEncontrado = true;
                this.errorComentarios = detalle.errorComentarios;
            });
    }
}

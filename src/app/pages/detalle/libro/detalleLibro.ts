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
import { valorNumeroSeguro } from '@app/shared/utils/validation.utils';
import { PortadaDetalleLibro } from './portada-detalle-libro/portada-detalle-libro';

/**
 * Componente para mostrar el detalle de un libro, incluyendo su información general, críticas y puntuaciones. Utiliza el servicio `servicioDetalleLibro` para obtener los datos del libro a partir de su ID, que se obtiene de la ruta activa. El componente maneja estados de carga, error y éxito para proporcionar una experiencia de usuario fluida.
 * El componente muestra un banner de carga mientras se obtienen los datos, y un banner de error si ocurre algún problema durante la carga. Si el libro se carga correctamente, se muestra su información utilizando el componente `LibroMetadatos`, un resumen de las puntuaciones con `ResumenPuntuaciones`, y una lista de críticas utilizando `ComentarioExistente` para cada crítica existente y `ComentarioNuevo` para permitir al usuario agregar una nueva crítica.
 * El componente también incluye validaciones para asegurar que los datos mostrados sean seguros y maneja adecuadamente los casos en los que el libro no se encuentra o no tiene críticas disponibles.
 */

@Component({
    selector: 'app-libro-detalle',
    imports: [
        BannerCargando,
        BannerError,
        ComentarioNuevo,
        ComentarioExistente,
        DecimalPipe,
        LibroMetadatos,
        PortadaDetalleLibro,
        ResumenPuntuaciones,
    ],
    templateUrl: './detalleLibro.html',
})
export class DetalleLibro {
    private destroyRef = inject(DestroyRef);

    libro: LibroApp | null = null;
    notasIndividuales: { nota: number; cantidad: number; frecuencia: number }[] = [];
    criticas: LibroCritica[] = [];
    libroEncontrado = false;
    cargando = true;
    errorCriticas = false;

    /**
     * Inicializa el componente, obteniendo el ID del libro desde la ruta activa y cargando su detalle utilizando el servicio `servicioDetalleLibro`. Maneja los estados de carga y error, y asegura que se limpien las suscripciones al destruir el componente para evitar memory leaks.
     * @param rutaActiva Servicio de Angular para acceder a la ruta activa y obtener parámetros de la URL, como el ID del libro.
     * @param libroService Servicio para obtener los detalles del libro y sus críticas.
     */
    constructor(
        private rutaActiva: ActivatedRoute,
        private libroService: servicioDetalleLibro,
    ) {
        const id = this.rutaActiva.snapshot.paramMap.get('id');
        console.log('[DetalleLibro] ID en ruta:', id);

        const idNum = valorNumeroSeguro(id ?? -1);
        console.log('[DetalleLibro] id parseado:', idNum);
        if (idNum && !isNaN(idNum) && idNum > 0) {
            this.cargarDetalle(idNum);
        } else {
            manejarError('detallelibro_id_invalido', 'DetalleLibro.constructor', { id });
            this.cargando = false;
        }
    }

    /**
     * Obtiene el detalle del libro por su ID utilizando el servicio `servicioDetalleLibro`, y maneja los estados de carga, error y éxito. Si la carga es exitosa, se asignan los datos del libro, sus críticas y la distribución de notas a las propiedades correspondientes. Si ocurre un error, se maneja adecuadamente y se actualizan los estados para reflejar que el libro no fue encontrado o que hubo un error al cargar las críticas.
     * @param id Número ID del libro a cargar, obtenido de la ruta activa. Se espera que sea un número válido y positivo.
     */
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
                console.log('[DetalleLibro] Detalle recibido:', detalle);
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

    /**
     * Verifica si la sinopsis del libro es válida (no está vacía).
     * @returns true si la sinopsis es válida, false en caso contrario.
     */
    tieneSinopsisValida(): boolean {
        return this.libro?.sinopsis ? this.libro.sinopsis.trim().length > 0 : false;
    }
}

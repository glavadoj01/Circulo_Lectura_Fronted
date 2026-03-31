import { Component, effect, input } from '@angular/core';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { ServicioUsuario } from '@services/servicioUsuario/servicioUsuario';
import { EstrellasPuntuacion } from '@sharedComponents/estrellas-puntuacion/estrellas-puntuacion';
import { PuntuacionNormalizadaPipe } from '@sharedPipes/puntuacion-normalizada.pipe';
import { TiempoRelativoPipe } from '@sharedPipes/tiempo-relativo.pipe';

@Component({
    selector: 'app-comentario-existente',
    imports: [EstrellasPuntuacion, PuntuacionNormalizadaPipe, TiempoRelativoPipe],
    templateUrl: './comentarioExistente.html',
})
export class ComentarioExistente {
    critica = input.required<Partial<LibroCritica>>();
    usuarioNombre: string = '';

    constructor(private servicioUsuario: ServicioUsuario) {
        effect((onCleanup) => {
            const critica = this.critica();
            this.usuarioNombre = 'Desconocido';

            const idUsuario = Number(critica.id_usuario);
            if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
                return;
            }

            const sub = this.servicioUsuario
                .getUsuarioPorId(idUsuario, 'nombre_usuario')
                .subscribe((data: any) => {
                    if (Array.isArray(data) && data.length > 0) {
                        this.usuarioNombre = data[0].nombre_usuario || 'Desconocido';
                        return;
                    }

                    this.usuarioNombre = data?.nombre_usuario || 'Desconocido';
                });

            onCleanup(() => sub.unsubscribe());
        });
    }
}

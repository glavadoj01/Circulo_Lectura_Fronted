import { Component, effect, input } from '@angular/core';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { valorNumeroSeguro } from '@app/shared/utils/validation.utils';
import { ServicioUsuario } from '@services/servicioUsuario/servicioUsuario';
import { EstrellasPuntuacion } from '@sharedComponents/estrellas-puntuacion/estrellas-puntuacion';
import { PuntuacionNormalizadaPipe } from '@sharedPipes/puntuacion-normalizada.pipe';
import { TiempoRelativoPipe } from '@sharedPipes/tiempo-relativo.pipe';

/**
 * Componente para mostrar un comentario existente, incluyendo la puntuación, el texto del comentario, el nombre del usuario que lo realizó y el tiempo relativo desde que se publicó. Utiliza validaciones para asegurar que los datos sean seguros y presenta la información de manera clara y concisa.
 * Recibe como input un objeto `LibroCritica` que contiene toda la información relevante del comentario. El componente utiliza el servicio de usuario para obtener el nombre del usuario a partir de su ID, y muestra "Desconocido" si no se puede obtener el nombre.
 * El componente también incluye pipes para formatear la puntuación y el tiempo relativo, asegurando que se muestren valores válidos o mensajes adecuados en caso de datos faltantes o inválidos.
 */

@Component({
    selector: 'app-comentario-existente',
    imports: [EstrellasPuntuacion, PuntuacionNormalizadaPipe, TiempoRelativoPipe],
    templateUrl: './comentarioExistente.html',
})
export class ComentarioExistente {
    critica = input.required<Partial<LibroCritica>>();
    usuarioNombre: string = '';

    /**
     * Inicializa el componente y establece un efecto para obtener el nombre del usuario a partir del ID de usuario presente en la crítica. Si el ID de usuario no es válido, se establece el nombre como "Desconocido". Si el ID es válido, se suscribe al servicio de usuario para obtener el nombre y actualizarlo en consecuencia.
     * El efecto se limpia automáticamente al destruir el componente para evitar fugas de memoria.
     * @param servicioUsuario
     */
    constructor(private servicioUsuario: ServicioUsuario) {
        effect((onCleanup) => {
            const critica = this.critica();
            this.usuarioNombre = 'Desconocido';

            const idUsuario = valorNumeroSeguro(critica?.id_usuario ?? -1);
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

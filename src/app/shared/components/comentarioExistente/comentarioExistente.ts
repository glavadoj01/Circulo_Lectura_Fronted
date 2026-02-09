import { Component, effect, Input, signal } from '@angular/core';
import { LibroCritica } from '@app/interfaces/modelosBD/modelosBD';
import { ServicioUsuario } from '@services/servicioUsuario/servicioUsuario';

@Component({
    selector: 'app-comentario-existente',
    imports: [],
    templateUrl: './comentarioExistente.html',
    styleUrl: './comentarioExistente.css',
})
export class ComentarioExistente {
    @Input() critica!: Partial<LibroCritica>;
    usuarioNombre = signal<string>('');
    intervaloT = signal<string>('');

    constructor(private ServicioUsuario: ServicioUsuario) {
        effect(() => {
            const critica = this.critica;
            if (!critica) return;

            if (critica.id_usuario) {
                this.ServicioUsuario.getUsuarioPorId(
                    critica.id_usuario,
                    'nombre_usuario',
                ).subscribe((data: any) => {
                    // Si la respuesta es un array, toma el primer elemento
                    if (Array.isArray(data) && data.length > 0) {
                        this.usuarioNombre.set(data[0].nombre_usuario);
                    } else if (data && data.nombre_usuario) {
                        this.usuarioNombre.set(data.nombre_usuario);
                    } else {
                        this.usuarioNombre.set('Desconocido');
                    }
                });
                this.intervaloT.set(this.calcularIntervaloTiempo(critica.fecha_critica));
            }
        });
    }

    private calcularIntervaloTiempo(fecha: Date | string | undefined): string {
        if (!fecha) return 'Hace un momento';
        let fechaConvertida: Date;
        if (fecha instanceof Date) {
            fechaConvertida = fecha;
        } else if (typeof fecha === 'string') {
            fechaConvertida = new Date(fecha.trim());
            if (!isNaN(fechaConvertida.getTime())) {
                return 'Fecha inválida';
            }
        } else {
            return 'Fecha no reconocida';
        }

        const ahora = new Date();
        const diferenciaMs = ahora.getTime() - fechaConvertida.getTime();
        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos < 1) return 'Hace un momento';
        if (diferenciaMinutos < 60)
            return `Hace ${diferenciaMinutos} minuto${diferenciaMinutos > 1 ? 's' : ''}`;
        const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
        if (diferenciaHoras < 24)
            return `Hace ${diferenciaHoras} hora${diferenciaHoras > 1 ? 's' : ''}`;
        const diferenciaDias = Math.floor(diferenciaHoras / 24);
        return `Hace ${diferenciaDias} día${diferenciaDias > 1 ? 's' : ''}`;
    }
}

import { Component, effect, input } from "@angular/core";
import type { LibroCritica, ListaComentarios, EventoComentario } from "@Interfaces/modelosBD/modelosBD";
import { valorNumeroSeguro } from "@Utils/validation.utils";
import { ServicioUsuario } from "@Services/servicioUsuario/servicioUsuario";
import { EstrellasPuntuacion } from "@sharedComponents/estrellas-puntuacion/estrellas-puntuacion";
import { PuntuacionNormalizadaPipe } from "@Pipes/puntuacion-normalizada.pipe";
import { TiempoRelativoPipe } from "@Pipes/tiempo-relativo.pipe";
import { SaltosLinea } from "@Pipes/saltosLinea.pipe";

type ComentarioConPuntuacion =
	| Partial<LibroCritica & { calificacion_lista?: number | null }>
	| Partial<ListaComentarios & { calificacion_lista?: number | null }>
	| Partial<EventoComentario & { calificacion_evento?: number | null }>;

/**
 * Componente para mostrar un comentario existente, incluyendo la puntuación, el texto del comentario, el nombre del usuario que lo realizó y el tiempo relativo desde que se publicó. Utiliza validaciones para asegurar que los datos sean seguros y presenta la información de manera clara y concisa.
 * Recibe como input un objeto `LibroCritica` que contiene toda la información relevante del comentario. El componente utiliza el servicio de usuario para obtener el nombre del usuario a partir de su ID, y muestra "Desconocido" si no se puede obtener el nombre.
 * El componente también incluye pipes para formatear la puntuación y el tiempo relativo, asegurando que se muestren valores válidos o mensajes adecuados en caso de datos faltantes o inválidos.
 */

@Component({
	selector: "app-comentario-existente",
	imports: [EstrellasPuntuacion, PuntuacionNormalizadaPipe, TiempoRelativoPipe, SaltosLinea],
	templateUrl: "./comentarioExistente.html",
})
export class ComentarioExistente {
	critica = input.required<ComentarioConPuntuacion>();
	usuarioNombre: string = "";

	/**
	 * Inicializa el componente y establece un efecto para obtener el nombre del usuario a partir del ID de usuario presente en la crítica. Si el ID de usuario no es válido, se establece el nombre como "Desconocido". Si el ID es válido, se suscribe al servicio de usuario para obtener el nombre y actualizarlo en consecuencia.
	 * El efecto se limpia automáticamente al destruir el componente para evitar fugas de memoria.
	 * @param servicioUsuario
	 */
	constructor(private readonly servicioUsuario: ServicioUsuario) {
		effect(onCleanup => {
			const critica = this.critica();
			this.usuarioNombre = "Desconocido";

			const idUsuario = valorNumeroSeguro(critica?.id_usuario ?? -1);
			if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
				return;
			}

			const sub = this.servicioUsuario.getNombreUsuarioComentario(idUsuario).subscribe((data: any) => {
				if (Array.isArray(data) && data.length > 0) {
					this.usuarioNombre = data[0].nombre_usuario || "Desconocido";
					return;
				}

				this.usuarioNombre = data?.nombre_usuario || "Desconocido";
			});

			onCleanup(() => sub.unsubscribe());
		});
	}

	get tituloComentario(): string {
		const c = this.critica();
		return "titulo_comentario" in c && typeof c.titulo_comentario === "string" ? c.titulo_comentario : "";
	}

	get textoComentario(): string {
		const c = this.critica();
		return "texto_comentario" in c && typeof c.texto_comentario === "string" ? c.texto_comentario : "";
	}

	get fechaComentario(): string | Date {
		const c = this.critica();
		return "fecha_comentario" in c ? c.fecha_comentario! : "";
	}

	get calificacion(): number | null | undefined {
		const c = this.critica();
		if ("calificacion_comentario" in c) return c.calificacion_comentario!;
		if ("calificacion_lista" in c) return c.calificacion_lista!;
		if ("calificacion_evento" in c) return c.calificacion_evento!;
		return null;
	}

	imagenAvatar(): string {
		return ServicioUsuario.avatarUsuario(this.critica()?.id_usuario ?? 1);
	}
}

import { Component, effect } from "@angular/core";
import { valorNumeroSeguro } from "@Utils/validation.utils";
import { ServicioUsuario } from "@Services/servicioUsuario/servicioUsuario";

@Component({
	selector: "app-comentario-nuevo",
	imports: [],
	templateUrl: "./comentarioNuevo.html",
})
export class ComentarioNuevo {
	usuarioNombre: string = "";

	constructor(private readonly servicioUsuario: ServicioUsuario) {
		effect(onCleanup => {
			this.usuarioNombre = "Desconocido";

			const idUsuario = valorNumeroSeguro(0);
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

	imagenAvatar(): string {
		return ServicioUsuario.avatarUsuario(0);
	}
}

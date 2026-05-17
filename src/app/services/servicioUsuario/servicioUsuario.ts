// Importaciones node_modules
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
// Importaciones propias
import { environment } from "@environments/environments";
import {
	CriticaConTitulo,
	EventoResumen,
	LibroResumen,
	ListaApp,
	UsuarioCompleto,
} from "@Interfaces/modelosApp/modelosApp";
import { AppError } from "@Utils/error.utils";
import { procesarRespuestaArray, procesarRespuestaUnica } from "@Utils/procesarRespuesta";

@Injectable({
	providedIn: "root",
})
export class ServicioUsuario {
	private readonly apiUrl = `${environment.apiUrl}:${environment.puerto}`;

	constructor(private readonly http: HttpClient) {}

	getNombreUsuarioComentario(id: number): Observable<string> {
		const url = `${this.apiUrl}/usuario/nombre/${id}`;
		const filtros = { id_usuario: id };
		console.log("URL para obtener usuario:", url);
		console.log("Filtros para obtener usuario:", filtros);
		return this.http
			.get<{ data: { nombre_usuario: string } }>(url, {
				params: {
					filtros: JSON.stringify(filtros),
					columnas: "nombre_usuario",
				},
			})
			.pipe(
				map(resp => {
					console.log("Respuesta del servidor para obtener usuario:", resp);
					const nombreUsuario = procesarRespuestaUnica<string>(resp, "nombre_usuario");
					if (!nombreUsuario) {
						throw new AppError("usuario_nombre_respuesta_invalida", { id });
					}
					return nombreUsuario;
				}),
			);
	}

	getUsuarioCompleto(id: number): Observable<UsuarioCompleto> {
		return this.http.get<UsuarioCompleto>(`${this.apiUrl}/usuario/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener usuario completo:", resp);
				const usuario = procesarRespuestaUnica<UsuarioCompleto>(resp, "usuario");
				if (!usuario) {
					throw new AppError("usuario_completo_respuesta_invalida", { id });
				}
				return usuario;
			}),
		);
	}

	getLibrosLeidos(id: number): Observable<LibroResumen[]> {
		return this.http.get<LibroResumen[]>(`${this.apiUrl}/usuario/libros/leidos/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener libros leídos:", resp);
				const librosLeidos = procesarRespuestaArray<LibroResumen>(resp, "libros_leidos");
				if (!librosLeidos) {
					throw new AppError("usuario_libros_leidos_respuesta_invalida", { id });
				}
				return librosLeidos;
			}),
		);
	}

	getLibrosPendientes(id: number): Observable<LibroResumen[]> {
		return this.http.get<LibroResumen[]>(`${this.apiUrl}/usuario/libros/pendientes/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener libros pendientes:", resp);
				const librosPendientes = procesarRespuestaArray<LibroResumen>(resp, "libros_pendientes");
				if (!librosPendientes) {
					throw new AppError("usuario_libros_pendientes_respuesta_invalida", { id });
				}
				return librosPendientes;
			}),
		);
	}

	getListasCreadas(id: number): Observable<ListaApp[]> {
		return this.http.get<ListaApp[]>(`${this.apiUrl}/usuario/listas/creadas/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener listas creadas:", resp);
				const listasCreadas = procesarRespuestaArray<ListaApp>(resp, "listas_creadas");
				if (!listasCreadas) {
					throw new AppError("usuario_listas_creadas_respuesta_invalida", { id });
				}
				return listasCreadas;
			}),
		);
	}

	getListasSeguidas(id: number): Observable<ListaApp[]> {
		return this.http.get<ListaApp[]>(`${this.apiUrl}/usuario/listas/seguidas/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener listas seguidas:", resp);
				const listasSeguidas = procesarRespuestaArray<ListaApp>(resp, "listas_seguidas");
				if (!listasSeguidas) {
					throw new AppError("usuario_listas_seguidas_respuesta_invalida", { id });
				}
				return listasSeguidas;
			}),
		);
	}

	getEventosCreados(id: number): Observable<EventoResumen[]> {
		return this.http.get<EventoResumen[]>(`${this.apiUrl}/usuario/eventos/creados/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener eventos creados:", resp);
				const eventosCreados = procesarRespuestaArray<EventoResumen>(resp, "eventos_creados");
				if (!eventosCreados) {
					throw new AppError("usuario_eventos_creados_respuesta_invalida", { id });
				}
				return eventosCreados;
			}),
		);
	}

	getEventosAsistidos(id: number): Observable<EventoResumen[]> {
		return this.http.get<EventoResumen[]>(`${this.apiUrl}/usuario/eventos/asistidos/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener eventos asistidos:", resp);
				const eventosAsistidos = procesarRespuestaArray<EventoResumen>(resp, "eventos_asistidos");
				if (!eventosAsistidos) {
					throw new AppError("usuario_eventos_asistidos_respuesta_invalida", { id });
				}
				return eventosAsistidos;
			}),
		);
	}

	getCriticas(id: number): Observable<CriticaConTitulo[]> {
		return this.http.get<CriticaConTitulo[]>(`${this.apiUrl}/usuario/criticas/${id}`).pipe(
			map(resp => {
				console.log("Respuesta del servidor para obtener críticas:", resp);
				const criticas = procesarRespuestaArray<CriticaConTitulo>(resp, "criticas");
				if (!criticas) {
					throw new AppError("usuario_criticas_respuesta_invalida", { id });
				}
				return criticas;
			}),
		);
	}

	static avatarUsuario(idUsuario: number = 1): string {
		return `https://i.pravatar.cc/150?u=usuario-${idUsuario}`;
	}
}

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { environment } from "@environments/environments";
import { DetalleEventoCompleto, EventoApp, EventoResumen, LibroResumen } from "@Interfaces/modelosApp/modelosApp";
import { EventoComentario, EventoUsuario } from "@Interfaces/modelosBD/modelosBD";
import { manejarError } from "@Utils/error.utils";
import { procesarRespuestaArray, procesarRespuestaUnica } from "@app/shared/utils/procesarRespuesta";

@Injectable({ providedIn: "root" })
export class ServicioDetalleEvento {
	constructor(readonly http: HttpClient) {}

	private getEventoPorId(id: number): Observable<EventoApp> {
		const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}`;
		console.log(`[ServicioDetalleEvento] getEventoPorId - URL: ${url}`);
		return this.http.get<{ data: EventoApp }>(url).pipe(
			map(resp => {
				console.log("[ServicioDetalleEvento] getEventoPorId - respuesta HTTP:", resp);
				return procesarRespuestaUnica<EventoApp>(resp, "evento");
			}),
			catchError(error => {
				throw manejarError(error, "servicioDetalleEvento.getEventoPorId", { id });
			}),
		);
	}

	private getComentariosPorIdEvento(id: number): Observable<EventoComentario[]> {
		const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/comentarios`;
		console.log(`[ServicioDetalleEvento] getComentariosPorIdEvento - URL: ${url}`);
		return this.http.get<{ data: EventoComentario[] }>(url).pipe(
			map(resp => {
				console.log("[ServicioDetalleEvento] getComentariosPorIdEvento - respuesta HTTP:", resp);
				return procesarRespuestaArray<EventoComentario>(resp, "comentarios");
			}),
			catchError(error => {
				throw manejarError(error, "servicioDetalleEvento.getComentariosPorIdEvento", {
					id,
				});
			}),
		);
	}

	private getAsistentesPorIdEvento(id: number): Observable<EventoUsuario[]> {
		const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/asistentes`;
		console.log(`[ServicioDetalleEvento] getAsistentesPorIdEvento - URL: ${url}`);
		return this.http.get<{ data: { asistentes: EventoUsuario[] } }>(url).pipe(
			map(resp => {
				console.log("[ServicioDetalleEvento] getAsistentesPorIdEvento - respuesta HTTP:", resp);
				return procesarRespuestaArray<EventoUsuario>({ data: resp.data.asistentes }, "asistentes");
			}),
			catchError(error => {
				throw manejarError(error, "servicioDetalleEvento.getAsistentesPorIdEvento", { id });
			}),
		);
	}

	private getLibrosPorIdEvento(id: number): Observable<LibroResumen[]> {
		const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/libros`;
		console.log(`[ServicioDetalleEvento] getLibrosPorIdEvento - URL: ${url}`);
		return this.http.get<{ data: { libros: LibroResumen[] } }>(url).pipe(
			map(resp => {
				console.log("[ServicioDetalleEvento] getLibrosPorIdEvento - respuesta HTTP:", resp);
				return procesarRespuestaArray<LibroResumen>({ data: resp.data.libros }, "libros");
			}),
			catchError(error => {
				throw manejarError(error, "servicioDetalleEvento.getLibrosPorIdEvento", { id });
			}),
		);
	}

	getDetalleEvento(id: number): Observable<DetalleEventoCompleto> {
		return this.getEventoPorId(id).pipe(
			switchMap(eventoApp => {
				return forkJoin({
					asistentes: this.getAsistentesPorIdEvento(eventoApp.id_evento),
					libros: this.getLibrosPorIdEvento(eventoApp.id_evento), // Ahora devuelve LibroResumen[]
					comentarios: this.getComentariosPorIdEvento(eventoApp.id_evento),
				}).pipe(
					map(({ asistentes, libros, comentarios }) => {
						const evento: EventoResumen = {
							...eventoApp,
							nombreCreador: eventoApp.nombreCreador || "",
							totalAsistentes: asistentes.length,
							categorias: [], // si no tienes categorías
						};

						return {
							evento,
							asistentes,
							libros,
							comentarios,
							errorComentarios: false,
						};
					}),
					catchError(error => {
						return of({
							evento: {
								...eventoApp,
								nombreCreador: "",
								totalAsistentes: 0,
								categorias: [],
							},
							asistentes: [],
							libros: [],
							comentarios: [],
							errorComentarios: true,
						});
					}),
				);
			}),
		);
	}
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, forkJoin } from 'rxjs';
import { environment } from '@environments/environments';
import { DetalleEventoCompleto, LibroResumen } from '@interfaces/modelosApp/modelosApp';
import {
    EventoBD,
    EventoComentario,
    EventoUsuario,
} from '@interfaces/modelosBD/modelosBD';
import { manejarError, AppError } from '@app/shared/utils/error.utils';

@Injectable({ providedIn: 'root' })
export class ServicioDetalleEvento {
    constructor(readonly http: HttpClient) {}

    private getEventoPorId(id: number): Observable<EventoBD> {
        const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}`;
        return this.http.get<EventoBD>(url).pipe(
            map((resp) => {
                if (!resp?.id_evento) {
                    throw new AppError('evento_respuesta_invalida', { id });
                }
                return resp;
            }),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleEvento.getEventoPorId', { id });
            }),
        );
    }

    private getComentariosPorIdEvento(id: number): Observable<EventoComentario[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/comentarios`;
        return this.http.get<EventoComentario[]>(url).pipe(
            map((resp) => (Array.isArray(resp) ? resp : [])),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleEvento.getComentariosPorIdEvento', {
                    id,
                });
            }),
        );
    }

    private getAsistentesPorIdEvento(id: number): Observable<EventoUsuario[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/asistentes`;
        return this.http.get<EventoUsuario[]>(url).pipe(
            map((resp) => (Array.isArray(resp) ? resp : [])),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleEvento.getAsistentesPorIdEvento', { id });
            }),
        );
    }

    private getLibrosPorIdEvento(id: number): Observable<LibroResumen[]> {
        const url = `${environment.apiUrl}:${environment.puerto}/evento/${id}/libros`;
        return this.http.get<LibroResumen[]>(url).pipe(
            map((resp) => (Array.isArray(resp) ? resp : [])),
            catchError((error) => {
                throw manejarError(error, 'servicioDetalleEvento.getLibrosPorIdEvento', { id });
            }),
        );
    }

    getDetalleEvento(id: number): Observable<DetalleEventoCompleto> {
        return this.getEventoPorId(id).pipe(
            switchMap((evento) => {
                return forkJoin({
                    asistentes: this.getAsistentesPorIdEvento(evento.id_evento),
                    libros: this.getLibrosPorIdEvento(evento.id_evento), // Ahora devuelve LibroResumen[]
                    comentarios: this.getComentariosPorIdEvento(evento.id_evento),
                }).pipe(
                    map(({ asistentes, libros, comentarios }) => ({
                        evento,
                        asistentes,
                        libros,
                        comentarios,
                        errorComentarios: false,
                    })),
                    catchError((error) => {
                        return of({
                            evento,
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

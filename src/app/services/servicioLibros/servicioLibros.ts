import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LibroApp, RespuestaCriticas } from '@app/interfaces/modelosApp/modelosApp';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class servicioLibros {
    constructor(private http: HttpClient) {}

    getLibroPorId(id: number): Observable<LibroApp> {
        const url = `${environment.apiUrl}:${environment.puerto}/libros?id_libro=${id}`;
        console.log('URL para obtener libro:', url);
        return this.http.get<LibroApp>(url);
    }

    getCriticasPorIdLibro(id: number): Observable<RespuestaCriticas> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}/criticas`;
        console.log('URL para obtener críticas:', url);
        return this.http.get<RespuestaCriticas>(url);
    }
}

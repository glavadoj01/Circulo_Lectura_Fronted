import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LibroApp } from '@app/interfaces/modelosApp/modelosApp';
import { environment } from '@app/environments/environments';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ObtenerLibro {
    constructor(private http: HttpClient) {}

    getLibroPorId(id: number): Observable<LibroApp> {
        const url = `${environment.apiUrl}${environment.servidor}:${environment.puerto}/libro/${id}`;
        console.log('URL para obtener libro:', url);
        return this.http.get<LibroApp>(url);
    }
}

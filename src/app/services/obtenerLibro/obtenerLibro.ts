import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LibroApp } from '@app/interfaces/modelosApp/modelosApp';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ObtenerLibro {
    constructor(private http: HttpClient) {}

    getLibroPorId(id: number): Observable<LibroApp> {
        // Cambia la URL por la de tu backend real
        return this.http.get<LibroApp>(`/api/libros/${id}`);
    }
}

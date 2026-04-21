// Importaciones node_modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Importaciones propias
import { environment } from '@environments/environments';

@Injectable({
    providedIn: 'root',
})
export class ServicioUsuario {
    constructor(private readonly http: HttpClient) {}

    getUsuarioPorId(id: number, columnas: string = 'nombre_usuario'): Observable<string> {
        const url = `${environment.apiUrl}:${environment.puerto}/usuarios`;
        const filtros = { id_usuario: id };
        console.log('URL para obtener usuario:', url);
        console.log('Filtros para obtener usuario:', filtros);
        return this.http.get<string>(url, {
            params: {
                filtros: JSON.stringify(filtros),
                columnas: columnas,
            },
        });
    }

    static avatarUsuario(idUsuario: number = 1): string {
        return `https://i.pravatar.cc/150?u=usuario-${idUsuario}`;
    }
}

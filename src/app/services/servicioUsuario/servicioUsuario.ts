import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environments';
import { Observable } from 'rxjs';
import { NombreUsuario } from '@app/interfaces/modelosBD/modelosBD';

@Injectable({
    providedIn: 'root',
})
export class ServicioUsuario {
    constructor(private http: HttpClient) {}

    getUsuarioPorId(id: number, columnas: string = 'nombre_usuario'): Observable<NombreUsuario> {
        const url = `${environment.apiUrl}:${environment.puerto}/usuarios`;
        const filtros = { id_usuario: id };
        console.log('URL para obtener usuario:', url);
        console.log('Filtros para obtener usuario:', filtros);
        return this.http.get<NombreUsuario>(url, {
            params: {
                filtros: JSON.stringify(filtros),
                columnas: columnas,
            },
        });
    }
}

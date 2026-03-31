import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LibroApp, RespuestaCriticas } from '@app/interfaces/modelosApp/modelosApp';
import { environment } from '@environments/environments';
import { map, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class servicioLibros {
    constructor(private http: HttpClient) {}

    getLibroPorId(id: number): Observable<LibroApp> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}`;
        console.log('URL para obtener libro:', url);
        return this.http.get<LibroApp>(url).pipe(
            map((libro) => {
                const promedioRaw = libro.calificacionPromedio;
                const calificacionNum =
                    typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);
                return {
                    ...libro,
                    calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
                };
            }),
        );
    }

    getCriticasPorIdLibro(id: number): Observable<RespuestaCriticas> {
        const url = `${environment.apiUrl}:${environment.puerto}/libro/${id}/criticas`;
        console.log('URL para obtener críticas:', url);
        return this.http.get<RespuestaCriticas>(url).pipe(
            map((resp) => {
                const frec = Array.isArray(resp.frecuencias) ? resp.frecuencias : [];
                const f0 = Number(frec[0] ?? 0);
                const f1 = Number(frec[1] ?? 0);
                const f2 = Number(frec[2] ?? 0);
                const f3 = Number(frec[3] ?? 0);
                const f4 = Number(frec[4] ?? 0);
                const f5 = Number(frec[5] ?? 0);

                return {
                    ...resp,
                    frecuencias: [
                        Number.isFinite(f0) ? f0 : 0,
                        Number.isFinite(f1) ? f1 : 0,
                        Number.isFinite(f2) ? f2 : 0,
                        Number.isFinite(f3) ? f3 : 0,
                        Number.isFinite(f4) ? f4 : 0,
                        Number.isFinite(f5) ? f5 : 0,
                    ],
                };
            }),
        );
    }
}

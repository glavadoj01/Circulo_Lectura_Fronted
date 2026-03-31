import { LibroBD, LibroCritica } from '@interfaces/modelosBD/modelosBD';

export interface LibroApp extends LibroBD {
    autores?: Array<{ nombre_autor: string }>; // Lista de autores del libro
    generos?: Array<{ nombre_genero: string }>; // Lista de géneros del libro
    totalResenas?: number; // Total de reseñas del libro
    calificacionPromedio?: number; // Calificación promedio del libro
    id_idioma_original?: number;
    nombre_idioma_original?: string;
}

export interface RespuestaCriticas {
    criticas: LibroCritica[];
    frecuencias: [number, number, number, number, number, number];
}

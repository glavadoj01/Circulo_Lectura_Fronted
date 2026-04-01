// Métodos utilitarios y de mapeo/validación compartidos para libros
// No depende de Angular, solo lógica pura
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import { valorTextoSeguro, validarAutores, validarGeneros } from '@sharedUtils/validation.utils';

export class BaseLibros {
    /** Mapeo y limpieza de datos para un libro */
    static mapLibroApp(libro: LibroApp): LibroApp {
        const promedioRaw = libro.calificacionPromedio;
        const calificacionNum = typeof promedioRaw === 'number' ? promedioRaw : Number(promedioRaw);
        const nombreIdioma = valorTextoSeguro(libro.nombre_idioma_original) || 'N/A';
        const sinopsis = valorTextoSeguro(libro.sinopsis);
        const titulo = valorTextoSeguro(libro.titulo_libro);
        const isbn = valorTextoSeguro(libro.codigo_isbn);
        const paginas = Number.isFinite(Number(libro.paginas)) ? Number(libro.paginas) : 0;

        return {
            ...libro,
            titulo_libro: titulo || 'Título no disponible',
            nombre_idioma_original: nombreIdioma,
            sinopsis: sinopsis || 'Sinopsis no disponible',
            codigo_isbn: isbn || 'N/A',
            paginas,
            calificacionPromedio: Number.isFinite(calificacionNum) ? calificacionNum : 0,
            autores: validarAutores(libro.autores),
            generos: validarGeneros(libro.generos),
            totalResenas: Number.isFinite(Number(libro.totalResenas))
                ? Number(libro.totalResenas)
                : 0,
        };
    }

    /** Normaliza y ordena libros por id */
    static normalizarYOrdenarLibros(libros: LibroApp[]): LibroApp[] {
        const lista = Array.isArray(libros) ? libros : [];
        return lista
            .map((libro) => BaseLibros.mapLibroApp(libro))
            .sort((a, b) => Number(a.id_libro) - Number(b.id_libro));
    }
}

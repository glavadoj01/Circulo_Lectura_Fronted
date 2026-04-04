// Métodos utilitarios y de mapeo/validación compartidos para libros
import { LibroApp } from '@interfaces/modelosApp/modelosApp';
import {
    valorTextoSeguro,
    validarAutores,
    validarGeneros,
    valorNumeroSeguro,
} from '@sharedUtils/validation.utils';

export class BaseLibros {
    /**
     * Mapea un objeto LibroApp, asegurando que sus propiedades estén normalizadas y validadas.
     * @param libro Objeto LibroApp a mapear.
     * @returns Objeto LibroApp mapeado y validado.
     */
    static mapLibroApp(libro: LibroApp): LibroApp {
        const tituloSeguro = valorTextoSeguro(libro.titulo_libro);
        const idiomaOriginalSeguro = valorTextoSeguro(libro.nombre_idioma_original);
        const sinopsisSegura = valorTextoSeguro(libro.sinopsis);
        const isbnSeguro = valorTextoSeguro(libro.codigo_isbn);
        const paginasSeguras = valorNumeroSeguro(libro.paginas);
        const calificacionPromedioSegura = valorNumeroSeguro(libro.calificacionPromedio);
        const totalResenasSeguras = valorNumeroSeguro(libro.totalResenas);

        return {
            ...libro,
            titulo_libro: tituloSeguro != '' ? tituloSeguro : 'Título no disponible',
            nombre_idioma_original: idiomaOriginalSeguro != '' ? idiomaOriginalSeguro : 'N/A',
            sinopsis: sinopsisSegura != '' ? sinopsisSegura : 'Sinopsis no disponible',
            codigo_isbn: isbnSeguro != '' ? isbnSeguro : 'N/A',
            paginas: paginasSeguras > 0 ? paginasSeguras : undefined,
            calificacionPromedio: calificacionPromedioSegura,
            totalResenas: totalResenasSeguras,
            autores: validarAutores(libro.autores),
            generos: validarGeneros(libro.generos),
        };
    }

    /**
     * Normaliza y ordena un array de libros, asegurando que cada libro esté mapeado correctamente.
     * @param libros Array de libros a normalizar y ordenar.
     * @param sort Propiedad por la cual ordenar los libros (por defecto 'id_libro').
     * @returns Array de libros normalizados y ordenados.
     */
    static normalizarYOrdenarLibros(libros: LibroApp[], sort = 'id_libro'): LibroApp[] {
        const lista = Array.isArray(libros) ? libros : [];
        return lista
            .map((libro) => BaseLibros.mapLibroApp(libro))
            .sort((a, b) => {
                const valueA = a[sort as keyof LibroApp] ?? '';
                const valueB = b[sort as keyof LibroApp] ?? '';
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return valueA.localeCompare(valueB);
                }
                return Number(valueA) - Number(valueB);
            });
    }
}

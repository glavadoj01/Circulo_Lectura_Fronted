import { Pipe, PipeTransform } from '@angular/core';
import { valorTextoSeguro } from '@sharedUtils/validation.utils';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';

/**
 * Pipe para obtener el nombre del autor principal de un libro.
 * Si el libro no tiene autores o el primer autor no es válido, devuelve "Autor desconocido".
 * Ejemplo de uso en plantilla: {{ libro | autorPrincipal }}
 * @returns Nombre completo del autor principal o "Autor desconocido" si no es válido.
 */

@Pipe({
    name: 'autorPrincipal',
})
export class AutorPrincipalPipe implements PipeTransform {
    transform(libro: LibroApp | null | undefined): string {
        // Valida que sea un objeto válido
        if (!libro || typeof libro !== 'object') {
            return 'Autor desconocido';
        }

        // Obtiene el primer autor
        const autor =
            (libro as LibroApp)?.autores?.[0]?.nombre_autor +
            ' ' +
            (libro as LibroApp)?.autores?.[0]?.apellido_autor;

        const nombre = valorTextoSeguro(autor);
        return nombre.length > 0 ? nombre : 'Autor desconocido';
    }
}

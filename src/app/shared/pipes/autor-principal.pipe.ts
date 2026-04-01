import { Pipe, PipeTransform } from '@angular/core';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';

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
            (libro as LibroApp)?.autores?.[0]?.nombre_autor + ' ' + 'PLACEHOLDER APELLIDO';

        // Valida que sea string no vacío
        if (typeof autor === 'string' && autor.trim().length > 0) {
            return autor.trim();
        }

        return 'Autor desconocido';
    }
}

import { Component, input, computed } from '@angular/core';
import {
    validarGeneros,
    valorNumeroSeguro,
    valorTextoSeguro,
} from '@app/shared/utils/validation.utils';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';

/**
 * Componente para mostrar los metadatos de un libro, incluyendo información como el título, autor, género, número de páginas, año de publicación, ISBN e idioma original. El componente recibe como input un objeto `LibroApp` que contiene toda la información relevante del libro y una editorial opcional. Utiliza validaciones para asegurar que los datos mostrados sean seguros y presenta la información de manera clara y concisa.
 * El componente calcula textos seguros para cada campo de metadatos, asegurándose de que se muestren valores válidos o 'N/A' en caso de datos faltantes o inválidos. Esto garantiza una experiencia de usuario consistente y evita la presentación de información incorrecta o insegura.
 * El componente también incluye una lógica para formatear la lista de géneros en un formato legible, unificar el formato de páginas y año, y asegurar que el ISBN e idioma se muestren correctamente. En caso de que algún campo no sea válido o esté ausente, se muestra 'N/A' para indicar que la información no está disponible.
 */

@Component({
    selector: 'app-libro-metadatos',
    imports: [],
    templateUrl: './libro-metadatos.html',
})
export class LibroMetadatos {
    libro = input.required<LibroApp>();
    editorial = input<string>('DAW Books'); // WIP

    generosTexto = computed(() => {
        const generos = validarGeneros(this.libro()?.generos);
        const nombres = generos
            .map((g) => valorTextoSeguro(g?.nombre_genero))
            .filter((nombre) => nombre.length > 0);
        return nombres.length > 0 ? nombres.join('; ') : 'N/A';
    });

    paginasTexto = computed(() => {
        const paginas = this.libro()?.paginas;
        return valorNumeroSeguro(paginas) > 0 ? `${paginas} páginas` : 'N/A';
    });

    yearTexto = computed(() => {
        const year = this.libro()?.year_publicacion;
        return valorNumeroSeguro(year) > 0 ? String(year) : 'N/A';
    });

    isbnTexto = computed(() => {
        const isbn = valorTextoSeguro(this.libro()?.codigo_isbn);
        return isbn.length > 0 ? isbn : 'N/A';
    });

    idiomaTexto = computed(() => {
        const idioma = valorTextoSeguro(this.libro()?.nombre_idioma_original);
        return idioma.length > 0 ? idioma : 'N/A';
    });
}

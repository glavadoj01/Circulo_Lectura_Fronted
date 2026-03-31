import { Component, input, computed } from '@angular/core';
import { LibroApp } from '@interfaces/modelosApp/modelosApp';

@Component({
    selector: 'app-libro-metadatos',
    imports: [],
    templateUrl: './libro-metadatos.html',
})
export class LibroMetadatos {
    libro = input.required<LibroApp>();
    editorial = input<string>('DAW Books');

    generosTexto = computed(() => {
        const generos = this.libro()?.generos;
        if (!Array.isArray(generos) || generos.length === 0) {
            return 'N/A';
        }
        return generos
            .filter((g) => g && typeof g.nombre_genero === 'string')
            .map((g) => g.nombre_genero)
            .join('; ') || 'N/A';
    });

    paginasTexto = computed(() => {
        const paginas = this.libro()?.paginas;
        const numSeguro = Number(paginas);
        return Number.isFinite(numSeguro) && numSeguro > 0 ? String(numSeguro) : 'N/A';
    });

    yearTexto = computed(() => {
        const year = this.libro()?.year_publicacion;
        const numSeguro = Number(year);
        return Number.isFinite(numSeguro) && numSeguro > 0 ? String(numSeguro) : 'N/A';
    });

    isbnTexto = computed(() => {
        const isbn = this.libro()?.codigo_isbn;
        return typeof isbn === 'string' && isbn.trim().length > 0 ? isbn.trim() : 'N/A';
    });

    idiomaTexto = computed(() => {
        const idioma = this.libro()?.nombre_idioma_original;
        return typeof idioma === 'string' && idioma.trim().length > 0 ? idioma.trim() : 'N/A';
    });
}

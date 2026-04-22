import { Component, Output, EventEmitter, Signal, effect } from '@angular/core';
import {
    FiltroAutor,
    FiltroGenero,
    ServicioFiltrosLibros,
} from '@services/servicioLibros/servicioFiltrosLibros';

@Component({
    selector: 'app-filtros-libros',
    imports: [],
    templateUrl: './filtros-libros.html',
})
export class FiltrosLibros {
    @Output() filtrosAplicados = new EventEmitter<{
        generos: number[];
        autores: number[];
        years: number[];
        valoraciones: number[];
    }>();
    generos: Signal<FiltroGenero[]>;
    autores: Signal<FiltroAutor[]>;
    years: Signal<number[]>;
    valoraciones: Signal<number[]>;

    selectedGeneros = new Set<number>();
    selectedAutores = new Set<number>();
    selectedYears = new Set<number>();
    selectedValoraciones = new Set<number>();

    constructor(private readonly filtrosSrv: ServicioFiltrosLibros) {
        this.generos = this.filtrosSrv.generos;
        this.autores = this.filtrosSrv.autores;
        this.years = this.filtrosSrv.years;
        this.valoraciones = this.filtrosSrv.valoraciones;

        effect(() => {
            console.log('DEBUG generos():', this.generos());
        });

        this.filtrosSrv.cargarTodosFiltros();
    }

    toggleGenero(id: number) {
        this.selectedGeneros.has(id)
            ? this.selectedGeneros.delete(id)
            : this.selectedGeneros.add(id);
    }
    toggleAutor(id: number) {
        this.selectedAutores.has(id)
            ? this.selectedAutores.delete(id)
            : this.selectedAutores.add(id);
    }
    toggleYear(year: number) {
        this.selectedYears.has(year)
            ? this.selectedYears.delete(year)
            : this.selectedYears.add(year);
    }
    toggleValoracion(val: number) {
        this.selectedValoraciones.has(val)
            ? this.selectedValoraciones.delete(val)
            : this.selectedValoraciones.add(val);
    }

    limpiarFiltros() {
        this.selectedGeneros.clear();
        this.selectedAutores.clear();
        this.selectedYears.clear();
        this.selectedValoraciones.clear();
    }

    aplicarFiltros() {
        this.filtrosAplicados.emit({
            generos: Array.from(this.selectedGeneros),
            autores: Array.from(this.selectedAutores),
            years: Array.from(this.selectedYears),
            valoraciones: Array.from(this.selectedValoraciones),
        });
    }
}

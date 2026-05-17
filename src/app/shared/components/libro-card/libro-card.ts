import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LibroResumen } from "@Interfaces/modelosApp/modelosApp";
import { EstrellasPuntuacion } from "@sharedComponents/estrellas-puntuacion/estrellas-puntuacion";
import { AutorPrincipalPipe } from "@Pipes/autor-principal.pipe";
import { PuntuacionTextoPipe } from "@Pipes/puntuacion-texto.pipe";
import { BaseLibros } from "@Services/servicioLibros/baseLibros";

@Component({
	selector: "app-libro-card",
	imports: [RouterLink, EstrellasPuntuacion, AutorPrincipalPipe, PuntuacionTextoPipe],
	templateUrl: "./libro-card.html",
	styleUrl: "./libro-card.css",
})
export class LibroCard {
	libro = input.required<LibroResumen>();

	portadaLibro(idLibro: number): string {
		return BaseLibros.portadaLibro(idLibro);
	}
}

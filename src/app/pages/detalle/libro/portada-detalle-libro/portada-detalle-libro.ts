import { Component, input } from "@angular/core";
import { BaseLibros } from "@Services/servicioLibros/baseLibros";

@Component({
	selector: "app-portada-detalle-libro",
	imports: [],
	templateUrl: "./portada-detalle-libro.html",
})
export class PortadaDetalleLibro {
	tituloLibro = input.required<string>();
	idLibro = input.required<number>();

	portadaLibro(): string {
		return BaseLibros.portadaLibro(this.idLibro());
	}
}

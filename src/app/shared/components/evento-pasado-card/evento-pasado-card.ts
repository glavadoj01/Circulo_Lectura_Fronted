import { DatePipe, SlicePipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { EventoResumen } from "@Interfaces/modelosApp/modelosApp";
import { HoraPipe } from "@Pipes/hora.pipe";

@Component({
	selector: "app-evento-pasado-card",
	templateUrl: "./evento-pasado-card.html",
	imports: [DatePipe, RouterLink, SlicePipe, HoraPipe],
})
export class EventoPasadoCardComponent {
	@Input() evento!: EventoResumen;
}

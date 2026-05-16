import { DatePipe, SlicePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventoResumen } from '@interfaces/modelosApp/modelosApp';

@Component({
    selector: 'app-evento-pasado-card',
    templateUrl: './evento-pasado-card.html',
    imports: [DatePipe, RouterLink, SlicePipe],
})
export class EventoPasadoCardComponent {
    @Input() evento!: EventoResumen;
}

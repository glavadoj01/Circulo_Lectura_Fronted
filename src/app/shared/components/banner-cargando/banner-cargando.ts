import { Component, input } from '@angular/core';

@Component({
    selector: 'app-banner-cargando',
    imports: [],
    templateUrl: './banner-cargando.html',
})
export class BannerCargando {
    elemento = input.required<string>();
}

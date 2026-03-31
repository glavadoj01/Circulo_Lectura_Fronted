import { Component, input } from '@angular/core';

@Component({
    selector: 'app-banner-error',
    imports: [],
    templateUrl: './banner-error.html',
})
export class BannerError {
    elemento = input.required<string>();
}

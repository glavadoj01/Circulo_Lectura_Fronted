import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Theme {
    private readonly themeSignal = signal<'light' | 'dark'>('dark');
    readonly theme = this.themeSignal.asReadonly();

    constructor() {
        const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
        this.themeSignal.set(saved === 'light' || saved === 'dark' ? saved : 'dark');
        effect(() => {
            document.documentElement.dataset['theme'] = this.themeSignal();
            localStorage.setItem('theme', this.themeSignal());
        });
    }

    toggleTheme(): void {
        this.themeSignal.set(this.themeSignal() === 'dark' ? 'light' : 'dark');
    }
}

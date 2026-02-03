import { Component, ElementRef, ViewChild, HostListener, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Theme } from '../../services/theme';

@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

export class Header {
 //Injección y uso del servicio Tema Claro/Oscuro
  protected themeService = inject(Theme);
  toggleTheme(): void {
      this.themeService.toggleTheme();
  }

  isMenuOpen = signal(false);
// Para almacenar el último elemento enfocado antes de abrir el menú y poder volver al cerrarlo (si no has pulsado enlace)
  lastFocused: HTMLElement | null = null;

  @ViewChild('openBtn') openBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
  @ViewChild('panel') panel!: ElementRef<HTMLElement>;
  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  private getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll(
        'a[routerLink], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => (el as HTMLElement).offsetParent !== null) as HTMLElement[];
  }

  toggleMenu() {
    if (this.isMenuOpen()) this.hideMenu();
    else this.showMenu();
  }

  showMenu() {
    this.lastFocused = document.activeElement as HTMLElement;
    this.isMenuOpen.set(true);

    const panelEl = this.panel.nativeElement;
    const focusables = this.getFocusable(panelEl);

    if (focusables.length) focusables[0].focus();
  }

  hideMenu() {
    this.isMenuOpen.set(false);

    const panelEl = this.panel.nativeElement;

    const handler = (e: TransitionEvent) => {
      if (e.target !== panelEl) return;
      panelEl.removeEventListener('transitionend', handler);
      if (this.lastFocused && typeof this.lastFocused.focus === 'function') {
        this.lastFocused.focus();
      }
    };
    panelEl.addEventListener('transitionend', handler);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (!this.isMenuOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.hideMenu();
      return;
    }
    if (e.key === 'Tab') {
      const panelEl = this.panel.nativeElement;
      const focusables = this.getFocusable(panelEl);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === this.backdrop.nativeElement) this.hideMenu();
  }

  onPanelLinkClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'A') this.hideMenu();
  }

  @HostListener('window:resize')
  onResize() {
    if (this.isMenuOpen() && window.innerWidth >= 768) this.hideMenu();
  }
}
// Importaciones node_modules
import { Component, ElementRef, ViewChild, HostListener, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
// Importaciones propias
import { Theme } from '@services/themeService/theme';
import { SearchBar } from '@sharedComponents/searchBar/searchBar';

/**
 * Componente de encabezado que incluye un menú lateral para navegación y un botón para alternar entre temas claro y oscuro. El menú lateral se puede abrir y cerrar, y se asegura de que el foco se gestione correctamente para accesibilidad. El componente también escucha eventos de teclado para permitir cerrar el menú con la tecla Escape y manejar la navegación con Tab dentro del menú.
 * El menú se cierra automáticamente al hacer clic fuera de él o al seleccionar un enlace dentro del menú. Además, el componente se adapta a cambios en el tamaño de la ventana para cerrar el menú si se redimensiona a un ancho mayor o igual a 768px.
 */

@Component({
    selector: 'app-header',
    imports: [RouterModule, SearchBar],
    templateUrl: './header.html',
})
export class Header {
    //Injección y uso del servicio Tema Claro/Oscuro
    protected themeService = inject(Theme);
    // Estado del menú lateral (abierto/cerrado)
    isMenuOpen = signal(false);
    // Para almacenar el último elemento enfocado antes de abrir el menú y poder volver al cerrarlo (si no has pulsado enlace)
    lastFocused: HTMLElement | null = null;

    @ViewChild('openBtn') openBtn!: ElementRef<HTMLButtonElement>;
    @ViewChild('backdrop') backdrop!: ElementRef<HTMLElement>;
    @ViewChild('panel') panel!: ElementRef<HTMLElement>;
    @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

    /**
     * Obtiene una lista de elementos enfocables dentro de un contenedor dado, filtrando solo aquellos que son visibles (no tienen `display: none` o `visibility: hidden`). Esto se utiliza para gestionar el foco dentro del menú lateral cuando está abierto, permitiendo una navegación accesible con teclado.
     * @param container Elemento contenedor dentro del cual se buscan los elementos enfocables.
     * @returns Array de elementos HTML que son enfocables y visibles dentro del contenedor.
     */
    private getFocusable(container: HTMLElement): HTMLElement[] {
        return Array.from(
            container.querySelectorAll(
                'a[routerLink], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((el) => (el as HTMLElement).offsetParent !== null) as HTMLElement[];
    }

    /**
     * Cambia el tema claro/oscuro utilizando el servicio de tema
     * Se activa al hacer clic en el botón Thema
     */
    toggleTheme(): void {
        this.themeService.toggleTheme();
    }

    /**
     * Alterna el estado del menú lateral entre abierto y cerrado.
     * Si el menú está abierto, se cierra; si está cerrado, se abre.
     * Al abrir el menú, se guarda el elemento que tenía el foco para poder devolverle el foco al cerrar el menú.
     * También se asegura de que el primer elemento enfocables dentro del menú reciba el foco al abrirlo.
     * Se activa al hacer clic en el botón de menú (hamburguesa) o al hacer clic en el fondo del menú (backdrop) para cerrar el menú si se hace clic fuera de él.
     */
    toggleMenu() {
        if (this.isMenuOpen()) this.hideMenu();
        else this.showMenu();
    }

    /**
     * Abre el menú lateral, guarda el elemento que tenía el foco antes de abrirlo y establece el foco en el primer elemento enfocables dentro del menú. Esto permite una navegación accesible con teclado dentro del menú lateral.
     * Se activa al hacer clic en el botón de menú (hamburguesa) para abrir el menú.
     */
    showMenu() {
        this.lastFocused = document.activeElement as HTMLElement;
        this.isMenuOpen.set(true);

        const panelEl = this.panel.nativeElement;
        const focusables = this.getFocusable(panelEl);

        if (focusables.length) focusables[0].focus();
    }

    /**
     * Cierra el menú lateral y devuelve el foco al último elemento que lo tenía antes de abrir el menú, siempre que ese elemento siga siendo enfocable. Esto asegura que los usuarios que navegan con teclado no pierdan su posición de navegación al cerrar el menú.
     * Se activa al hacer clic en el botón de cerrar dentro del menú, al hacer clic en el fondo del menú (backdrop) o al presionar la tecla Escape mientras el menú está abierto.
     */
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

    /**
     * Maneja el evento de clic en el fondo del menú (backdrop) para cerrar el menú si se hace clic fuera de él.
     * @param event Evento de clic que se escucha a nivel de documento. Si el clic se realiza en el fondo del menú (backdrop), se cierra el menú lateral.
     */
    onBackdropClick(event: MouseEvent) {
        if (event.target === this.backdrop.nativeElement) this.hideMenu();
    }

    /**
     * Maneja el evento de clic en los enlaces dentro del menú lateral para cerrar el menú al seleccionar un enlace. Esto asegura que el menú se cierre automáticamente cuando el usuario navegue a una nueva página desde el menú.
     * @param event Evento de clic que se escucha a nivel de documento. Si el clic se realiza en un enlace dentro del menú lateral, se cierra el menú.
     */
    onPanelLinkClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (target && target.tagName === 'A') this.hideMenu();
    }

    /**
     * Maneja el evento de redimensionamiento de la ventana para cerrar el menú lateral si se redimensiona a un ancho mayor o igual a 768px. Esto asegura que el menú lateral se cierre automáticamente en dispositivos de escritorio o cuando se cambia el tamaño de la ventana a un tamaño que no requiere un menú lateral.
     * @param event Evento de redimensionamiento que se escucha a nivel de ventana. Si el ancho de la ventana es mayor o igual a 768px y el menú lateral está abierto, se cierra el menú.
     */
    @HostListener('window:resize')
    onResize() {
        if (this.isMenuOpen() && window.innerWidth >= 768) this.hideMenu();
    }

    /**
     * Maneja los eventos de teclado para la navegación accesible dentro del menú lateral.
     * @param e Evento de teclado que se escucha a nivel de documento. Si el menú está abierto, permite cerrar el menú con la tecla Escape y manejar la navegación con Tab dentro del menú para mantener el foco dentro del menú lateral.
     */
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
}

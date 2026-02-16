# Circulo Lectura - Fronted

Proyecto frontend para el TFC - Círculo de Lectura Local.

## Requisitos mínimos

- **Node.js** >= 22.21.1 (recomendado usar Volta para gestionar versiones)
- **npm** >= 11.6.4
- **Angular CLI** >= 21

## Instalación

1. Instala Node.js y npm (preferentemente usando [Volta](https://volta.sh/)).
2. Instala Angular CLI globalmente si no lo tienes:

    ```bash
    npm install -g @angular/cli@21
     ```

3. Instala las dependencias del proyecto:

 ```bash
 npm install
 ```

## Dependencias principales

- Angular 21
- TailwindCSS y DaisyUI (para estilos)
- RxJS

## Edición de ficheros/credenciales

- Renombra **_environments.ts** a **environments.ts** en `src/app/environments/`.
- Por defecto, la API está configurada en **<http://localhost:3000>**.
- Para acceder desde un dispositivo externo en red local, edita **environments.ts** y reemplaza `localhost` por la IP o dominio local del backend (consulta las indicaciones dentro del propio fichero).

## Uso y Scripts útiles

- `npm start` o `ng serve`: Inicia el servidor de desarrollo en modo local (por defecto en <http://localhost:4200>).
- `ng serve --host 0.0.0.0`: Inicia el servidor permitiendo acceso desde otros dispositivos de la red local (requiere configurar la IP en **environments.ts** y en el backend, archivo **.env**).

## Estructura del proyecto

El código fuente está organizado en las siguientes carpetas y archivos:

- **src/app/**
  - **app.ts, app.routes.ts, app.html, app.config.ts**: Configuración y entrada principal.
  - **environments/_environments.ts**: Configuración de entornos (versión limpia para compartir y editar).
  - **pages/**: Páginas de la aplicación.
    - **auth/**: auth.ts, auth.html, auth.css
    - **bienvenida/**: bienvenida.ts, bienvenida.html
    - **perfil/**: perfil.ts, perfil.html
    - **catalogos/**: libros, listas, eventos (cada uno con sus archivos .ts y .html)
    - **detalle/**: evento, libro, lista (cada uno con sus archivos .ts y .html)
  - **services/**: Servicios de la aplicación.
    - **servicioLibros/servicioLibros.ts**
    - **servicioUsuario/servicioUsuario.ts**
    - **themeService/theme.ts**
  - **shared/components/**: Componentes reutilizables.
    - **comentarioExistente/**: comentarioExistente.ts, comentarioExistente.html
    - **comentarioNuevo/**: comentarioNuevo.ts, comentarioNuevo.html
    - **footer/**: footer.ts, footer.html
    - **header/**: header.ts, header.html
    - **searchBar/**: searchBar.ts, searchBar.html, searchBar.css
  - **interfaces/**: Modelos de datos.
    - **modelosApp/modelosApp.ts**
    - **modelosBD/modelosBD.ts**

## Recursos adicionales

- Para más información sobre Angular CLI, visitar la [documentación oficial](https://angular.dev/tools/cli).
- [Repositorio Principal del TFC](https://github.com/glavadoj01/TrabajoFinGradoDAW)
- [Backend Asociado (NodeJs/Express)](https://github.com/glavadoj01/BackEnd_Circulo_Lectura)

# Circulo Lectura - Fronted

Proyecto frontend para el TFC - Círculo de Lectura Local.

## Requisitos mínimos

- **Node.js** >= 22.21.x (recomendado usar Volta para gestionar versiones)
- **npm** >= 11.6.x
- **Angular CLI** >= 21

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/glavadoj01/Circulo_Lectura_Fronted.git
cd Circulo_Lectura_Fronted
```

### 2. Instalar dependencias

1. Instalar Node.js y npm usando [Volta](https://volta.sh/)

    ```bash
    winget install Volta.Volta  # Instalar Volta
    volta install node@22       # Instalar Node@22
    volta pin node@22           # Fuerza el uso de Node@22 en este directorio
    ```

2. Instalar Angular CLI globalmente:

    ```bash
    volta install @angular/cli@21 # Instalación Global
    ```

3. Instalar las dependencias del proyecto:

    ```bash
    npm install
    ```

### Dependencias principales

- Angular 21
- TailwindCSS y DaisyUI (para estilos)
- RxJS

## 3. Edición de ficheros/credenciales

- Renombra **_environments.ts** a **environments.ts** en `src/environments/`.
- Por defecto, la API está configurada en **<http://localhost:3000>**.
- Para acceder desde un dispositivo externo en red local, edita **environments.ts** y reemplaza `localhost` por la IP o dominio local del backend (consulta las indicaciones dentro del propio fichero).

## 4. Ejecutar el servicio

- `npm start` o `ng serve`: Inicia el servidor de desarrollo en modo local (por defecto en <http://localhost:4200>).
- `ng serve --host 0.0.0.0`: Inicia el servidor permitiendo acceso desde otros dispositivos de la red local (requiere configurar la IP en **environments.ts** y en el backend, archivo **.env**).

### 4.1 Scripts disponibles

```bash
npm start         # Inicia el servidor de desarrollo (ng serve)
npm run build     # Compila la aplicación para producción
npm run watch     # Compila en modo watch (desarrollo)
npm run reinstall # Elimina node_modules y package-lock.json y reinstala dependencias
```

## Estructura del proyecto

El código fuente está organizado en las siguientes carpetas y archivos:

```bash
Circulo_Lectura_Fronted/
├── src/
│   └── app/
│       ├── app.ts, app.routes.ts, app.html, app.config.ts  # Configuración y entrada principal
│       ├── environments/                                   # Configuración de entornos
│       │   ├── environments.ts                                 # Usar para desarrollo local
│       │   └── _environments.ts                                # Versión limpia para compartir y editar
│       ├── pages/                                          # Páginas de la aplicación
│       │   ├── auth/                                           # auth.ts, auth.html, auth.css
│       │   ├── bienvenida/                                     # bienvenida.ts, bienvenida.html
│       │   ├── perfil/                                         # perfil.ts, perfil.html
│       │   ├── catalogos/                                      # libros, listas, eventos (cada uno con sus archivos .ts y .html)
│       │   └── detalle/                                        # evento, libro, lista (cada uno con sus archivos .ts y .html)
│       ├── services/                                       # Servicios de la aplicación
│       │   ├── servicioLibros/
│       │   │   └── servicioLibros.ts
│       │   ├── servicioUsuario/
│       │   │   └── servicioUsuario.ts
│       │   └── themeService/
│       │       └── theme.ts
│       ├── shared/
│       │   └── components/             # Componentes reutilizables
│       │       ├── banner-cargando/
│       │       ├── banner-error/
│       │       ├── comentarioExistente/
│       │       ├── comentarioNuevo/
│       │       ├── estrellas-puntuacion/
│       │       ├── footer/
│       │       ├── header/
│       │       ├── libro-card/
│       │       ├── libro-metadatos/
│       │       ├── paginacion/
│       │       ├── resumen-puntuaciones/
│       │       └── searchBar/
│       └── interfaces/           # Modelos de datos
│           ├── modelosApp/         # Modelos utilizados en la App
│           │   └── modelosApp.ts
│           └── modelosBD/          # Modelos utilizados en la BD
│               └── modelosBD.ts
```

## Recursos adicionales

- Para más información sobre Angular CLI, visitar la [documentación oficial](https://angular.dev/tools/cli).
- [Repositorio Principal del TFC](https://github.com/glavadoj01/TrabajoFinGradoDAW)
- [Backend Asociado (NodeJs/Express)](https://github.com/glavadoj01/BackEnd_Circulo_Lectura)

© Gonzalo Lavado, 2026

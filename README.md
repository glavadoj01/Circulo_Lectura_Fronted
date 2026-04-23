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

- Renombrar **_environments.ts** a **environments.ts** en `src/environments/`.
- Por defecto, la API está configurada en **<http://localhost:3000>**.
- Para acceder desde un dispositivo externo en red local, editar **environments.ts** y reemplazar `localhost` por la IP o dominio local del backend (consultar las indicaciones dentro del propio fichero).

## 4. Ejecutar el servicio

- `npm run start`: Inicia el servidor de desarrollo en modo local (por defecto en <http://localhost:4200>).
- `npm run start:local`: Inicia el servidor permitiendo acceso desde otros dispositivos de la red local (requiere configurar la IP en **environments.ts** y en el backend, archivo **.env**).

### 4.1 Scripts disponibles

```bash
npm run start           # Inicia el servidor en localhost
npm run start:local     # Inicia el servidor en la IP local del dispositivo
npm run reinstall       # Elimina node_modules y package-lock.json y reinstala dependencias
```

## Estructura del proyecto

El código fuente está organizado en las siguientes carpetas y archivos:

```bash
Circulo_Lectura_Fronted/
├── src/
│   ├── environments/                                       # Configuración de entornos
│   │   ├── environments.ts                                     # Usar para desarrollo local
│   │   └── _environments.ts                                    # Versión limpia para compartir y editar
│   └── app/
│       ├── app.ts, app.routes.ts, app.html, app.config.ts  # Configuración y entrada principal
│       │── interfaces/                                     # Modelos de datos
│       │   ├── modelosApp/                                     # Modelos utilizados en la App
│       │   │   └── modelosApp.ts                          
│       │   └── modelosBD/                                      # Modelos utilizados en la BD
│       │       └── modelosBD.ts
│       ├── pages/                                          # Páginas de la aplicación
│       │   ├── auth/                                           # auth.ts, auth.html, auth.css (WIP)
│       │   ├── bienvenida/                                     # bienvenida.ts, bienvenida.html (WIP)
│       │   ├── catalogos/                                      # libros, listas, eventos (cada uno con sus archivos .ts y .html)
│       │   ├── condicionesYTerminos                            # Terminos y condiciones de uso (WIP)
│       │   ├── detalle/                                        # evento, libro, lista (cada uno con sus archivos .ts y .html)
│       │   └── perfilUsuario/                                  # perfil.ts, perfil.html
│       ├── services/                                       # Servicios de la aplicación
│       │   ├── servicioLibros/                                 # Relacionados con Libros
│       │   │   ├── baseLibros.ts                                   # Mapeados y portadas
│       │   │   ├── servicioCatalogoLibros.ts                       # Especializado en LibroResumen para el Catalogo de Libros
│       │   │   ├── servicioDetalleLibros.ts                        # Especializado en el DetalleLibro (criticas, generos, datos completos ...)
│       │   │   └── servicioFiltrosLibro.ts                         # Gestiona la carga de filtros existentes en la BD (Generos, Autores, Años) para el Catalogo
│       │   ├── servicioListas/                                  # Relacionado con Listas 
│       │   │   ├── servicioCatalogoListas.ts                       # Gestiona los servicios del Catalogo de Listas
│       │   │   └── servicioDetalleListas.ts                        # Gestiona los servicios del Detale de una Lista
│       │   ├── servicioUsuario/
│       │   │   └── servicioUsuario.ts                              # Gestiona la obtencion de datos de usuarios (actualmente para comentarios) (WIP)
│       │   └── themeService/
│       │       └── theme.ts                                        # Gestiona el cambio de tema claro/oscuro (WIP - paleta colores claros)
│       └── shared/
│           ├── components/                      # Componentes reutilizables y/o especificos con logica
│           │   ├── banner-cargando/
│           │   ├── banner-error/
│           │   ├── busqueda-listas/                # Gestiona la barra de busquedas del catalogo de listas
│           │   ├── comentarioExistente/
│           │   ├── comentarioNuevo/                # (WIP)
│           │   ├── estrellas-puntuacion/           # Componente que muestra 5 estrellas reyenas según la nota media de un libro (detalles Libro y Lista - Catalogo Libros)
│           │   ├── filtros-libros                  # Componente de Filtros para el Catalogo de Libros
│           │   ├── filtros-listas                  # Componente de Filtros para el Catalogo de Listas
│           │   ├── footer/
│           │   ├── header/
│           │   ├── libro-card/                     # Tarjeta Resumen para Catalogo Libros y Detalle Lista
│           │   ├── libro-metadatos/                # Cabecera de la pagina Detalle Lista
│           │   ├── lista-card/                     # Tarjeta Resumen para Catalogo de Listas
│           │   ├── paginacion/                     # Componente de paginación y navegación en Catalogos
│           │   ├── resumen-puntuaciones/           # Componente con el resumen de puntuaciones del Detalle de un Libro
│           │   ├── searchBar/                      # Barra de Busquedas Global (WIP)
│           │   └── usuario-card                    # Tarjeta del Perfil de Usuario
│           ├── pipes                           # Trasnformaciones Visuales sobre el DOM
│           │   ├── autor-principal.pipe.ts         # Muestra el autor[0] con nombre y apellidos
│           │   ├── puntuacion-normalizada.pipe.ts  # Utiliza el util Normalización 1-5 ¿?
│           │   ├── puntuacion-texto.pipe.ts        # Utiliza el util Normalización 1-5 ¿? Tengo 2?
│           │   ├── saltosLinea.pipe.ts             # Convierte saltos de linea en texto a <br>
│           │   └── tiempo-relativo.pipe.ts         # Muestra un mensaje especifico de tiempo ("hace un momento", "hace 1 hora", "hace 2 horas", ...)
│           └── utils                           # Utilidades/Funciones auxiliares y genericas
│               ├── error.utils.ts                  # Centraliza la recepcion y emision normalizada de errores/claves
│               ├── format.utils.ts                 # Funciones de formateo de datos
│               └── validation.utils.ts             # Validaciones/Saneamiento sobre datos de Inputs y BD

```

## Recursos adicionales

- Para más información sobre Angular CLI, visitar la [documentación oficial](https://angular.dev/tools/cli).
- [Repositorio Principal del TFC](https://github.com/glavadoj01/TrabajoFinGradoDAW)
- [Backend Asociado (NodeJs/Express)](https://github.com/glavadoj01/BackEnd_Circulo_Lectura)

© Gonzalo Lavado, 2026

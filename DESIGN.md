# FindJob Colombia — Guía Maestra del Sistema de Diseño (DESIGN.md)

> **Documento:** Fuente Oficial de Diseño UI/UX y Sistema de Tokens  
> **Proyecto Stitch:** `Remix of FindJob Colombia Marketplace System` (`projects/18273722980660745760`)  
> **Pantalla Maestra:** `00_DesignSystem` (`projects/18273722980660745760/screens/156079cb75f04cb1a0724b295cc842bd`)  
> **Versión:** 2.4.0 — Colombia Multi-City Core  
> **Target:** Web Desktop (1280px Grid) y Responsive Mobile  

---

## 1. Filosofía Visual y Atmósfera de Marca

FindJob Colombia conecta clientes con profesionales de oficios calificados y servicios técnicos para el hogar y empresas de forma rápida, transparente y confiable.

### Principios Fundamentales de Diseño
1. **Confianza Institucional y Seguridad Presencial:**  
   La interfaz comunica solidez mediante el **Azul Royal** (`#1D4ED8`), claridad con el **Verde Esmeralda** (`#059669`) para estados exitosos y transacciones en pesos colombianos (COP), y atención con el **Ámbar** (`#D97706`). La seguridad es prioritaria: todas las citas domiciliarias integran el **Protocolo de Validación PIN de 4 dígitos**.
2. **Claridad Operativa y Transparencia en Precios:**  
   Las tarifas se presentan sin cargos ocultos en pesos colombianos formateados (`$ 120.000 COP`). Los estados de servicio, fechas y tiempos de respuesta son explícitos en tarjetas y tablas.
3. **Ergonomía y Jerarquía:**  
   Espaciado rítmico basado en múltiplos de 8pt (con micro-espaciado de 4pt), tipografía contemporánea y legible (*Plus Jakarta Sans*), y un radio de curvatura suave y consistente de 8px (`rounded-lg`).

---

## 2. Paleta Cromática y Tokens Semánticos

El sistema cromático implementa un modelo basado en tokens con variantes de superficie (`surface-containers`), acentos funcionales y contrastes accesibles WCAG AA/AAA.

### 2.1 Colores Principales de Marca

| Token | Nombre | Hex | Rol Funcional / Uso |
| :--- | :--- | :--- | :--- |
| `primary` | Azul Royal Principal | `#1D4ED8` | Acciones principales, botones CTA, enlaces destacados, acentos activos |
| `on-primary` | Blanco Puro | `#FFFFFF` | Texto e iconos sobre fondos primarios |
| `primary-container` | Azul Royal Contenedor | `#1D4ED8` | Fondos de componentes primarios interactivos |
| `on-primary-container`| Azul Claro | `#CAD3FF` | Texto contrastado sobre contenedor primario |
| `primary-fixed` | Azul Hielo | `#DCE1FF` | Fondos de chips y badges primarios |
| `primary-fixed-dim` | Azul Suave | `#B7C4FF` | Variación atenuada de badge primario |
| `secondary` | Verde Esmeralda | `#059669` | Confirmaciones, pagos exitosos, profesional disponible, calificaciones |
| `on-secondary` | Blanco Puro | `#FFFFFF` | Texto e iconos sobre verde secundario |
| `secondary-container`| Verde Menta Claro | `#D1FAE5` | Fondos de éxito, badges de estado finalizado |
| `on-secondary-container`| Verde Bosque | `#00714E` | Texto sobre badges o tarjetas secundarias |
| `tertiary` | Ámbar / Ocre Cálido | `#D97706` | Alertas, estados pendientes, advertencias de seguridad, estrellas de rating |
| `on-tertiary` | Blanco Puro | `#FFFFFF` | Texto sobre fondo ámbar |
| `tertiary-container` | Ámbar Profundo | `#8D4B00` | Contenedores de alerta enfatizada |
| `on-tertiary-container`| Melocotón Claro | `#FFCBA3` | Texto sobre alertas terciarias |
| `tertiary-fixed` | Amarillo Pastel | `#FEF3C7` | Fondo suave de badges pendientes y notas |

### 2.2 Tokens de Superficie y Neutros

| Token | Nombre | Hex | Rol Funcional / Uso |
| :--- | :--- | :--- | :--- |
| `background` | Canvas Base Suave | `#FAF8FF` | Fondo general de la aplicación |
| `on-background` | Slate Oscuro Texto | `#0F172A` | Color de texto principal para títulos y cuerpo |
| `surface` | Superficie Estándar | `#FAF8FF` | Superficie por defecto para vistas |
| `on-surface` | Slate Oscuro Contenido | `#0F172A` | Texto de alto contraste sobre superficies |
| `surface-variant` | Azul Grisáceo Suave | `#DAE2FD` | Variación para cabeceras y separadores |
| `on-surface-variant`| Gris Pizarra Medio | `#434655` | Texto secundario, subtítulos y metadatos |
| `surface-dim` | Superficie Atenuada | `#D2D9F4` | Fondos de soporte o estado inactivo |
| `surface-bright` | Blanco Canvas | `#FAF8FF` | Refuerzo de brillo en áreas destacadas |
| `surface-container-lowest` | Blanco Puro | `#FFFFFF` | Fondo de cards, modales, popovers e inputs |
| `surface-container-low` | Azul Muy Suave | `#F2F3FF` | Fondo de cards alternas o filas de tabla |
| `surface-container` | Azul Hielo Neutro | `#EAEDFF` | Contenedores secundarios, sidebars |
| `surface-container-high`| Azul Hielo Elevado | `#E2E7FF` | Hover states de contenedores |
| `surface-container-highest`| Azul Pizarra Claro | `#DAE2FD` | Bordes activos y estados seleccionados |
| `inverse-surface` | Slate Noche Oscuro | `#1E293B` | Banners oscuros, tooltips, modales inversos |
| `inverse-on-surface`| Azul Nieve | `#EEF0FF` | Texto sobre superficies oscuras |

### 2.3 Bordes y Delineados

| Token | Hex | Rol Funcional / Uso |
| :--- | :--- | :--- |
| `outline` | `#747686` | Bordes de inputs activos, líneas divisorias con contraste |
| `outline-variant` | `#C4C5D7` | Bordes por defecto de tarjetas, tablas y separadores |

### 2.4 Estados Semánticos de Retroalimentación

| Estado | Token Color | Token Fondo Container | Token Texto Container | Uso en FindJob |
| :--- | :--- | :--- | :--- | :--- |
| **Éxito / Finalizado** | `#059669` | `#D1FAE5` | `#00714E` | Cita finalizada, pago exitoso, cuenta verificada |
| **Alerta / Pendiente** | `#D97706` | `#FEF3C7` | `#8D4B00` | Solicitud pendiente, cita por confirmar, PIN por validar |
| **Error / Peligro** | `#BA1A1A` | `#FFDAD6` | `#93000A` | Cancelaciones, rechazo, fallo en validación, campos erróneos |
| **Informativo** | `#1D4ED8` | `#CAD3FF` | `#0039B5` | Notificaciones del sistema, tips de seguridad, novedades |

---

## 3. Sistema Tipográfico

La tipografía oficial es **Plus Jakarta Sans**, configurada en toda la escala jerárquica con line-heights y letter-spacings optimizados para legibilidad en pantalla.

### 3.1 Familias Tipográficas
* **Primaria / Interfaz:** `Plus Jakarta Sans`, system-ui, -apple-system, sans-serif.
* **Monospace (Cifras COP y Código PIN):** `ui-monospace`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, monospace.
* **Iconografía Oficial:** `Material Symbols Outlined` (Google Fonts).

### 3.2 Escala Tipográfica de Tokens

| Token de Escala | Tamaño (`font-size`) | Altura de Línea (`line-height`) | Interletraje (`letter-spacing`) | Peso (`font-weight`) | Uso Principal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | `48px` (3rem) | `56px` | `-0.025em` | 800 (Extra Bold) | Hero banner en Marketplace |
| `display-mobile` | `32px` (2rem) | `40px` | `-0.02em` | 800 (Extra Bold) | Hero banner en pantallas móviles |
| `headline-lg` | `36px` (2.25rem) | `44px` | `-0.02em` | 700 (Bold) | Títulos de sección principal |
| `headline-lg-mobile` | `28px` (1.75rem) | `36px` | `-0.015em` | 700 (Bold) | Títulos de sección en móvil |
| `headline-md` | `24px` (1.5rem) | `32px` | `-0.015em` | 700 (Bold) | Encabezados de módulos y vistas |
| `headline-sm` | `20px` (1.25rem) | `28px` | `-0.01em` | 600 (Semi Bold) | Títulos de cards modulares |
| `title-md` | `16px` (1rem) | `24px` | `-0.005em` | 600 (Semi Bold) | Subtítulos, labels de modales |
| `body-lg` | `16px` (1rem) | `26px` | `0em` | 400 (Regular) | Párrafos introductorios |
| `body-md` | `14px` (0.875rem) | `22px` | `0em` | 400 (Regular) | Texto de cuerpo principal y descripciones |
| `body-sm` | `12px` (0.75rem) | `18px` | `0.01em` | 400 (Regular) | Metadatos, notas al pie, timestamps |
| `label-lg` | `14px` (0.875rem) | `20px` | `0.01em` | 600 (Semi Bold) | Botones, inputs y tabs |
| `label-md` | `12px` (0.75rem) | `16px` | `0.02em` | 600 (Semi Bold) | Badges de estado y chips de filtro |
| `label-sm` | `10px` (0.625rem) | `14px` | `0.04em` | 700 (Bold) | Micro-etiquetas y badges numéricos |

---

## 4. Ritmo de Espaciado, Bordes y Elevaciones

### 4.1 Escala de Espaciado (Base 8pt)

```
space-xs : 0.25rem (4px)   ── Padding de micro-badges, gaps mínimos
space-sm : 0.5rem  (8px)   ── Padding interno de inputs compactos, botones sm
space-md : 1rem    (16px)  ── Espaciado estándar entre elementos, padding de inputs
space-lg : 1.5rem  (24px)  ── Padding interno de cards y modales
space-xl : 2.5rem  (40px)  ── Separación entre bloques y secciones de vista
```

### 4.2 Márgenes y Gutters de Layout

* `gutter-sm`: `1rem` (16px) — Separación entre columnas en dispositivos móviles.
* `gutter`: `1.5rem` (24px) — Separación estándar entre columnas de grid.
* `gutter-lg`: `2rem` (32px) — Separación amplia para layouts de dashboard.
* `margin-sm`: `1rem` (16px) — Margen exterior en pantallas compactas.
* `margin`: `1.5rem` (24px) — Margen exterior en tabletas y escritorios estándar.
* `margin-lg`: `3rem` (48px) — Margen exterior en monitores panorámicos.
* `max-width`: `1280px` (`max-w-7xl`) — Ancho máximo del contenedor central.

### 4.3 Tokens de Curvatura de Borde (`border-radius`)

* `rounded` (DEFAULT): `0.25rem` (4px) — Micro-badges, bordes de elementos técnicos.
* `rounded-lg`: `0.5rem` (8px) — **Estándar del sistema** (Botones, inputs, chips de estado, selects).
* `rounded-xl`: `0.75rem` (12px) — Tarjetas modulares (`cards`), contenedores de contenido, modales.
* `rounded-2xl`: `1rem` (16px) — Banners destacados, cards hero.
* `rounded-full`: `9999px` — Avatares, badges redondos, pills de filtro rápido.

### 4.4 Sombras y Elevaciones

* `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` — Inputs, selects y botones en reposo.
* `shadow` (Cards Base): `0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.05)` — Tarjetas modulares de servicio y profesional.
* `shadow-md` (Hover): `0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.08)` — Estado hover de tarjetas clickeables.
* `shadow-xl` (Nivel 4 / Modales): `0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)` — Modales de confirmación, diálogos de PIN y alertas.

---

## 5. Los Tres Sistemas de Navegación Obligatorios

El sistema FindJob Colombia implementa 3 modos de navegación estrictamente diferenciados según el rol y contexto del usuario:

### 5.1 Patrón 1: Navegación Marketplace Público (Navbar)
* **Destinatarios:** Clientes visitantes y usuarios sin autenticar explorando servicios.
* **Componentes:**
  * Logotipo FindJob Colombia con badge de ubicación activa (ej. `Bogotá D.C., Chapinero`).
  * Barra de búsqueda predictiva de servicios y profesionales.
  * Enlaces de navegación: `Explorar servicios`, `Cómo funciona`, `Ofrecer mis servicios`.
  * Botones de acción: `Iniciar sesión` (Outline / Ghost) y `Crear cuenta` (Primario azul).

### 5.2 Patrón 2: Navegación Profesional Autenticado (Barra Horizontal Persistente)
* **Destinatarios:** Trabajadores / prestadores de servicios gestionando su actividad.
* **Estructura fija (orden estricto):**
  1. `Mi perfil` (`TRAB_Perfil_Ver`)
  2. `Mis servicios` (`TRAB_MisServicios`)
  3. `Habilidades` (`TRAB_MisHabilidades`)
  4. `Coberturas` (`TRAB_MisCoberturas`)
  5. `Solicitudes` con badge de conteo pendiente en ámbar (ej. `[3]`)
  6. `Mensajes` con badge de no leídos en azul (ej. `[2]`)
  7. Switch de cambio de rol: `Modo Cliente` (`swap_horiz`)
  8. Avatar con badge de verificación (`check`) y nombre/oficio.

### 5.3 Patrón 3: Navegación Administrativa (Admin High-Density System Bar)
* **Destinatarios:** Administradores y operadores de la plataforma.
* **Estructura fija:**
  * Indicador de sistema: `Admin Panel` con icono de escudo (`shield_person`).
  * Enlaces operacionales: `Usuarios`, `Catálogos`, `Solicitudes`, `Citas`, `Seguridad`, `Pagos`, `Configuración`.
  * Widget de estado de plataforma en vivo: `Protocolo de Seguridad: Activo` con badge `Validación PIN En Línea`.

---

## 6. Catálogo Maestro de Componentes UI

### 6.1 Botones y Acciones de Interfaz

* **Botón Primario:**  
  Fondo `#1D4ED8`, texto `#FFFFFF`, hover `#1E40AF`, radius `rounded-lg`, font `label-lg` (600).
* **Botón Secundario (Éxito / Aceptar):**  
  Fondo `#059669`, texto `#FFFFFF`, hover `#047857`, radius `rounded-lg`.
* **Botón de Peligro / Desactivar / Cancelar:**  
  Fondo `#BA1A1A` o borde `#BA1A1A` con texto `#BA1A1A` y hover background `#FFDAD6`.
* **Botón Outline / Ghost:**  
  Fondo transparente, borde `1px solid #C4C5D7`, texto `#0F172A`, hover background `#F2F3FF`.
* **Estado Deshabilitado:**  
  Fondo `#DAE2FD` / `#E2E7FF`, texto `#747686`, cursor `not-allowed`, sin sombra.
* **Estado Procesando (Loading):**  
  Spinner circular de 16px animado (`animate-spin`), texto "Procesando...".

### 6.2 Formularios y Controles Adaptados a Colombia

* **Input de Texto Estándar:**  
  Borde `1px solid #C4C5D7`, fondo `#FFFFFF`, focus `2px solid #1D4ED8` con outline ring `#CAD3FF`, radio `rounded-lg`. Placeholder con nomenclatura urbana colombiana: *"Calle, Carrera, Transversal, Diagonal o Avenida"*.
* **Select de Ubicación Geográfica (Departamento / Ciudad):**  
  Select desplegable con selector jerárquico que incluye principales ciudades colombianas:
  * Bogotá D.C. (Cundinamarca)
  * Medellín (Antioquia)
  * Cali (Valle del Cauca)
  * Barranquilla (Atlántico)
  * Bucaramanga (Santander)
* **Input de Moneda COP (Pesos Colombianos):**  
  Prefijo fijo `$`, valor numérico con separador de miles por puntos, sufijo `COP / servicio` o `COP / hora`.
* **Input de Teléfono Celular:**  
  Prefijo de país `+57`, máscara de 10 dígitos (ej. `300 123 4567`).
* **Input de Identificación Oficial:**  
  Selector de tipo de documento (`CC` - Cédula de Ciudadanía, `CE` - Cédula de Extranjería, `NIT`, `Pasaporte`) seguido del número de documento.
* **Componente de Código PIN de Seguridad:**  
  Contenedor de alto contraste (fondo `#0F172A` o `#EAEDFF`), tipografía monospace destacada en `28px` con 4 dígitos separados (`8 4 9 2`), icono de candado (`lock`) y texto explicativo: *"Proporciona este código de 4 dígitos únicamente cuando el profesional llegue a tu domicilio"*.

### 6.3 Sistema de Badges de Estado (`Status Badges`)

Convención unificada de chips de estado a lo largo del ciclo de vida del servicio:

| Estado del Servicio / Cita | Color de Fondo | Color de Texto | Icono Material | Significado |
| :--- | :--- | :--- | :--- | :--- |
| `Pendiente` | `#FEF3C7` (Ámbar claro) | `#8D4B00` | `schedule` | Solicitud recibida a la espera de respuesta |
| `Aceptada` | `#D1FAE5` (Verde claro) | `#00714E` | `thumb_up` | Profesional aceptó la solicitud |
| `Rechazada` | `#FFDAD6` (Rojo claro) | `#93000A` | `block` | Solicitud declinada por el trabajador |
| `Cancelada` | `#E2E7FF` (Azul neutro) | `#434655` | `cancel` | Cancelada por cliente o profesional |
| `Programada` | `#DCE1FF` (Azul hielo) | `#0039B5` | `calendar_today` | Cita agendada con fecha, hora y PIN generado |
| `En ejecución` | `#FEF3C7` (Ámbar activo) | `#8D4B00` | `play_circle` | Profesional llegó y validó el PIN |
| `Finalizada` | `#D1FAE5` (Verde esmeralda)| `#00714E` | `check_circle` | Trabajo concluido a satisfacción |
| `Activo` | `#D1FAE5` | `#00714E` | `check` | Servicio o usuario activo en plataforma |
| `Inactivo` | `#F2F3FF` | `#747686` | `pause` | Servicio pausado o borrador |

### 6.4 Las 5 Cards Modulares Reutilizables

1. **Card de Servicio (`Service Card`):**  
   * Imagen de portada o banner de categoría con badge de calificación (`4.9 ★ (84)`).  
   * Categoría y subcategoría en `body-sm` (`#747686`).  
   * Título del servicio en `headline-sm` (`#0F172A`).  
   * Ciudad, barrio y zona de cobertura con icono `location_on`.  
   * Tarifa destacada en `title-md` (`$ 120.000 COP`).  
   * Botón de acción: `Solicitar servicio` (Primario).

2. **Card de Profesional (`Professional Card`):**  
   * Avatar con indicador de verificación (`verified`) e iniciales/foto.  
   * Nombre completo y oficio técnico (ej. *"Carlos E. Restrepo — Electricista Residencial"*).  
   * Ciudad/localidad, servicios finalizados con éxito (ej. *"98 servicios"*), calificación promedio.  
   * Tarifa base de desplazamiento/visita (`$ 85.000 COP`).  
   * Botón de acción: `Enviar solicitud` o `Ver perfil`.

3. **Card de Solicitud (`Request Card`):**  
   * Badge de estado actual en esquina superior derecha.  
   * Identificador único (ej. `#SOL-8924`).  
   * Título del servicio solicitado, nombre del cliente/profesional y ubicación.  
   * Presupuesto acordado en COP y estado del chat interno (`chat` activo).  
   * Acciones: `Ver Solicitud`, `Abrir Chat`, o botones de decisión (`Aceptar` / `Rechazar`).

4. **Card de Cita Presencial (`Appointment Card`):**  
   * Fecha destacada en bloque calendario lateral (Mes / Día / Hora).  
   * Profesional asignado y dirección del domicilio con referencia barrial.  
   * **Bloque destacado de PIN:** Código de seguridad de 4 dígitos con advertencia presencial.  
   * Acciones: `Reprogramar`, `Confirmar Llegada` o `Cancelar Cita`.

5. **Card de Métrica / Resumen (`KPI Summary Card`):**  
   * Icono temático en contenedor circular suave (`payments`, `calendar_month`, `star`).  
   * Métrica cuantitativa en `headline-md` (ej. `$ 4.850.000 COP` o `342 Citas`).  
   * Indicador de tendencia en verde/rojo (ej. `+14.2% vs mes anterior`).  
   * Enlace a detalle analítico (`Ver resumen`).

### 6.5 Tablas de Datos (`Data Tables`) y Paginación

* **Cabecera:** Fondo `#F2F3FF`, texto `#434655` en `label-sm` (uppercase / tracking wider), bordes inferiores `#C4C5D7`.
* **Filas:** Altura mínima de 56px, hover state `#EAEDFF`, padding horizontal `1.5rem` (`space-lg`).
* **Columnas obligatorias de trazabilidad:** Código (`CIT-` / `SOL-`), Solicitante, Profesional, Servicio, Ciudad/Barrio, Valor COP, Estado (con badge semántico), Acciones (menú `more_vert` y botón `Ver detalle`).
* **Paginador Integrado:** Indicador *"Mostrando X a Y de Z registros"*, botones de navegación `Anterior` y `Siguiente`, y selector numérico de página activa con fondo primario `#1D4ED8`.

### 6.6 Modales de Confirmación y Protocolo PIN

* **Estructura del Modal:**  
  Overlay oscuro (`rgba(15, 23, 42, 0.6)` con `backdrop-blur-sm`), contenedor centrado con radio `rounded-xl`, sombra `shadow-xl`, padding `2rem` (`space-lg`), y ancho máximo de 540px.
* **Contenido de Confirmación Presencial:**  
  * Cabecera con título e icono temático.  
  * Resumen de datos acordados: Profesional, Fecha y Hora, Dirección completa, Valor acordado COP.  
  * Bloque de advertencia del Protocolo de Seguridad con el código PIN generado.  
  * Botones de acción: `Cancelar` (Ghost) y `Confirmar cita` (Primario con icono `check_circle`).

---

## 7. Configuración de Tokens para Tailwind CSS

La siguiente configuración de Tailwind extiende el tema del proyecto con los tokens extraídos directamente del lienzo y del archivo `00_DesignSystem`:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Tokens Primarios
        "primary": "#1d4ed8",
        "on-primary": "#ffffff",
        "primary-container": "#1d4ed8",
        "on-primary-container": "#cad3ff",
        "primary-fixed": "#dce1ff",
        "primary-fixed-dim": "#b7c4ff",
        "on-primary-fixed": "#001551",
        "on-primary-fixed-variant": "#0039b5",
        "inverse-primary": "#b7c4ff",

        // Tokens Secundarios (Éxito & Pagos COP)
        "secondary": "#059669",
        "on-secondary": "#ffffff",
        "secondary-container": "#d1fae5",
        "on-secondary-container": "#00714e",
        "secondary-fixed": "#85f8c4",
        "secondary-fixed-dim": "#68dba9",
        "on-secondary-fixed": "#002114",
        "on-secondary-fixed-variant": "#005137",

        // Tokens Terciarios (Alertas & Pendientes)
        "tertiary": "#d97706",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#8d4b00",
        "on-tertiary-container": "#ffcba3",
        "tertiary-fixed": "#fef3c7",
        "tertiary-fixed-dim": "#ffb77d",
        "on-tertiary-fixed": "#2f1500",
        "on-tertiary-fixed-variant": "#6e3900",

        // Superficies y Fondos
        "background": "#faf8ff",
        "on-background": "#0f172a",
        "surface": "#faf8ff",
        "on-surface": "#0f172a",
        "surface-variant": "#dae2fd",
        "on-surface-variant": "#434655",
        "surface-dim": "#d2d9f4",
        "surface-bright": "#faf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3ff",
        "surface-container": "#eaedff",
        "surface-container-high": "#e2e7ff",
        "surface-container-highest": "#dae2fd",
        "surface-tint": "#1d4ed8",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#eef0ff",

        // Bordes y Feedback
        "outline": "#747686",
        "outline-variant": "#c4c5d7",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "margin-sm": "1rem",
        "margin": "1.5rem",
        "margin-lg": "3rem",
        "gutter-sm": "1rem",
        "gutter": "1.5rem",
        "gutter-lg": "2rem"
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      },
      fontSize: {
        "display": ["48px", { lineHeight: "56px", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-mobile": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "700" }],
        "headline-sm": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "title-md": ["16px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "26px", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "22px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "400" }],
        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "700" }]
      }
    }
  }
};
```

---

## 8. Reglas de Validación y Calidad para Componentes Nuevos

1. **Cumplimiento de Tokens Únicos:**  
   Queda estrictamente prohibido utilizar colores hexadecimales ad-hoc fuera de la paleta oficial. Todo color debe mapear a un token de Tailwind (`bg-primary`, `text-on-surface`, `border-outline-variant`, etc.).
2. **Formateo Monetario Estricto:**  
   Todo precio o valor económico debe formatearse como moneda local: `$ {VALOR_FORMATEADO} COP` (ej. `$ 150.000 COP`).
3. **Manejo Obligatorio de Estados Vacíos (`Empty States`):**  
   Cualquier listado o vista sin datos debe presentar un contenedor centrado con icono temático, título descriptivo, texto de guía y botón de llamada a la acción (ej. *"No tienes solicitudes activas en este momento"*).
4. **Preservación de Nombres de Pantalla Stitch:**  
   Cualquier referencia a vistas o componentes generados debe mantener la nomenclatura oficial de Stitch (ej. `AUTH_Login`, `USR_MiPerfil`, `SERV_Explorar`, `CITA_MisCitas`, `ADMIN_OP_Pagos`).

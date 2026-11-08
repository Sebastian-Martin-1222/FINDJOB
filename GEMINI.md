# Directrices Principales del Proyecto FindJob (Antigravity) - Plataforma de Comunidades y Marketplace en GCP

## 1. Rol y Objetivos
Actuar como **Arquitecto de Software Full-Stack Senior y Líder Técnico** en Antigravity para diseñar, construir, validar y mantener la plataforma hiper-escalable cumpliendo con las reglas de negocio, diseño UI/UX, seguridad estricta (OWASP) y arquitectura en Google Cloud Platform (GCP).

---

## 2. Fuentes Oficiales del Proyecto e Integración de Conocimiento
Antes de planificar, escribir o modificar cualquier funcionalidad, se deben consultar obligatoriamente las fuentes oficiales según la capa de trabajo:

### Cuadernos de Conocimiento (NotebookLM):
1. **Arquitectura, Backend y GCP:**
   - **Notebook ID:** `be3f2cb1-2419-41e1-b085-457b65b1c957`
   - **Uso:** Topología de microservicios, Cloud Run, integraciones de IA en FastAPI, WebSockets en GKE Autopilot, reglas operativas y buenas prácticas backend.
2. **Diseño y Desarrollo Seguro en Frontend (OWASP):**
   - **Notebook ID:** `6c76341e-a502-4f1f-8c71-361575bebf10`
   - **Uso:** Reglas de diseño seguro en cliente (prevención XSS, políticas CSP, sanitización de inputs/markdown, manejo seguro de sesiones/tokens en cliente, protección CSRF y validación estricta de esquemas antes de enviar payloads).

### Documentación Local y Fuentes Técnicas:
- **Diseño UI/UX y Tokens:** [DESIGN.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FINDJOB/DESIGN.md) (paleta de colores, tipografías, bordes, espaciados y tokens visuales).
- **Enrutamiento y Flujo de Pantallas:** [frontend/ux_mapping.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FINDJOB/frontend/ux_mapping.md) / [ux_mapping.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FINDJOB/ux_mapping.md) (tabla de enrutamiento, flujos de usuario, endpoints y contratos de los servicios web).
- **Arquitectura, Reglas de Negocio y Endpoints:** [FindJob_Parte_II_Arquitectura_BD_Endpoints.txt](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FindJob_Parte_II_Arquitectura_BD_Endpoints.txt) y [ENDPOINTS.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FINDJOB/ENDPOINTS.md).
- **Base de Datos Relacional:** [findjob.sql](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/findjob.sql) (36 tablas en esquema `marketplace`, Cloud SQL for PostgreSQL 17, 3FN).

---

## 3. Jerarquía de Fuentes y Resolución de Inconsistencias
1. Requerimiento explícito de la tarea actual.
2. Contratos de API (`ENDPOINTS.md` / `ux_mapping.md`) y arquitectura (`FindJob_Parte_II_Arquitectura_BD_Endpoints.txt`).
3. Modelo relacional (`findjob.sql`) y directrices de diseño (`DESIGN.md`).
4. Documentación y directrices de NotebookLM (IDs oficiales).
5. Código existente y probado del proyecto.
6. Buenas prácticas generales de ingeniería de software y seguridad OWASP.

---

## 4. Directrices de Implementación Frontend (UI & Seguridad OWASP)
1. **Planificación Previa:** Todo cambio o creación de vistas requiere un plan paso a paso previo para revisión y aprobación.
2. **Inspección Visual (Stitch MCP):** Conectar y leer pantallas oficiales del proyecto Google Stitch: `"FindJob Colombia Marketplace System"` (login, dashboard, comunidades, perfiles, etc.).
3. **Modularidad y Accesibilidad:** Componentes limpios, modulares y 100% responsivos usando Next.js/React, Tailwind CSS y Shadcn UI, respetando los tokens de `DESIGN.md` y contrastes WCAG AA/AAA.
4. **4 Estados Obligatorios por Vista:**
   - *Loading State:* Skeletons de carga proporcionales.
   - *Success State:* Renderizado de datos reales.
   - *Empty State:* Vistas vacías intuitivas con acciones recomendadas.
   - *Error State:* Alertas descriptivas sin exponer stack traces y con botón de reintento.
5. **Seguridad OWASP en Cliente:**
   - Prevención estricta de XSS (sanitización de inputs y markdown con librerías seguras tipo DOMPurify).
   - Cabeceras y políticas CSP restrictivas.
   - Manejo seguro de tokens/sesiones (evitar LocalStorage para tokens sensibles; cookies HttpOnly/SameSite o memoria volatil).
   - Validación exhaustiva de schemas (Zod/TypeScript) antes de transmitir payloads.

---

## 5. Reglas de Negocio, Backend y Persistencia Políglota (GCP)
- **Estructura RESTful (RFC 9110):** Métodos HTTP correctos (`GET`, `POST`, `PATCH`, `DELETE`), segregación estricta entre `/api/v1/` y `/api/v1/admin/`.
- **Lógica de Negocio:** Algoritmo de Atenuación Temporal (Hot Ranking Decay) para recomendaciones; patrón write-behind con batching para cómputo de reputación/karma.
- **Jerarquías en Cloud SQL (PostgreSQL):** Obligatorio el uso de la extensión `ltree` con índices `GiST` para hilos y comentarios anidados, eliminando recursiones costosas.
- **Persistencia Especializada:**
   - **Cloud Firestore:** Notificaciones en tiempo real e historial de mensajería/chat privado.
   - **Cloud Memorystore (Redis):** Estados de presencia, rate limiting y caché de baja latencia.

---

## 6. Seguridad y Prevención de Riesgos de Datos (CRÍTICO)
- **Cero Credenciales:** ESTRICTAMENTE PROHIBIDO almacenar o exponer claves privadas, contraseñas, API keys o tokens JWT en repositorios, código fuente o logs.
- **Secretos Centralizados:** Google Secret Manager para inyección segura en backend; variables de entorno públicas exclusivamente para parámetros no sensibles en frontend.
- **Perímetro de Seguridad:** Integración y compatibilidad con Cloud Armor y reCAPTCHA Enterprise para mitigación de bots, fuerza bruta, DDoS y multicuentas.

---

## 7. Bitácora de Solución de Problemas (Troubleshooting)
Cada incidencia técnica resuelta debe registrarse obligatoriamente en [TROUBLESHOOTING.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FINDJOB/TROUBLESHOOTING.md) siguiendo el estándar:
`[Fecha/Hora] | [Capa: Frontend/Backend] | [Descripción del Error] | [Solución Aplicada]`.

---

## 8. Reporte Final Estándar
Al finalizar cada tarea, entregar resumen estructurado con:
1. **Cambios Realizados**
2. **Reglas y Fuentes Verificadas**
3. **Persistencia y Base de Datos**
4. **Validaciones de Seguridad (OWASP)**
5. **Riesgos y Pendientes**
6. **Entradas de Troubleshooting**


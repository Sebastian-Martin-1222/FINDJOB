# Auditoría e implementación segura de endpoints de FindJob

Actúa como arquitecto de software, desarrollador backend sénior y especialista en ciberseguridad de aplicaciones.

Tu misión es auditar primero la implementación actual del proyecto y, después, completar, corregir o fortalecer incrementalmente los endpoints definidos en `ENDPOINTS.md`.

Debes respetar estrictamente las reglas, restricciones, convenciones, controles de seguridad y decisiones de arquitectura establecidas en `REGLAS_NOTEBOOK.md`.

No asumas que un endpoint está pendiente únicamente porque aparece en `ENDPOINTS.md`. Antes de crear código, comprueba si ya existe una implementación total o parcial reutilizable.

Tu objetivo no es producir la mayor cantidad de código. Tu objetivo es obtener una implementación correcta, segura, verificable, mantenible y sin duplicaciones.

---

## 1. Fuentes obligatorias

Antes de modificar cualquier archivo, lee completamente:

1. `REGLAS_NOTEBOOK.md`.
2. `ENDPOINTS.md`.
3. `README.md`.
4. Los archivos de configuración del proyecto.
5. Los archivos de dependencias.
6. La estructura de directorios.
7. Los routers y controladores.
8. Los servicios y casos de uso.
9. Los repositorios y módulos de persistencia.
10. Los modelos y esquemas.
11. Los middlewares.
12. Las migraciones.
13. `findjob.sql`, si está presente.
14. Las pruebas existentes.
15. Los módulos de autenticación y autorización.
16. La documentación OpenAPI.
17. Los archivos relacionados con contenedores, despliegue y CI/CD.
18. `.env.example` y demás documentación de configuración sin copiar ni revelar secretos.

Durante esta fase no modifiques código.

### Prioridad de las fuentes

Utiliza esta prioridad:

1. Requisitos funcionales explícitos del proyecto.
2. Reglas obligatorias de `REGLAS_NOTEBOOK.md`.
3. Contrato funcional de `ENDPOINTS.md`.
4. Modelo relacional y migraciones vigentes.
5. Arquitectura y convenciones existentes.
6. Pruebas automatizadas.
7. Documentación complementaria.

Si encuentras una contradicción:

- No inventes una solución silenciosamente.
- Registra los archivos y reglas involucrados.
- Explica el impacto funcional, técnico y de seguridad.
- Elige la alternativa más segura y compatible.
- Aplica el menor cambio posible.
- Registra la decisión y su justificación.
- No crees implementaciones paralelas para resolver el conflicto.
- Si puede producir pérdida de datos, romper el contrato público o debilitar la seguridad, repórtala como bloqueo antes de realizar el cambio destructivo.

---

## 2. Verificación obligatoria de endpoints existentes

Antes de crear, modificar o registrar un endpoint, comprueba si ya existe total o parcialmente.

Busca por:

- Método HTTP.
- Ruta.
- Prefijos globales.
- Prefijos de versión.
- Prefijos de routers.
- Routers registrados.
- Controladores.
- Funciones de ruta.
- `operationId`.
- Servicios y casos de uso.
- Repositorios.
- Modelos de entrada y salida.
- Entidades y migraciones.
- Dependencias de autenticación.
- Dependencias de autorización.
- Pruebas.
- Documentación OpenAPI.
- Referencias desde otros módulos.

No concluyas que un endpoint no existe únicamente porque la ruta completa no aparece escrita en un solo archivo.

La ruta final puede estar compuesta por:

```text
prefijo global + versión + prefijo del router + ruta del controlador
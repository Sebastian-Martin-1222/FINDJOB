# REGLAS_NOTEBOOK.md - Arquitectura, desarrollo y seguridad de FindJob

## 0. Propósito y alcance

Este documento consolida las decisiones técnicas, directrices de arquitectura, reglas de desarrollo y estándares de seguridad obligatorios del proyecto FindJob.

Estas reglas deben aplicarse a:

- Endpoints existentes.
- Endpoints nuevos.
- Routers.
- Servicios y casos de uso.
- Repositorios.
- Modelos y esquemas.
- Migraciones.
- Autenticación y autorización.
- Integraciones externas.
- Pruebas.
- Configuración.
- Despliegue.
- Documentación técnica.

`REGLAS_NOTEBOOK.md` es la fuente principal para determinar cómo debe implementarse el sistema.

`ENDPOINTS.md` define el contrato funcional de la API, incluyendo métodos, rutas, operaciones, entradas, salidas, permisos y códigos de estado.

El código fuente representa el estado real de la implementación, pero no reemplaza estas reglas ni el contrato de `ENDPOINTS.md`.

---

## 1. Orden de prioridad de las fuentes

Cuando se implemente, corrija o audite una funcionalidad, se debe utilizar el siguiente orden de prioridad:

1. Requisitos funcionales explícitos del proyecto.
2. Reglas de seguridad establecidas en este documento.
3. Contrato de API definido en `ENDPOINTS.md`.
4. Modelo relacional definido en `findjob.sql` y sus migraciones vigentes.
5. Arquitectura y convenciones existentes en el código.
6. Pruebas automatizadas existentes.
7. Documentación complementaria del proyecto.

Si existe una contradicción entre estas fuentes:

1. No se debe inventar una solución silenciosamente.
2. Se debe identificar la contradicción.
3. Se deben indicar los archivos y reglas involucrados.
4. Se debe evaluar el impacto funcional, técnico y de seguridad.
5. Se debe elegir la alternativa más segura y compatible.
6. Se debe aplicar el menor cambio posible.
7. Se debe documentar la decisión.
8. No se deben mantener implementaciones paralelas para resolver la contradicción.

Si la contradicción puede producir pérdida de datos, romper el contrato público o debilitar un control de seguridad, la operación debe considerarse bloqueada hasta contar con una decisión explícita.

---

## 2. Verificación obligatoria antes de crear endpoints

Antes de crear, modificar o registrar cualquier endpoint, se debe comprobar si ya existe una implementación total o parcial.

### 2.1 Elementos que deben inspeccionarse

La verificación debe revisar como mínimo:

- Método HTTP.
- Ruta declarada.
- Prefijo global.
- Prefijo de versión.
- Prefijo del router.
- Ruta registrada en el controlador.
- Routers incluidos en la aplicación.
- Nombre del controlador o función.
- `operationId`, cuando exista.
- Servicios y casos de uso relacionados.
- Repositorios y consultas relacionadas.
- Modelos de entrada.
- Modelos de salida.
- Entidades de base de datos.
- Migraciones.
- Dependencias de autenticación.
- Dependencias de autorización.
- Pruebas unitarias.
- Pruebas de integración.
- Documentación OpenAPI.

No se debe concluir que un endpoint no existe únicamente porque la ruta completa no aparece escrita en un solo archivo.

La ruta final puede estar compuesta por:

```text
prefijo global + versión + prefijo del router + ruta del controlador
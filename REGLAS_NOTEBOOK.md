# REGLAS_NOTEBOOK.md - Fuentes Oficiales y Estándares de Seguridad para FindJob

Este documento consolida el conocimiento técnico, directrices de arquitectura y estándares de seguridad obligatorios extraídos del NotebookLM oficial del proyecto (`be3f2cb1-2419-41e1-b085-457b65b1c957`).

## 1. Seguridad de APIs y OWASP API Security Top 10 (2023)
* **Mitigación de BOLA (API1):** Nunca confíes únicamente en un rol. La autorización debe validar obligatoriamente la propiedad o participación del recurso (objeto por objeto) en el servidor antes de permitir operaciones de lectura o modificación.
* **Autenticación (API2):** Delegada a Firebase Authentication / Identity Platform[cite: 1]. El backend debe verificar obligatoriamente la integridad, firma, expiración y claims del ID token mediante el Firebase Admin SDK (`auth.verify_id_token()`) en una dependencia centralizada de FastAPI[cite: 1].
* **Control de Propiedades (API3 - Mass Assignment):** Uso estricto de DTOs separados para `Create`, `Update` y `Read`. En los modelos de Pydantic, configurar `model_config = ConfigDict(extra="forbid")` para rechazar campos no declarados y prevenir vulnerabilidades de asignación masiva[cite: 1].
* **Límites y Rate Limiting (API4):** Ningún endpoint de listado (`GET`) puede carecer de paginación máxima (siguiendo directrices de diseño como AIP-158). Protección perimetral mediante Cloud Armor / Rate limiting.
* **Consumo de Terceros (API10):** Al consumir APIs externas (pagos, mapas), implementar *timeouts*, control de reintentos con backoff/jitter y patrones de *circuit breaker* para evitar fallos en cascada.

## 2. Clean Architecture y Estándares de Código
* **Separación de Capas:** El flujo estricto es `router` -> `service/use case` -> `repository`[cite: 1]. Las reglas de negocio residen en los servicios, no en los controladores HTTP ni en las consultas SQL directas[cite: 1].
* **Manejo de Errores:** Las excepciones deben controlarse explícitamente y retornar respuestas estandarizadas (ej. basadas en RFC 9457 - Problem Details). Queda estrictamente prohibido exponer *stack traces*, detalles de bases de datos o rutas internas al cliente.
* **Configuración CORS:** Configurar `CORSMiddleware` de forma explícita (orígenes, métodos y headers concretos). No utilizar comodines (`*`) cuando se admiten credenciales.

## 3. Base de Datos e Integridad
* **Bloqueos y Concurrencia:** Las operaciones críticas (como aceptación de solicitudes, citas o procesamiento de pagos) deben ejecutarse dentro de transacciones atómicas, haciendo uso de mecanismos de control de concurrencia (ej. `SELECT ... FOR UPDATE` en PostgreSQL) cuando el flujo lo requiera.
* **Compatibilidad:** Todo modelo y consulta debe alinearse estrictamente con las restricciones relacionales definidas en `findjob.sql`.
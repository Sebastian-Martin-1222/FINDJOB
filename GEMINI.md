# Directrices y Fuentes Oficiales del Proyecto FindJob

## 1. Fuentes oficiales del proyecto
Antes de implementar o modificar cualquier funcionalidad, se deben utilizar como fuentes oficiales de conocimiento:
- **NotebookLM:** Notebook ID `be3f2cb1-2419-41e1-b085-457b65b1c957` (seguridad, buenas prácticas, arquitectura, criterios técnicos, validaciones).
- **Arquitectura, reglas de negocio y servicios:** [FindJob_Parte_II_Arquitectura_BD_Endpoints.txt](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/FindJob_Parte_II_Arquitectura_BD_Endpoints.txt).
- **Base de datos:** [findjob.sql](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/findjob.sql) (36 tablas en esquema `marketplace`, Cloud SQL for PostgreSQL 17, 3FN).

## 2. Jerarquía de fuentes y resolución de inconsistencias
1. Requerimiento explícito de la tarea actual.
2. `FindJob_Parte_II_Arquitectura_BD_Endpoints.txt`.
3. `findjob.sql`.
4. Documentación y directrices de NotebookLM.
5. Código existente del proyecto.
6. Buenas prácticas generales de ingeniería de software.

## 3. Principios y reglas operativas
- **No inventar reglas de negocio ni esquemas:** Toda lógica y modelo deben derivarse estrictamente de las fuentes oficiales.
- **Seguridad estricta:** Cero credenciales hardcodeadas, tokens o secretos en código o logs; uso de variables de entorno y Secret Manager.
- **Autorización en backend:** Toda operación sensible valida identidad, rol y propiedad del recurso.
- **Base de datos:** Consultas parametrizadas, transacciones multi-entidad, respeto a restricciones NOT NULL, CHECK, UNIQUE y FKs.
- **Manejo de errores:** Errores controlados, sin fugas de stack traces al cliente.
- **Bitácora de fallos:** Registrar problemas resueltos en [TROUBLESHOOTING.md](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/TROUBLESHOOTING.md).
- **Reporte final estándar:** Entregar resumen con Cambios, Reglas verificadas, Base de datos, Validaciones, Riesgos/pendientes y Troubleshooting.

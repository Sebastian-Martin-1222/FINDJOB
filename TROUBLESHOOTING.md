# TROUBLESHOOTING - FindJob

Bitácora obligatoria de incidencias, errores y soluciones técnicas encontradas durante el desarrollo del proyecto FindJob.

---

## Incidencia 001: Incompatibilidad entre Passlib 1.7.4 y Bcrypt 5.0.0

- **Fecha:** 2026-10-16
- **Componentes involucrados:** `app.core.security`, `passlib.context.CryptContext`, `bcrypt >= 4.1.0`.
- **Síntoma / Error:** 
  Al invocar `get_password_hash()` o durante la inicialización de Passlib con `CryptContext(schemes=["bcrypt"])`, se producía una excepción:
  `ValueError: password cannot be longer than 72 bytes, truncate manually if necessary (e.g. my_password[:72])`
  y advertencia por ausencia de `_bcrypt.__about__.__version__`.
- **Causa raíz:** 
  Bcrypt versión >= 4.1 eliminó el submódulo interno `__about__` y comenzó a forzar una validación estricta de 72 bytes en contraseñas sin truncado implícito. La suite de Passlib 1.7.4 ejecuta una detección interna de errores de truncado pasando un payload de 255 bytes, disparando una excepción no capturada.
- **Solución aplicada:** 
  En [app/core/security.py](file:///c:/Users/Sebasti%C3%A1nMartin/Desktop/FindJob/backend/app/core/security.py) se desacopló el hashing de Passlib para implementar el manejo directo y seguro con la biblioteca nativa `bcrypt` (`bcrypt.hashpw` y `bcrypt.checkpw`) asegurando el truncamiento defensivo a 72 bytes en UTF-8 (`password.encode("utf-8")[:72]`). Se validó que tanto el hashing como la verificación y las pruebas unitarias funcionen al 100%.

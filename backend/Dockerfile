# ==============================================================================
# Dockerfile para FindJob Backend (FastAPI)
# Imagen base: Python 3.11 Slim (Linux)
# ==============================================================================

FROM python:3.11-slim

# Evitar escritura de bytecode y habilitar buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Instalar dependencias del sistema mínimas requeridas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar manifiesto de dependencias e instalar
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Crear usuario sin privilegios por seguridad
RUN addgroup --system appgroup && adduser --system --group appuser

# Copiar código de la aplicación
COPY app/ ./app/

# Asignar propiedad al usuario sin privilegios
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

# Ejecutar con Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

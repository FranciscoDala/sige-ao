FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema pro asyncpg compilar
RUN apt-get update && apt-get install -y gcc

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Render injeta a porta via env $PORT. Padrão é 10000
EXPOSE 10000

# Usa a porta do Render. Se não tiver, cai pra 10000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]

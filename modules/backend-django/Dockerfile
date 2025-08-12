FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend-django

# System deps
RUN apt-get update && apt-get install -y python3-dev default-libmysqlclient-dev build-essential pkg-config netcat-traditional && rm -rf /var/lib/apt/lists/*

# Requirements (generated minimal)
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy source code
COPY . /app/backend-django

# Handler the command for django project dependencies
RUN chmod +x /app/backend-django/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/backend-django/entrypoint.sh"]

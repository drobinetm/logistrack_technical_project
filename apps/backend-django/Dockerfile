FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend-django

# System deps
RUN apt-get update && apt-get install -y python3-dev default-libmysqlclient-dev build-essential pkg-config && rm -rf /var/lib/apt/lists/*

# Requirements (generated minimal)
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy source code
COPY . /app/backend-django

EXPOSE 8000

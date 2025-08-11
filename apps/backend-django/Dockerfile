FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y python3-dev default-libmysqlclient-dev build-essential && rm -rf /var/lib/apt/lists/*

# Requirements (generated minimal)
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# App code will be mounted as a volume for dev
EXPOSE 8000

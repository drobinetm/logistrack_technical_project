# 📘 LogisTrack: Tarea Técnica (Symfony + Django + Angular)


> [!NOTE] 
> Por cuestiones de costumbre, el programador creó los mensajes de git, las entidades, las propiedades JSON y el código de las clases y funcionalidades que participan en el proyecto en inglés. Disculpen si esto puede ocasionar algún problema en su decisión Gracias.


## 🔗 Links a Documentación

* 📄 [DOCUMENTACION.md](./DOCUMENTACION.md) → Documentación detallada de rutas, casos de uso y ejemplos.
* 🤖 [IA INTERACCIONES.md](./IA_INTERACCIONES.md) → Guía de interacciones con agentes de IA en el proyecto.

---

## 📑 Índice

1. [Introducción](#-introducción)
2. [Resumen de Requerimientos Funcionales (5 días)](#-resumen-de-requerimientos-funcionales-5-días)
3. [Instrucciones de instalación y ejecución](#-instrucciones-de-instalación-y-ejecución)
4. [Arquitectura General](#-arquitectura-general)
5. [Rutas de la API REST](#rutas-de-la-api-rest)
6. [Persistencia y Diseño de Base de Datos](#-persistencia-y-diseño-de-base-de-datos)
   * [Modelo Relacional](#-modelo-relacional)
   * [Migraciones](#-migraciones-de-datos)
   * [Diagrama ERD](#-diagrama-entidad-relación-del-proyecto-erd)

---

## 📖 Introducción

Este proyecto de microservicios forma parte del ecosistema de la plataforma **LogisTrack**.
Su propósito principal es brindar una alternativa eficiente para comunicar una aplicación con Dashboard Informativo con un servicio API REST que es actualizado mediante eventos desde un servidor **Redis**.

---

## 📌 Resumen de Requerimientos Funcionales (5 días)

En la parte de [DOCUMENTACION.md](./DOCUMENTACION.md) del proyecto, se explican al detalle cada uno de los requerimientos levantados para desarrollar el proyecto con calidad y de forma profesional.

1. **(Día 1)** – Infraestructura + Base de Datos
2. **(Día 2)** – Symfony (eventos en Redis)
3. **(Día 3)** – Django (microservicio + API + validaciones)
4. **(Día 4)** – Angular (UI + Servicios + Visualización)
5. **(Día 5)** – Integración Final + Pruebas + Documentación

---

## ⚙️ Instrucciones de instalación y ejecución

### 🔧 Prerrequisitos

* Lenguajes\Frameworks
    * (Python 3.10+) - Django 5.2.5 - Django Rest Framework
    * (PHP 8.2+) - Symfony 7.3
    * (TypeScript - Node.js v20.11.1 o superior) - Angular 20
* Docker & Docker Compose (Correr por Docker)
* Base de datos: MySQL
* Servicio Redis

### ▶️ Pasos importantes para las variables de entorno

#### ▶️ Django

> [!IMPORTANT]
> Copiar esta configuración a su env.dev.
> Reemplazar las conexiones a la BD por sus datos de conexión

```bash
DEBUG=True

## database config
DJANGO_SETTINGS_MODULE=app.settings

# python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_SECRET_KEY="secret_key"
DB_HOST=localhost
DB_PORT=3306
DB_NAME=logis_track_django
DB_USER=root
DB_PASSWORD=123

### redis service
REDIS_URL="redis://localhost:6379/0"
REDIS_STREAM="0"
REDIS_CONSUMER="worker-1"
REDIS_GROUP="main_group"
```

#### ▶️ Symfony

> [!IMPORTANT]
> Importante: Copiar esta configuración a su env.dev
> Reemplazar las conexiones a la BD por sus datos de conexión

```bash
###> symfony/framework-bundle ###
APP_SECRET=4454a90cc6edf99d735834b4502ab9fc
###< symfony/framework-bundle ###

###> doctrine/doctrine-bundle ###
DATABASE_URL="mysql://root:123@localhost:3306/logis_track_symfony?charset=utf8mb4"
###< doctrine/doctrine-bundle ###

### redis service
REDIS_URL="redis://localhost:6379/0"
REDIS_STREAM="events_stream"
REDIS_CONSUMER="worker-1"
REDIS_GROUP="main_group"
``` 

### ▶️ Pasos de instalación (Docker)

```bash
docker-compose up --build
```

* El servicio estará disponible en: 👉 `http://localhost:4200` 

### 🚀 Pasos de instalación (Manual)

#### ▶️ Django

> Importante: Debe tener instalado python 3.10+ en su escritorio

```bash
# Clonar el repositorio
git clone https://github.com/drobinetm/logistrack_technical_project.git
cd logistrack_technical_project/modules/backend-django

# Crear entorno virtual (Python ejemplo)
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# NOTA: Configurar en las variables de entorno la conexión a DB

# Aplicar migraciones
python manage.py migrate

# Cargar datos iniciales
python manage.py loaddata service_app/fixtures/block_data.json
python manage.py loaddata service_app/fixtures/driver_data.json
python manage.py loaddata service_app/fixtures/product_data.json
python manage.py loaddata service_app/fixtures/order_data.json

# Correr las pruebas
python -m pytest service_app/tests

# Ejecutar el servidor
python manage.py runserver
```

#### ▶️ Symfony

> Importante: Debe tener instalado PHP en su escritorio

```bash
# Clonar el repositorio
# NOTA: Si lo hizo en el paso anterior, no es necesario volver hacerlo
git clone https://github.com/drobinetm/logistrack_technical_project.git
cd logistrack_technical_project/modules/backend-symfony

# Instalar dependencias
composer install

# NOTA: Configurar en las variables de entorno la conexión a DB

# Aplicar migraciones
php bin/console doctrine:migrations:migrate

# Cargar datos iniciales
php bin/console doctrine:fixtures:load -n
```

#### ▶️ Angular

> Importante: Debe tener instalado Node.js en su escritorio

```bash
# Clonar el repositorio
# NOTA: Si lo hizo en el paso anterior, no es necesario volver hacerlo
git clone https://github.com/drobinetm/logistrack_technical_project.git
cd logistrack_technical_project/modules/frontend-angular

# Instalar dependencias
nvm use 22 # Opcional: Si tiene instalado nvm, sino debe tener instalado Node.js v22.11.1+
npm install

# Ejecutar el servidor
npm run start
```

---

## 🏗️ Arquitectura General

![Arquitectura](resources/architecture%20diagram.png)

El proyecto sigue una arquitectura modular desarrollada por capas de microservicios.
Cada microservicio del backend tiene sus datos persistentes en una base de datos (BD) de MySQL.
Para la actualización de la información entre los microservicios del backend se usa un mecannismo
de eventos mediante streams de data (Pub/Sub) a través de Redis.

* **API RESTful** expuesta mediante un microservicio en backend Django (Marco de Trabajo de Python).
* **Publisher Events** (Publicador de Eventos) Microservicio responsable: backend Symfony (Marco de Trabajo de PHP).
* **Persistencia** en base de datos relacional (MySQL).
* **Separación de capas**: Cada microservicio tiene sus propias clases, modelos, servicios y capas de repositorios.
* **Comunicación** entre microservicios vía Redis Streams.


---

## 🔹Rutas de la API REST

* `[GET] /api/distribucion/bloques/` →  Listar los bloques distribuidos
* `[GET] /api/docs/` →  Swagger/Docs de la API REST
* `[GET] /api/dashboard/` → Dashboard
* `[GET] /api/despacho/` → Mostrar órdenes enviadas desde PYMEs a Centros de Distribución (CD)
* `[GET] /api/preparacion/` → Visualizar las órdenes preparadas, con productos y estado de peso/volumen.
* `[GET] /api/envio/` → Órdenes listas para salir, asociadas a transportistas o vehículos.
* `[GET] /api/recepcion/` → Recepción de bolsas/órdenes en el CD. Mostrar si hay incidencias
* `[GET] /api/consolidacion/` → Agrupación de órdenes por chofer/bloque. Estado de completitud
* `[GET] /api/distribucion/` → Entregas realizadas, pendientes y rechazadas con confirmaciones.

> [!NOTE] Puede encontrar la colección del Postman en la carpeta **resources** del proyecto.

---

## 🗄️ Persistencia y Diseño de Base de Datos

### 🔹 Modelo Relacional

El sistema implementa un modelo basado en las siguientes entidades principales:

* **order** (maneja la información asociada a una orden)
* **product** (productos asociados a una orden)
* **driver** (choferes asociados a una orden dentro de un bloque)
* **block** (maneja la información de los bloques que se crean para entregar las órdenes)
* **redis_outbox** (tabla que maneja la persistencia de los eventos en redis permitiendo idempotencia con los streams de datos)

### 🔹 Migraciones de Datos

> Las migraciones para cada uno de los microservicios son explicadas en la sección de instalación de los microservicios. 👉 [Instrucciones de instalación y ejecución](#-instrucciones-de-instalación-y-ejecución)

### 🔹 Diagrama Entidad Relación del Proyecto (ERD)

![ERD](resources/class%20diagram.png)
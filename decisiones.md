# Decisiones del Proyecto – TP 02: Introducción a Docker

## Tarea 1 – App elegida y repo de entrega
- **Aplicación**: API de cursos en **Go** (backend del trabajo final `FINALarqsot_I`), compilada y ejecutada en contenedor.
- **Repositorio de entrega**: `vsponton/TP02-Docker`.
- **Entorno**: Docker Desktop + PowerShell.
- **Docker Hub (namespace)**: `2146222`.

---

## Tarea 2 – Imagen personalizada
- **Dockerfile multi-stage** (en `arqui/backend/Dockerfile`):
  - **Build**: `golang:1.23-alpine` + `git`.
    - `go mod init backend` (si no existe) + `go mod tidy`
    - `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .`
  - **Runtime**: `alpine:3.20`
    - Copia binario `/app/server`
    - `EXPOSE 8080` (la app corre con `engine.Run(":8080")`)
- **Motivos**: multi-stage reduce tamaño; Go 1.23 evita problemas de toolchain; Alpine deja imagen final chica.

---

## Tarea 3 – Publicación en Docker Hub
- Imágenes publicadas:
  - `2146222/tp02-arqui-backend:dev`
  - **`2146222/tp02-arqui-backend:v1.0`** (estable, usada por QA y PROD)
- Convención de tags: `dev` para iterar, `vX.Y` como releases **inmutables**.

---

## Tarea 4 – Base de datos en contenedor
- **MySQL 8** (imagen oficial) como servicio `database`.
- **Persistencia**: volumen `mysql_data` → `/var/lib/mysql`.
- **Init**: `arqui/database-init/init.sql` crea `arqsoft1_qa` y `arqsoft1_prod`.
- **Compatibilidad con el código**: el backend espera **`arqsoft1`** (`root/root`, host `database`), por eso se creó también esa base.
- **Chequeo de persistencia**: tabla `tp_check` con fila `persistencia-ok`; el dato persiste tras reiniciar MySQL.

---

## Tarea 5 – QA y PROD con la misma imagen
- **Misma imagen**: **`2146222/tp02-arqui-backend:v1.0`** en `app_qa` y `app_prod`.
- Diferencias por entorno solo en **puertos del host**:
  - QA: `3000 -> 8080`
  - PROD: `3001 -> 8080`
- Nota: el DSN está en el código (`database:3306`, `root/root`), por eso ambos apuntan al mismo servicio `database`.

---

## Tarea 6 – Entorno reproducible con Docker Compose
**Servicios**:
- `database` (MySQL 8) con **healthcheck** y volumen `mysql_data`.
- `app_qa` y `app_prod` con imagen **`2146222/tp02-arqui-backend:v1.0`** y `depends_on` esperando a MySQL sano.

**Reproducibilidad**:
- Un solo comando: `docker compose up -d --pull always`
- Healthcheck evita race conditions.
- Volumen garantiza datos entre reinicios.

---

## Tarea 7 – Release etiquetada
- **v1.0**: primera estable usada por QA/PROD.
- Política: no sobrescribir tags estables; nuevas mejoras → nueva tag.

---

## Evidencias de funcionamiento

**Servicios arriba**
```bash
docker compose ps
# app_qa   -> 0.0.0.0:3000->8080/tcp
# app_prod -> 0.0.0.0:3001->8080/tcp
# database -> healthy (MySQL 8)

---

***Problemas encontrados y soluciones***

-Tags con mayúsculas → Docker exige minúsculas. Se renombró a 2146222/tp02-arqui-backend.

-Falta de base arqsoft1 → el backend la requiere. Se creó además de arqsoft1_qa/_prod.

-Sin /health público → se validó liveness usando 401 en /courses sin token.

-Token con claims inválidos (login devuelve id_user:0) → no se usó para flujos protegidos; solo se validó middleware con 401.

-DNS al ejecutar contenedores sueltos → correr todo con Compose (servicio database) o usar la red del proyecto.

---

Cómo reproducir

# Requisito: Docker Desktop
git clone https://github.com/vsponton/TP02-Docker.git
cd TP02-Docker

# Levantar todo
docker compose up -d --pull always

# Comprobaciones rápidas
curl -i http://localhost:3000/courses
curl -i http://localhost:3001/courses
docker inspect $(docker compose ps -q app_qa)   --format '{{.Config.Image}}'
docker inspect $(docker compose ps -q app_prod) --format '{{.Config.Image}}'
docker compose exec database mysql -uroot -proot -e "USE arqsoft1; SELECT * FROM tp_check;" || true


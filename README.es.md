# Task API

API REST para gestión de tareas con autenticación JWT, cobertura de tests completa y CI/CD automatizado. Construida con Node.js, Express y SQLite.

## Stack
Node.js · Express · SQLite (better-sqlite3) · JWT · bcryptjs · Docker · GitHub Actions

## Instalación
```bash
npm install
cp .env.example .env   # configura tu JWT_SECRET
npm start              # http://localhost:3000
```

## Tests
```bash
npm test   # ejecuta 18 tests de integración (Auth + CRUD de Tareas)
```

## Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión y obtener token |

### Tareas (requieren `Authorization: Bearer <token>`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`    | `/api/tasks` | Listar tareas (filtros: `?status=pending&priority=high`) |
| `POST`   | `/api/tasks` | Crear tarea |
| `GET`    | `/api/tasks/:id` | Obtener tarea |
| `PUT`    | `/api/tasks/:id` | Actualizar tarea |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea |

### Health
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check — devuelve `{ status: "ok" }` |

## Campos de tarea
```json
{
  "title": "Desplegar a producción",
  "description": "Texto opcional más largo",
  "status": "pending | in_progress | done",
  "priority": "low | medium | high",
  "due_date": "2026-07-01"
}
```

## Docker
```bash
docker build -t task-api .
docker run -p 3000:3000 -e JWT_SECRET=tu_secreto task-api
```

## CI/CD
Pipeline de GitHub Actions en cada push:
1. Instala dependencias y ejecuta los 18 tests de integración
2. Construye la imagen Docker
3. Smoke-test del contenedor (`GET /health`)

## Historial de versiones

**v0.1.1** — 2026-06-24
- Seguridad: `JWT_SECRET` ahora es obligatoria al arrancar — el servidor aborta si no está definida
- Seguridad: rate limiting en `/register` (10 req/15 min) y `/login` (15 req/15 min) por IP
- Fix: `PUT /:id` devuelve 400 con datos inválidos en lugar de caer con error 500

**v0.1.0** — 2026-05-01
- Publicación inicial: autenticación JWT, CRUD completo de tareas, 18 tests de integración, Docker, CI/CD con GitHub Actions

## Ejemplo
```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"mail@example.com","password":"secret123"}'

# Crear una tarea
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Terminar el proyecto","priority":"high","due_date":"2026-07-01"}'
```

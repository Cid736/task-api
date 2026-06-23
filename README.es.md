# Task API

API REST para gestion de tareas con autenticacion JWT. Construida con Node.js, Express y SQLite.

## Stack
Node.js · Express · SQLite (better-sqlite3) · JWT · bcryptjs

## Instalacion
```bash
npm install
cp .env.example .env   # configura tu JWT_SECRET
npm start
```

## Endpoints

### Autenticacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesion y obtener token |

### Tareas (requieren `Authorization: Bearer <token>`)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET`  | `/api/tasks` | Listar tareas (filtros: `?status=pending&priority=high`) |
| `POST` | `/api/tasks` | Crear tarea |
| `GET`  | `/api/tasks/:id` | Obtener tarea |
| `PUT`  | `/api/tasks/:id` | Actualizar tarea |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea |

## Campos de tarea
```json
{
  "title": "Desplegar a produccion",
  "description": "Texto opcional mas largo",
  "status": "pending | in_progress | done",
  "priority": "low | medium | high",
  "due_date": "2026-07-01"
}
```

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

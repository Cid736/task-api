<p align="center">
  <a href="#english">🇬🇧 English</a> &nbsp;·&nbsp; <a href="#español">🇪🇸 Español</a>
</p>

---

<a name="english"></a>

# Task API

REST API for task management with JWT authentication, full test coverage and automated CI/CD. Built with Node.js, Express and SQLite.

## Stack
Node.js · Express · SQLite (better-sqlite3) · JWT · bcryptjs · Docker · GitHub Actions

## Setup
```bash
npm install
cp .env.example .env   # set your JWT_SECRET
npm start              # http://localhost:3000
```

## Tests
```bash
npm test   # runs 18 integration tests (Auth + Tasks CRUD)
```

## Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login and get token |

### Tasks (require `Authorization: Bearer <token>`)
| Method | Route | Description |
|--------|-------|-------------|
| `GET`    | `/api/tasks` | List tasks (filter: `?status=pending&priority=high`) |
| `POST`   | `/api/tasks` | Create task |
| `GET`    | `/api/tasks/:id` | Get task |
| `PUT`    | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

### Health
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |

## Task fields
```json
{
  "title": "Deploy to production",
  "description": "Optional longer text",
  "status": "pending | in_progress | done",
  "priority": "low | medium | high",
  "due_date": "2026-07-01"
}
```

## Docker
```bash
docker build -t task-api .
docker run -p 3000:3000 -e JWT_SECRET=your_secret task-api
```

## CI/CD
GitHub Actions pipeline on every push:
1. Install dependencies and run the 18 integration tests
2. Build the Docker image
3. Smoke-test the container (`GET /health`)

## Example
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"mail@example.com","password":"secret123"}'

# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish the project","priority":"high","due_date":"2026-07-01"}'
```

## Changelog

**v0.1.1** — 2026-06-24
- Security: `JWT_SECRET` now required at startup — server exits immediately if not defined
- Security: rate limiting on `/register` (10 req/15 min) and `/login` (15 req/15 min) per IP
- Fix: `PUT /:id` now returns 400 on invalid data instead of crashing with 500

**v0.1.0** — 2026-05-01
- Initial release: JWT auth, full task CRUD, 18 integration tests, Docker, GitHub Actions CI/CD

## Security

Automated security reviews are powered by [Claude](https://claude.ai) (Anthropic AI) and run on every significant change to detect vulnerabilities, insecure patterns and dependency risks. Findings are tracked in [`BUGLOG.md`](BUGLOG.md).

**Last review:** 2026-06-28 — 4 issues found and patched (0 critical, 0 high, 2 medium, 2 low). See details below.

### Findings — 2026-06-28

| # | Severity | File | Line(s) | Description | Status |
|---|----------|------|---------|-------------|--------|
| 1 | MEDIA | `routes/auth.js` | 9-24 | Custom in-memory rate limiter had memory-leak risk (unbounded Map growth) and could be bypassed on window reset. `express-rate-limit` (already a declared dependency) was unused. | Fixed |
| 2 | MEDIA | `routes/tasks.js` | 7-39 | No input validation on task fields (`title`, `description`, `due_date`, `priority`, `status`) or on query-string filter params — allowed arbitrary-length payloads and invalid enum values to reach the database silently. | Fixed |
| 3 | BAJA | `middleware/auth.js` | 8 | `jwt.verify` did not explicitly restrict the accepted algorithm list. Although `jsonwebtoken ≥9` blocks `alg:none` by default, best practice is to pin `algorithms: ['HS256']`. | Fixed |
| 4 | BAJA | `Dockerfile` | — | Container ran as root. Added a dedicated non-root `appuser` to limit blast radius if the process is compromised. | Fixed |

### Changes applied

- **`routes/auth.js`** — Removed the custom `_hits` Map rate limiter and replaced both `rateLimit(10)` / `rateLimit(15)` calls with dedicated `express-rate-limit` instances (`registerLimiter` / `loginLimiter`), which are properly bounded, respect `RateLimit-*` standard headers, and reset the window correctly.
- **`routes/tasks.js`** — Added `VALID_STATUS` / `VALID_PRIORITY` sets; added a `parseId()` helper that validates route params as positive integers (all four task routes now use it); added length and type guards on `title` (≤ 255), `description` (≤ 10 000), `due_date` (regex `YYYY-MM-DD`), `status`, and `priority` for both POST and PUT; query-string filters for GET are now whitelisted against the same sets.
- **`middleware/auth.js`** — Added `{ algorithms: ['HS256'] }` option to `jwt.verify`.
- **`Dockerfile`** — Added `addgroup`/`adduser` for a non-root `appuser` and `USER appuser` directive before `EXPOSE`.

### Dependencies — 2026-06-28

All production dependencies (`bcryptjs ^2.4.3`, `better-sqlite3 ^9.4.3`, `dotenv ^16.4.1`, `express ^4.18.2`, `express-rate-limit ^8.5.2`, `helmet ^8.2.0`, `jsonwebtoken ^9.0.2`) have no known high or critical CVEs as of this review date.

Found a vulnerability? Open an issue or contact directly.

---

<a name="español"></a>

# Task API

API REST de gestión de tareas con autenticación JWT, cobertura de tests completa y CI/CD automatizado. Construida con Node.js, Express y SQLite.

## Stack
Node.js · Express · SQLite (better-sqlite3) · JWT · bcryptjs · Docker · GitHub Actions

## Instalación
```bash
npm install
cp .env.example .env   # define tu JWT_SECRET
npm start              # http://localhost:3000
```

## Tests
```bash
npm test   # ejecuta 18 tests de integración (Auth + CRUD de tareas)
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
| `GET`    | `/api/tasks` | Listar tareas (filtro: `?status=pending&priority=high`) |
| `POST`   | `/api/tasks` | Crear tarea |
| `GET`    | `/api/tasks/:id` | Obtener tarea |
| `PUT`    | `/api/tasks/:id` | Actualizar tarea |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea |

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

## Seguridad

Las revisiones de seguridad automatizadas utilizan [Claude](https://claude.ai) (Anthropic AI) y se ejecutan en cada cambio significativo para detectar vulnerabilidades, patrones inseguros y riesgos en dependencias. Los hallazgos se registran en [`BUGLOG.md`](BUGLOG.md).

**Última revisión:** 2026-06-28 — 4 vulnerabilidades encontradas y parcheadas (0 críticas, 0 altas, 2 medias, 2 bajas). Ver detalles en la sección Security del README en inglés.

¿Encontraste una vulnerabilidad? Abre un issue o contacta directamente.
## Licencia

MIT

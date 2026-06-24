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

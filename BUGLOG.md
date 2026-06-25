# Bug Log — task-api

## 2026-06-25

### [MEDIUM] Nombres de columna interpolados dinámicamente en SQL UPDATE
- **Archivo:** `db.js`
- **Fix:** Reemplazado el array `ALLOWED` y la interpolación dinámica por un mapa explícito `FIELD_SQL` que asocia cada campo permitido con su fragmento SQL concreto, eliminando la posibilidad de que una futura expansión descuidada del mapa introduzca inyección SQL.

### [HIGH — Acción manual requerida] JWT secret real commiteado en `.env`
- **Acción:** Rotar el valor de `JWT_SECRET` (invalidará todos los tokens activos). Añadir `.env` al `.gitignore`.

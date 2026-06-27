# Bug Log — task-api

## 2026-06-28

### [MEDIA] Rate limiter personalizado en memoria — memory leak y bypass en reset de ventana
- **Archivo:** `routes/auth.js`, líneas 9-24
- **Descripción:** El Map `_hits` crecía sin límite (una entrada por IP única, nunca eliminada). Además, la lógica de reseteo se activaba solo en la siguiente petición tras expirar la ventana, permitiendo que una ráfaga exacta de `max` peticiones al inicio de una ventana más una más inmediatamente después del reset efectivo no fuera limitada correctamente. La dependencia `express-rate-limit` ya estaba declarada en `package.json` pero no se usaba.
- **Fix:** Eliminado el limiter manual. Creados `registerLimiter` y `loginLimiter` con `express-rate-limit`, con `standardHeaders: true` y `legacyHeaders: false`.

### [MEDIA] Ausencia de validación de inputs en rutas de tareas
- **Archivo:** `routes/tasks.js`, todas las rutas
- **Descripción:** Los campos `title`, `description`, `due_date`, `priority` y `status` se pasaban directamente a la base de datos sin validar tipo, longitud ni valores de enum. Los parámetros de filtro `?status` y `?priority` en GET tampoco se validaban, permitiendo valores arbitrarios que retornaban silenciosamente 0 resultados.
- **Fix:** Añadidos `VALID_STATUS` y `VALID_PRIORITY` para whitelistear enums; validaciones de tipo y longitud en POST y PUT; función `parseId()` para validar IDs de ruta como enteros positivos; validación de formato `YYYY-MM-DD` para `due_date`.

### [BAJA] `jwt.verify` sin lista de algoritmos explícita
- **Archivo:** `middleware/auth.js`, línea 8
- **Descripción:** Sin `algorithms`, jsonwebtoken acepta cualquier algoritmo que el token declare (excepto `none`, bloqueado desde v9). Si la clave secreta se usara en múltiples contextos, podría ser posible un ataque de confusión de algoritmo.
- **Fix:** Añadido `{ algorithms: ['HS256'] }` a `jwt.verify`.

### [BAJA] Contenedor Docker ejecutándose como root
- **Archivo:** `Dockerfile`
- **Descripción:** Sin directiva `USER`, el proceso Node corría como root dentro del contenedor, ampliando el radio de explosión en caso de compromiso del proceso.
- **Fix:** Añadido `addgroup`/`adduser` para crear `appuser` y `USER appuser` antes de `EXPOSE`.

---

## 2026-06-25

### [MEDIUM] Nombres de columna interpolados dinámicamente en SQL UPDATE
- **Archivo:** `db.js`
- **Fix:** Reemplazado el array `ALLOWED` y la interpolación dinámica por un mapa explícito `FIELD_SQL` que asocia cada campo permitido con su fragmento SQL concreto, eliminando la posibilidad de que una futura expansión descuidada del mapa introduzca inyección SQL.

### [HIGH — Acción manual requerida] JWT secret real commiteado en `.env`
- **Acción:** Rotar el valor de `JWT_SECRET` (invalidará todos los tokens activos). Añadir `.env` al `.gitignore`.

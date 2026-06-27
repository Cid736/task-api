const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

router.use(auth);

const VALID_STATUS   = new Set(['pending', 'in_progress', 'done']);
const VALID_PRIORITY = new Set(['low', 'medium', 'high']);

// Validate and parse a task ID from a route param. Returns integer or null.
function parseId(param) {
  const n = Number(param);
  return Number.isInteger(n) && n > 0 ? n : null;
}

router.get('/', (req, res) => {
  const { status, priority } = req.query;
  if (status   && !VALID_STATUS.has(status))
    return res.status(400).json({ error: 'status debe ser pending, in_progress o done' });
  if (priority && !VALID_PRIORITY.has(priority))
    return res.status(400).json({ error: 'priority debe ser low, medium o high' });
  const tasks = db.getTasks(req.user.id, { status, priority });
  const stats = db.getStats(req.user.id);
  res.json({ tasks, stats });
});

router.post('/', (req, res) => {
  const { title, description, priority, due_date } = req.body;
  if (!title)
    return res.status(400).json({ error: 'title es obligatorio' });
  if (typeof title !== 'string' || title.length > 255)
    return res.status(400).json({ error: 'title debe ser texto de máximo 255 caracteres' });
  if (description != null && (typeof description !== 'string' || description.length > 10000))
    return res.status(400).json({ error: 'description debe ser texto de máximo 10000 caracteres' });
  if (priority   && !VALID_PRIORITY.has(priority))
    return res.status(400).json({ error: 'priority debe ser low, medium o high' });
  if (due_date   && !/^\d{4}-\d{2}-\d{2}$/.test(due_date))
    return res.status(400).json({ error: 'due_date debe tener formato YYYY-MM-DD' });
  const result = db.createTask(req.user.id, req.body);
  res.status(201).json(db.getTask(result.lastInsertRowid, req.user.id));
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const task = db.getTask(id, req.user.id);
  task ? res.json(task) : res.status(404).json({ error: 'Tarea no encontrada' });
});

router.put('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const { title, description, status, priority, due_date } = req.body;
  if (title       != null && (typeof title !== 'string' || title.length > 255))
    return res.status(400).json({ error: 'title debe ser texto de máximo 255 caracteres' });
  if (description != null && (typeof description !== 'string' || description.length > 10000))
    return res.status(400).json({ error: 'description debe ser texto de máximo 10000 caracteres' });
  if (status      && !VALID_STATUS.has(status))
    return res.status(400).json({ error: 'status debe ser pending, in_progress o done' });
  if (priority    && !VALID_PRIORITY.has(priority))
    return res.status(400).json({ error: 'priority debe ser low, medium o high' });
  if (due_date    && !/^\d{4}-\d{2}-\d{2}$/.test(due_date))
    return res.status(400).json({ error: 'due_date debe tener formato YYYY-MM-DD' });
  try {
    const result = db.updateTask(id, req.user.id, req.body);
    if (!result?.changes)
      return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(db.getTask(id, req.user.id));
  } catch {
    res.status(400).json({ error: 'Datos inválidos' });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'ID inválido' });
  const result = db.deleteTask(id, req.user.id);
  result?.changes ? res.status(204).end() : res.status(404).json({ error: 'Tarea no encontrada' });
});

module.exports = router;

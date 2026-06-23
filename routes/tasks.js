const router = require('express').Router();
const auth   = require('../middleware/auth');
const db     = require('../db');

router.use(auth);

router.get('/', (req, res) => {
  const tasks = db.getTasks(req.user.id, req.query);
  const stats = db.getStats(req.user.id);
  res.json({ tasks, stats });
});

router.post('/', (req, res) => {
  if (!req.body.title)
    return res.status(400).json({ error: 'title es obligatorio' });
  const result = db.createTask(req.user.id, req.body);
  res.status(201).json(db.getTask(result.lastInsertRowid, req.user.id));
});

router.get('/:id', (req, res) => {
  const task = db.getTask(req.params.id, req.user.id);
  task ? res.json(task) : res.status(404).json({ error: 'Tarea no encontrada' });
});

router.put('/:id', (req, res) => {
  const result = db.updateTask(req.params.id, req.user.id, req.body);
  if (!result?.changes)
    return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(db.getTask(req.params.id, req.user.id));
});

router.delete('/:id', (req, res) => {
  const result = db.deleteTask(req.params.id, req.user.id);
  result?.changes ? res.status(204).end() : res.status(404).json({ error: 'Tarea no encontrada' });
});

module.exports = router;

const Database = require('better-sqlite3');
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'pending'  CHECK(status IN ('pending','in_progress','done')),
    priority    TEXT NOT NULL DEFAULT 'medium'   CHECK(priority IN ('low','medium','high')),
    due_date    TEXT,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
`);

const ALLOWED = ['title', 'description', 'status', 'priority', 'due_date'];

module.exports = {
  createUser: (username, email, hash) =>
    db.prepare('INSERT INTO users(username,email,password) VALUES(?,?,?)').run(username, email, hash),

  findByEmail: (email) =>
    db.prepare('SELECT * FROM users WHERE email=?').get(email),

  findById: (id) =>
    db.prepare('SELECT id,username,email,created_at FROM users WHERE id=?').get(id),

  createTask: (userId, body) =>
    db.prepare('INSERT INTO tasks(user_id,title,description,priority,due_date) VALUES(?,?,?,?,?)')
      .run(userId, body.title, body.description ?? null, body.priority ?? 'medium', body.due_date ?? null),

  getTasks: (userId, { status, priority } = {}) => {
    let q = 'SELECT * FROM tasks WHERE user_id=?';
    const p = [userId];
    if (status)   { q += ' AND status=?';   p.push(status); }
    if (priority) { q += ' AND priority=?'; p.push(priority); }
    return db.prepare(q + ' ORDER BY created_at DESC').all(...p);
  },

  getTask: (id, userId) =>
    db.prepare('SELECT * FROM tasks WHERE id=? AND user_id=?').get(id, userId),

  updateTask: (id, userId, body) => {
    const keys = Object.keys(body).filter(k => ALLOWED.includes(k));
    if (!keys.length) return null;
    const set = [...keys.map(k => `${k}=?`), "updated_at=datetime('now')"];
    return db.prepare(`UPDATE tasks SET ${set.join(',')} WHERE id=? AND user_id=?`)
      .run(...keys.map(k => body[k]), id, userId);
  },

  deleteTask: (id, userId) =>
    db.prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(id, userId),

  getStats: (userId) =>
    db.prepare(`
      SELECT COUNT(*) total,
             SUM(status='pending')     pending,
             SUM(status='in_progress') in_progress,
             SUM(status='done')        done,
             SUM(priority='high' AND status!='done') urgent
      FROM tasks WHERE user_id=?
    `).get(userId),
};

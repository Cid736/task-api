const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Simple in-memory rate limiter: max N attempts per IP per 15 min window
const _hits = new Map();
function rateLimit(max) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = _hits.get(key);
    if (entry && now < entry.resetAt) {
      if (entry.count >= max)
        return res.status(429).json({ error: 'Demasiados intentos. Espera unos minutos.' });
      entry.count++;
    } else {
      _hits.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    }
    next();
  };
}

router.post('/register', rateLimit(10), async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email y password son obligatorios' });
  if (username.length > 64 || email.length > 254 || password.length > 128)
    return res.status(400).json({ error: 'Input demasiado largo' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  try {
    const hash   = await bcrypt.hash(password, 10);
    const result = db.createUser(username, email, hash);
    const user   = db.findById(result.lastInsertRowid);
    res.status(201).json({ token: sign(user.id), user });
  } catch (e) {
    if (e.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'Email o username ya registrado' });
    console.error('[auth] register error:', e.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/login', rateLimit(15), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email y password son obligatorios' });
  const user = db.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  const { password: _, ...safe } = user;
  res.json({ token: sign(user.id), user: safe });
});

module.exports = router;

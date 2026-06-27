const router    = require('express').Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db        = require('../db');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Rate limiters backed by express-rate-limit (handles sliding windows correctly,
// uses an internal store, and does not grow unbounded like a plain Map).
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos.' },
});

router.post('/register', registerLimiter, async (req, res) => {
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

router.post('/login', loginLimiter, async (req, res) => {
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

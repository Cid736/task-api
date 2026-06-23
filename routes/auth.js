const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email y password son obligatorios' });
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
    res.status(500).json({ error: 'Error interno' });
  }
});

router.post('/login', async (req, res) => {
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

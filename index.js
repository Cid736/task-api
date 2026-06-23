require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.get('/health', (_, res) => res.json({ status: 'ok', uptime: Math.floor(process.uptime()) }));
app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Task API → http://localhost:${PORT}`));
}

module.exports = app;

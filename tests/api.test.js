process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-ci';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');

const uid = Date.now();
const user = { username: `user_${uid}`, email: `user_${uid}@test.com`, password: 'pass1234' };
let token = '';
let taskId = 0;

describe('Health', () => {
  test('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('GET /ruta-inexistente → 404', async () => {
    const res = await request(app).get('/ruta-inexistente');
    assert.equal(res.status, 404);
  });
});

describe('Auth — register', () => {
  test('campos completos → 201 con token', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    assert.equal(res.status, 201);
    assert.ok(res.body.token, 'debe incluir token');
    token = res.body.token;
  });

  test('email duplicado → 409', async () => {
    const res = await request(app).post('/api/auth/register').send(user);
    assert.equal(res.status, 409);
  });

  test('sin campos → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ username: 'a' });
    assert.equal(res.status, 400);
  });

  test('contraseña corta → 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: `u_${uid}2`, email: `u_${uid}2@test.com`, password: '123'
    });
    assert.equal(res.status, 400);
  });
});

describe('Auth — login', () => {
  test('credenciales correctas → 200 con token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: user.email, password: user.password
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('contraseña incorrecta → 401', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: user.email, password: 'wrong'
    });
    assert.equal(res.status, 401);
  });

  test('sin body → 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    assert.equal(res.status, 400);
  });
});

describe('Tasks', () => {
  test('GET sin auth → 401', async () => {
    const res = await request(app).get('/api/tasks');
    assert.equal(res.status, 401);
  });

  test('GET token inválido → 401', async () => {
    const res = await request(app).get('/api/tasks').set('Authorization', 'Bearer bad.token.here');
    assert.equal(res.status, 401);
  });

  test('POST tarea válida → 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Tarea de prueba', priority: 'high' });
    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'Tarea de prueba');
    taskId = res.body.id;
  });

  test('POST sin title → 400', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ priority: 'low' });
    assert.equal(res.status, 400);
  });

  test('GET lista → 200 con array', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.tasks));
    assert.ok(res.body.tasks.length >= 1);
  });

  test('GET tarea por id → 200', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, taskId);
  });

  test('PUT actualizar tarea → 200', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Tarea actualizada', status: 'done' });
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'Tarea actualizada');
  });

  test('DELETE tarea → 204', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 204);
  });

  test('GET tarea eliminada → 404', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 404);
  });
});

'use strict';
const express = require('express');
const mysql   = require('mysql2/promise');

const app  = express();
const PORT = 3002;
const PW   = 'lizard'; // must match PASSWORD constant in widget

// CORS — allow GitHub Pages and local dev
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-KW-Auth');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());

const pool = mysql.createPool({
  host:             'localhost',
  user:             'tradespot_admin',
  password:         'sourbison',
  database:         'widget',
  waitForConnections: true,
  connectionLimit:  10,
});

// Create table on first boot
pool.query(`
  CREATE TABLE IF NOT EXISTS keizaal_markers (
    id         VARCHAR(32)  PRIMARY KEY,
    type       VARCHAR(20)  NOT NULL,
    x          FLOAT        NOT NULL,
    y          FLOAT        NOT NULL,
    data       JSON         NOT NULL,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(() => console.log('keizaal_markers table ready'))
  .catch(e  => console.error('Table init error:', e.message));

// ── SSE broadcast ─────────────────────────────────────────────
const clients = new Set();

function broadcast(event, payload) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  clients.forEach(r => r.write(msg));
}

// ── Auth ──────────────────────────────────────────────────────
function auth(req, res) {
  if (req.headers['x-kw-auth'] !== PW) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

// ── Row → marker object ───────────────────────────────────────
function toMarker(row) {
  const data = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
  return { id: row.id, type: row.type, x: row.x, y: row.y, ...data };
}

// ── Routes ────────────────────────────────────────────────────

// GET all markers
app.get('/keizaal/markers', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, type, x, y, data FROM keizaal_markers');
    res.json(rows.map(toMarker));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// SSE real-time stream
app.get('/keizaal/stream', (req, res) => {
  res.setHeader('Content-Type',        'text/event-stream');
  res.setHeader('Cache-Control',       'no-cache');
  res.setHeader('Connection',          'keep-alive');
  res.setHeader('X-Accel-Buffering',   'no'); // tell nginx not to buffer
  res.flushHeaders();

  clients.add(res);
  // heartbeat keeps nginx from timing out the connection
  const hb = setInterval(() => res.write(': hb\n\n'), 25000);
  req.on('close', () => { clients.delete(res); clearInterval(hb); });
});

// POST — add marker
app.post('/keizaal/markers', async (req, res) => {
  if (!auth(req, res)) return;
  const { id, type, x, y, ...data } = req.body;
  try {
    await pool.query(
      'INSERT INTO keizaal_markers (id, type, x, y, data) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE type=VALUES(type), x=VALUES(x), y=VALUES(y), data=VALUES(data)',
      [id, type, x, y, JSON.stringify(data)]
    );
    broadcast('add', req.body);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT — update marker
app.put('/keizaal/markers/:id', async (req, res) => {
  if (!auth(req, res)) return;
  const { id, type, x, y, ...data } = req.body;
  try {
    await pool.query(
      'UPDATE keizaal_markers SET type=?, x=?, y=?, data=? WHERE id=?',
      [type, x, y, JSON.stringify(data), req.params.id]
    );
    broadcast('update', req.body);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE — remove marker
app.delete('/keizaal/markers/:id', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM keizaal_markers WHERE id=?', [req.params.id]);
    broadcast('delete', { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`keizaal-api listening on :${PORT}`));

'use strict';
const express = require('express');
const mysql   = require('mysql2/promise');

const app          = express();
const PORT         = 3002;
const PW           = 'lizard';
const COMMENTER_PW = 'bigwetnoodle';

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

// Create tables on first boot
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

pool.query(`
  CREATE TABLE IF NOT EXISTS keizaal_pending (
    id           VARCHAR(32)  PRIMARY KEY,
    action       VARCHAR(10)  NOT NULL,
    marker_id    VARCHAR(32)  NOT NULL,
    data         JSON,
    original     JSON,
    submitted_by VARCHAR(100) DEFAULT NULL,
    submitted_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log('keizaal_pending table ready');
  // Safe migration for existing installs that lack submitted_by
  return pool.query(`
    SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'keizaal_pending'
      AND COLUMN_NAME  = 'submitted_by'
  `);
}).then(([[row]]) => {
  if (!row.cnt)
    return pool.query(`ALTER TABLE keizaal_pending ADD COLUMN submitted_by VARCHAR(100) DEFAULT NULL`);
}).catch(e => console.error('Pending table init error:', e.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS keizaal_auth_log (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    access_level VARCHAR(20)  NOT NULL,
    logged_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => console.log('keizaal_auth_log table ready'))
  .then(() => pool.query(`
    SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'keizaal_auth_log' AND COLUMN_NAME = 'device_id'
  `))
  .then(([[row]]) => {
    if (!row.cnt) return pool.query(`
      ALTER TABLE keizaal_auth_log
        ADD COLUMN device_id    VARCHAR(64)  DEFAULT NULL,
        ADD COLUMN new_device   TINYINT(1)   NOT NULL DEFAULT 0
    `);
  })
  .catch(e => console.error('Auth log migration error:', e.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS keizaal_user_merges (
    canonical VARCHAR(100) NOT NULL,
    alias     VARCHAR(100) NOT NULL,
    PRIMARY KEY (alias)
  )
`).then(() => console.log('keizaal_user_merges table ready'))
  .catch(e  => console.error('User merges table init error:', e.message));

// ── SSE broadcast ─────────────────────────────────────────────
const clients = new Set();

// In-memory drawing state (clears on server restart)
let drawStrokes = [];

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

function authAny(req, res) {
  const h = req.headers['x-kw-auth'];
  if (h !== PW && h !== COMMENTER_PW) {
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

function parseJSON(val) {
  if (!val) return null;
  return typeof val === 'string' ? JSON.parse(val) : val;
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
  res.setHeader('X-Accel-Buffering',   'no');
  res.flushHeaders();

  clients.add(res);
  const hb = setInterval(() => res.write(': hb\n\n'), 25000);
  req.on('close', () => { clients.delete(res); clearInterval(hb); });
});

// POST — add marker (admin)
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

// PUT — update marker (admin)
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

// DELETE — remove marker (admin)
app.delete('/keizaal/markers/:id', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM keizaal_markers WHERE id=?', [req.params.id]);
    broadcast('delete', { id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Pending suggestions ───────────────────────────────────────

// POST — submit suggestion (commenter or admin)
app.post('/keizaal/pending', async (req, res) => {
  if (!authAny(req, res)) return;
  const { id, action, marker_id, data, original, submitted_by } = req.body;
  try {
    await pool.query(
      'INSERT INTO keizaal_pending (id, action, marker_id, data, original, submitted_by) VALUES (?,?,?,?,?,?)',
      [id, action, marker_id, data ? JSON.stringify(data) : null, original ? JSON.stringify(original) : null, submitted_by || null]
    );
    broadcast('pending-update', {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET — list pending suggestions (admin only)
app.get('/keizaal/pending', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const [rows] = await pool.query('SELECT * FROM keizaal_pending ORDER BY submitted_at ASC');
    res.json(rows.map(r => ({
      id:           r.id,
      action:       r.action,
      marker_id:    r.marker_id,
      data:         parseJSON(r.data),
      original:     parseJSON(r.original),
      submitted_by: r.submitted_by || null,
      submitted_at: r.submitted_at,
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST — approve suggestion (admin only)
app.post('/keizaal/pending/:id/approve', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const [[row]] = await pool.query('SELECT * FROM keizaal_pending WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });

    const data = parseJSON(row.data);

    if (row.action === 'add' || row.action === 'edit') {
      const { id: mid, type, x, y, ...rest } = data;
      await pool.query(
        'INSERT INTO keizaal_markers (id, type, x, y, data) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE type=VALUES(type), x=VALUES(x), y=VALUES(y), data=VALUES(data)',
        [mid, type, x, y, JSON.stringify(rest)]
      );
      broadcast(row.action === 'add' ? 'add' : 'update', data);
    } else if (row.action === 'delete') {
      await pool.query('DELETE FROM keizaal_markers WHERE id=?', [row.marker_id]);
      broadcast('delete', { id: row.marker_id });
    }

    await pool.query('DELETE FROM keizaal_pending WHERE id=?', [req.params.id]);
    broadcast('pending-update', {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST — deny suggestion (admin only)
app.post('/keizaal/pending/:id/deny', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM keizaal_pending WHERE id=?', [req.params.id]);
    broadcast('pending-update', {});
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Drawing ───────────────────────────────────────────────────

app.get('/keizaal/draw/state', (_req, res) => {
  res.json(drawStrokes);
});

app.post('/keizaal/draw/stroke', (req, res) => {
  if (!authAny(req, res)) return;
  const stroke = req.body;
  if (stroke?.id && !drawStrokes.find(s => s.id === stroke.id)) {
    drawStrokes.push(stroke);
  }
  broadcast('draw-stroke', stroke);
  res.json({ ok: true });
});

app.delete('/keizaal/draw/stroke/:id', (req, res) => {
  if (!authAny(req, res)) return;
  drawStrokes = drawStrokes.filter(s => s.id !== req.params.id);
  broadcast('draw-remove', { id: req.params.id });
  res.json({ ok: true });
});

app.post('/keizaal/draw/clear', (req, res) => {
  if (!authAny(req, res)) return;
  drawStrokes = [];
  broadcast('draw-clear', {});
  res.json({ ok: true });
});

// ── User merges ───────────────────────────────────────────────

// GET — fetch all merge mappings (admin only)
app.get('/keizaal/user-merges', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const [rows] = await pool.query('SELECT canonical, alias FROM keizaal_user_merges');
    const map = {};
    rows.forEach(r => {
      if (!map[r.canonical]) map[r.canonical] = [];
      map[r.canonical].push(r.alias);
    });
    res.json(Object.entries(map).map(([canonical, aliases]) => ({ canonical, aliases })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST — set a merge: canonical + all its aliases (admin only)
app.post('/keizaal/user-merges', async (req, res) => {
  if (!auth(req, res)) return;
  const { canonical, aliases } = req.body;
  if (!canonical || !Array.isArray(aliases)) return res.status(400).json({ error: 'Bad request' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM keizaal_user_merges WHERE canonical = ?', [canonical]);
    if (aliases.length > 0) {
      await conn.query('DELETE FROM keizaal_user_merges WHERE alias IN (?)', [aliases]);
      await conn.query(
        'INSERT INTO keizaal_user_merges (canonical, alias) VALUES ?',
        [aliases.map(a => [canonical, a])]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch(e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally { conn.release(); }
});

// DELETE — remove all aliases for a canonical (split), admin only
app.delete('/keizaal/user-merges/:canonical', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    await pool.query('DELETE FROM keizaal_user_merges WHERE canonical = ?', [req.params.canonical]);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Auth log ──────────────────────────────────────────────────

// POST — log a login event (no auth required — this IS the login)
app.post('/keizaal/auth-log', async (req, res) => {
  const { name, accessLevel, deviceId, newDevice } = req.body;
  if (!name || !accessLevel) return res.status(400).json({ error: 'Missing fields' });
  try {
    await pool.query(
      'INSERT INTO keizaal_auth_log (name, access_level, device_id, new_device) VALUES (?, ?, ?, ?)',
      [String(name).slice(0, 100), String(accessLevel).slice(0, 20), deviceId ? String(deviceId).slice(0, 64) : null, newDevice ? 1 : 0]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET — fetch auth log (admin only)
app.get('/keizaal/auth-log', async (req, res) => {
  if (!auth(req, res)) return;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, access_level, device_id, new_device, logged_at FROM keizaal_auth_log ORDER BY logged_at DESC LIMIT 500'
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`keizaal-api listening on :${PORT}`));

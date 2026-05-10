import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeMarkers, apiAdd, apiUpdate, apiDelete } from './api';
import './App.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'keizaal-markers';
const SETTINGS_KEY = 'keizaal-settings';
const IMG_BASE    = '/oldProjects/KeizaalWidget/images/landmarks/';
const TOOLBAR_H   = 44;
const PASSWORD    = 'lizard';

const ENEMIES  = ['Bears','Chorus','Deer','Elementals','Frost Skeleton','Goats','Horkers','Ice Wolves','Skeleton','Spiders','Trolls','Wolves'];
const PLANTS   = ['Blue Flower','Deathcap','Glowing Mushroom','Nightshade','Red Flower','Thistle','Yellow Flower'];
const ORES     = ['Coal','Corundum','Dwarven','Ebony','Gold','Iron','Malachite','Moonstone','Orichalcum','Quicksilver','Silver','Steel'];

const LANDMARKS = [
  { file:'Camp.svg',             label:'Camp' },
  { file:'GiantCamp.svg',        label:'Giant Camp' },
  { file:'ImperialCamp.svg',     label:'Imperial Camp' },
  { file:'StromcloakCamp.svg',   label:'Stormcloak Camp' },
  { file:'OrcCamp.svg',          label:'Orc Camp' },
  { file:'Farm.svg',             label:'Farm' },
  { file:'FarmWithMill.svg',     label:'Farm w/ Mill' },
  { file:'Shack.svg',            label:'Shack' },
  { file:'Stable.svg',           label:'Stable' },
  { file:'SettlementWhite.svg',  label:'Settlement' },
  { file:'Cave.svg',             label:'Cave' },
  { file:'DwarvenRuins.svg',     label:'Dwarven Ruins' },
  { file:'Mine.svg',             label:'Mine' },
  { file:'Tomb.svg',             label:'Tomb' },
  { file:'Tower.svg',            label:'Tower' },
  { file:'DaedricShrine.svg',    label:'Daedric Shrine' },
  { file:'Dragon.svg',           label:'Dragon' },
  { file:'Stone.svg',            label:'Standing Stone' },
  { file:'PointOfInterest.svg',  label:'Point of Interest' },
  { file:'Pond.svg',             label:'Pond' },
  { file:'Shipwreck.svg',        label:'Shipwreck' },
  { file:'Understoneicon.webp',  label:'Understone' },
  { file:'Docksicon.webp',       label:'Docks' },
  { file:'Lighthousesicon.webp', label:'Lighthouse' },
  { file:'Shacksicon.webp',      label:'Shacks' },
  { file:'Ruinsicon.webp',       label:'Ruins' },
  { file:'Nordictowericon.webp', label:'Nordic Tower' },
  { file:'Watchtowericon.webp',  label:'Watch Tower' },
  { file:'Passesicon.webp',      label:'Pass' },
  { file:'Grovesicon.webp',      label:'Grove' },
  { file:'Wood_Mill.webp',       label:'Wood Mill' },
];

const TYPES = ['Monument','Circle','Plant','Enemy','Ore','Chest'];

const TYPE_COLORS = {
  Monument:'#FFD700', Circle:'#4499FF', Plant:'#55BB55',
  Enemy:'#EE4444',    Ore:'#FF8C00',    Chest:'#FFD700',
};

// ── Pure helpers ──────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function clampOffset(ox, oy, imgW, imgH, cW, cH, sc) {
  if (!imgW || !imgH) return { x: ox, y: oy };
  const sw = imgW * sc, sh = imgH * sc;
  return {
    x: sw <= cW ? (cW - sw) / 2 : Math.min(0, Math.max(cW - sw, ox)),
    y: sh <= cH ? (cH - sh) / 2 : Math.min(0, Math.max(cH - sh, oy)),
  };
}

function matchesFilter(marker, f) {
  if (f.types.length > 0 && !f.types.includes(marker.type)) return false;
  const checks = [];
  const me = (marker.enemies || []).map(e => e.name);
  const mp = (marker.plants  || []).map(p => p.name);
  const mo = (marker.nodes   || []).map(o => o.name);
  f.enemies.forEach(e => checks.push(me.includes(e)));
  f.plants.forEach(p  => checks.push(mp.includes(p)));
  f.ores.forEach(o    => checks.push(mo.includes(o)));
  if (f.chest) checks.push(!!marker.chest);
  if (!checks.length) return true;
  return f.match === 'all' ? checks.every(Boolean) : checks.some(Boolean);
}

// ── Canvas draw helpers ───────────────────────────────────────────────────────
function drawStar(ctx, cx, cy, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.42;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawNumberCircle(ctx, cx, cy, r, color, n) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(9, r * 0.88)}px Inter,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(n > 99 ? '99+' : String(n), cx, cy);
}

function drawMarkerOnCanvas(ctx, marker, cx, cy, r, getImg) {
  ctx.save();
  switch (marker.type) {
    case 'Monument': {
      if (marker.icon) {
        const img = getImg(IMG_BASE + marker.icon);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.clip();
        if (img.complete) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        else { ctx.fillStyle = '#2a3848'; ctx.fill(); }
        ctx.restore(); ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,215,0,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
      } else { drawStar(ctx, cx, cy, r, '#FFD700'); }
      break;
    }
    case 'Circle': {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
      ctx.strokeStyle = marker.borderColor || '#4499FF';
      ctx.lineWidth = Math.max(3, r * 0.25); ctx.stroke();
      break;
    }
    case 'Plant':  { const n = (marker.plants  || []).reduce((s,p) => s+p.count, 0); drawNumberCircle(ctx,cx,cy,r,'#55BB55',n); break; }
    case 'Enemy':  { const n = (marker.enemies || []).reduce((s,e) => s+e.count, 0); drawNumberCircle(ctx,cx,cy,r,'#EE4444',n); break; }
    case 'Ore':    { const n = (marker.nodes   || []).reduce((s,o) => s+o.count, 0); drawNumberCircle(ctx,cx,cy,r,'#FF8C00',n); break; }
    case 'Chest':  { drawStar(ctx, cx, cy, r, '#FFD700'); break; }
  }
  ctx.restore();
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function Ico({ n, size = 16 }) {
  const d = {
    lock:     'M18 10V7A6 6 0 006 7v3H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2v-9a2 2 0 00-2-2h-2zm-8 0V7a2 2 0 114 0v3H10zm2 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
    unlock:   'M18 10H10V7a2 2 0 114 0h2A4 4 0 008 7v3H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2v-9a2 2 0 00-2-2zm-6 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
    filter:   'M4 6h16v2.172L14 14.172V21l-4-2v-4.828L4 8.172V6z',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zm7.43-2.92a7.32 7.32 0 00.07-.94c0-.31-.03-.63-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.93-3.32a.48.48 0 00-.59-.22l-2.39.96a7.08 7.08 0 00-1.62-.94l-.36-2.54A.47.47 0 0014.2 3H9.8a.47.47 0 00-.47.41l-.36 2.54a7.08 7.08 0 00-1.62.94l-2.39-.96a.48.48 0 00-.59.22L2.44 9.47a.47.47 0 00.12.61l2.03 1.58c-.04.31-.07.63-.07.94 0 .31.03.63.07.94l-2.03 1.58a.47.47 0 00-.12.61l1.93 3.32c.12.22.36.3.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.47.41h4.4c.23 0 .43-.17.47-.41l.36-2.54c.59-.24 1.12-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.93-3.32a.47.47 0 00-.12-.61l-2.03-1.58z',
  }[n] || '';
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d={d}/></svg>;
}

// ── MultiPicker ───────────────────────────────────────────────────────────────
function MultiPicker({ label, options, items, onChange }) {
  const [sel, setSel] = useState('');
  const [qty, setQty] = useState(1);
  const add = () => {
    if (!sel) return;
    const ex = items.find(i => i.name === sel);
    onChange(ex ? items.map(i => i.name === sel ? {...i, count: i.count + qty} : i) : [...items, {name:sel, count:qty}]);
    setSel(''); setQty(1);
  };
  return (
    <div className="multi-picker">
      <span className="field-label">{label}</span>
      <div className="multi-row">
        <select value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <input type="number" min="1" max="99" value={qty}
          onChange={e => setQty(Math.max(1, +e.target.value || 1))} className="qty-inp" />
        <button type="button" onClick={add} disabled={!sel} className="add-btn">Add</button>
      </div>
      {items.length > 0 && (
        <div className="tag-list">
          {items.map((item, i) => (
            <span key={item.name} className="tag">
              {item.name}
              <input type="number" min="1" max="99" value={item.count}
                onChange={e => { const u=[...items]; u[i]={...item,count:Math.max(1,+e.target.value||1)}; onChange(u); }}
                className="tag-qty" />
              <button type="button" onClick={() => onChange(items.filter((_,j)=>j!==i))} className="tag-x">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── LandmarkPicker ────────────────────────────────────────────────────────────
function LandmarkPicker({ value, onChange }) {
  return (
    <div className="lm-grid">
      {LANDMARKS.map(({ file, label }) => (
        <button key={file} type="button" title={label}
          className={`lm-btn${value === file ? ' sel' : ''}`}
          onClick={() => onChange(file)}>
          <img src={IMG_BASE + file} alt={label} />
        </button>
      ))}
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, area }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {area ? <textarea value={value} onChange={e => onChange(e.target.value)} />
             : <input type="text" value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

// ── MarkerForm ────────────────────────────────────────────────────────────────
function getInitial(type) {
  switch (type) {
    case 'Monument': return { icon:'', name:'', desc:'', plants:[], enemies:[], nodes:[], chest:false, notes:'' };
    case 'Circle':   return { borderColor:'#4499FF', name:'', desc:'', plants:[], enemies:[], nodes:[], notes:'' };
    case 'Plant':    return { plants:[], notes:'' };
    case 'Enemy':    return { enemies:[], notes:'' };
    case 'Ore':      return { nodes:[], notes:'' };
    case 'Chest':    return { notes:'' };
    default:         return {};
  }
}

function MarkerForm({ type, initial, onSave, onDelete, onClose }) {
  const [d, setD] = useState(() => ({ ...getInitial(type), ...initial }));
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="marker-form">
      <div className="form-head">
        <span className="form-title">{type}</span>
        <button type="button" className="form-x" onClick={onClose}>×</button>
      </div>
      {type === 'Monument' && <>
        <span className="field-label">Icon <span className="req">*required</span></span>
        <LandmarkPicker value={d.icon} onChange={v => set('icon', v)} />
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <Field label="Description" value={d.desc} onChange={v => set('desc', v)} area />
        <MultiPicker label="Plants"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Enemies"   options={ENEMIES}  items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Ore Nodes" options={ORES}     items={d.nodes}    onChange={v => set('nodes', v)} />
        <label className="check-row"><input type="checkbox" checked={d.chest} onChange={e => set('chest', e.target.checked)} /> Contains Chest</label>
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Circle' && <>
        <div className="color-row"><span className="field-label">Border Color</span><input type="color" value={d.borderColor} onChange={e => set('borderColor', e.target.value)} /></div>
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <Field label="Description" value={d.desc} onChange={v => set('desc', v)} area />
        <MultiPicker label="Plants"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Enemies"   options={ENEMIES}  items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Ore Nodes" options={ORES}     items={d.nodes}    onChange={v => set('nodes', v)} />
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Plant'  && <><MultiPicker label="Plants"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Enemy'  && <><MultiPicker label="Enemies"   options={ENEMIES}  items={d.enemies}  onChange={v => set('enemies', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Ore'    && <><MultiPicker label="Ore Nodes" options={ORES}     items={d.nodes}    onChange={v => set('nodes', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Chest'  && <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />}
      <div className="form-actions">
        <button type="button" className="btn-save" disabled={type === 'Monument' && !d.icon} onClick={() => onSave(d)}>Save</button>
        {onDelete && <button type="button" className="btn-del" onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}

// ── PasswordPanel ─────────────────────────────────────────────────────────────
function PasswordPanel({ onSuccess }) {
  const [pw, setPw]       = useState('');
  const [error, setError] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => {
    if (pw === PASSWORD) { onSuccess(); }
    else { setError(true); setPw(''); setTimeout(() => setError(false), 700); }
  };
  return (
    <div className="tb-panel pw-panel" onPointerDown={e => e.stopPropagation()}>
      <span className="panel-label">Enter Password</span>
      <div className="pw-row">
        <input ref={ref} type="password" value={pw} placeholder="••••••"
          className={error ? 'shake' : ''}
          onChange={e => { setPw(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && submit()} />
        <button onClick={submit}>→</button>
      </div>
      {error && <span className="pw-error">Incorrect</span>}
    </div>
  );
}

// ── FilterChips ───────────────────────────────────────────────────────────────
function FilterChips({ label, options, selected, onToggle }) {
  return (
    <div className="panel-section">
      <span className="panel-label">{label}</span>
      <div className="chip-wrap">
        {options.map(o => (
          <button key={o} className={`chip${selected.includes(o) ? ' on' : ''}`} onClick={() => onToggle(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}

// ── FilterPanel ───────────────────────────────────────────────────────────────
function FilterPanel({ filter, onChange }) {
  const tog = (field, val) => {
    const arr = filter[field];
    onChange({ ...filter, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };
  const clear = () => onChange({ types:[], enemies:[], plants:[], ores:[], chest:false, match:'any' });
  const hasAny = filter.types.length || filter.enemies.length || filter.plants.length || filter.ores.length || filter.chest;
  return (
    <div className="tb-panel filter-panel" onPointerDown={e => e.stopPropagation()}>
      <div className="panel-section">
        <span className="panel-label">Point Type</span>
        <div className="chip-wrap">
          {TYPES.map(t => (
            <button key={t} className={`chip${filter.types.includes(t) ? ' on' : ''}`}
              style={filter.types.includes(t) ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : {}}
              onClick={() => tog('types', t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <span className="panel-label">Content Match</span>
        <div className="match-row">
          <button className={`match-btn${filter.match==='any'?' on':''}`} onClick={() => onChange({...filter, match:'any'})}>Any</button>
          <button className={`match-btn${filter.match==='all'?' on':''}`} onClick={() => onChange({...filter, match:'all'})}>All</button>
        </div>
      </div>
      <FilterChips label="Enemies" options={ENEMIES} selected={filter.enemies} onToggle={v => tog('enemies', v)} />
      <FilterChips label="Plants"  options={PLANTS}  selected={filter.plants}  onToggle={v => tog('plants', v)} />
      <FilterChips label="Ores"    options={ORES}    selected={filter.ores}    onToggle={v => tog('ores', v)} />
      <label className="check-row" style={{marginTop:6}}>
        <input type="checkbox" checked={filter.chest} onChange={e => onChange({...filter, chest: e.target.checked})} />
        Has Chest
      </label>
      {hasAny && <button className="clear-btn" onClick={clear}>Clear All</button>}
    </div>
  );
}

// ── SettingsPanel ─────────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange }) {
  const [showRules, setShowRules] = useState(false);
  return (
    <div className="tb-panel settings-panel" onPointerDown={e => e.stopPropagation()}>
      <div className="panel-section">
        <span className="panel-label">Map Tint</span>
        <div className="settings-row">
          <input type="color" value={settings.tint} onChange={e => onChange({...settings, tint: e.target.value})} />
          <input type="range" min="0" max="0.75" step="0.05" value={settings.tintOpacity}
            onChange={e => onChange({...settings, tintOpacity: +e.target.value})} />
          <span className="settings-val">{Math.round(settings.tintOpacity * 100)}%</span>
        </div>
      </div>
      <div className="panel-section">
        <span className="panel-label">Marker Scale</span>
        {TYPES.map(t => (
          <div key={t} className="scale-row">
            <span className="scale-type" style={{ color: TYPE_COLORS[t] }}>{t}</span>
            <input type="range" min="0.4" max="2.5" step="0.1"
              value={settings.iconScale[t] ?? 1}
              onChange={e => onChange({ ...settings, iconScale: { ...settings.iconScale, [t]: +e.target.value } })} />
            <span className="settings-val">{(settings.iconScale[t] ?? 1).toFixed(1)}×</span>
          </div>
        ))}
      </div>
      <div className="panel-section">
        <label className="check-row" style={{marginBottom:0}}>
          <input type="checkbox" checked={settings.boundaryLock}
            onChange={e => onChange({...settings, boundaryLock: e.target.checked})} />
          Lock pan to map boundary
        </label>
      </div>
      <div className="panel-section" style={{marginBottom:0}}>
        <button className="rules-btn" onClick={() => setShowRules(v => !v)}>
          {showRules ? '▲' : '▼'} Placement Guide
        </button>
        {showRules && (
          <div className="rules-card">
            <div className="rule">
              <div className="rule-head">
                <span className="rule-icon">🏛</span>
                <span className="rule-title">Group content into Monuments</span>
              </div>
              <p className="rule-body">
                Enemies, Plants, and Ore nodes found <em>at</em> a location belong inside that Monument marker — not as separate markers on the same spot.
              </p>
            </div>
            <div className="rule">
              <div className="rule-head">
                <span className="rule-icon">✏️</span>
                <span className="rule-title">Keep naming consistent</span>
              </div>
              <p className="rule-body">
                Use the same name for the same thing across all markers. If one Monument is called <em>Embershard Mine</em>, don't call another <em>embershard mine</em>.
              </p>
            </div>
            <div className="rule">
              <div className="rule-head">
                <span className="rule-icon">⚠️</span>
                <span className="rule-title">Don't overlap markers</span>
              </div>
              <p className="rule-body">
                Stacked markers hide each other and the one underneath becomes unreachable. Space them out.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ViewCard ──────────────────────────────────────────────────────────────────
function VCRow({ icon, items }) {
  if (!items?.length) return null;
  return (
    <div className="vc-row">
      {items.map(i => <span key={i.name} className="vc-chip">{icon} {i.name}<em>×{i.count}</em></span>)}
    </div>
  );
}

function ViewCard({ marker, sx, sy, onClose }) {
  const W = 248;
  let cx = sx + 20, cy = sy - 50;
  if (cx + W > window.innerWidth  - 8) cx = sx - W - 20;
  if (cy < TOOLBAR_H + 8)              cy = TOOLBAR_H + 8;
  if (cy + 300 > window.innerHeight - 8) cy = window.innerHeight - 308;
  return (
    <div className="view-card" style={{ left: Math.max(8, cx), top: cy }}
      onPointerDown={e => e.stopPropagation()}>
      <div className="vc-head">
        <span className="vc-type" style={{ color: TYPE_COLORS[marker.type] }}>{marker.type}</span>
        {marker.name && <span className="vc-name">{marker.name}</span>}
        <button className="vc-x" onClick={onClose}>×</button>
      </div>
      <div className="vc-body">
        {marker.chest && <div className="vc-chest">⭐ Contains Chest</div>}
        <VCRow icon="⚔" items={marker.enemies} />
        <VCRow icon="🌿" items={marker.plants}  />
        <VCRow icon="⛏" items={marker.nodes}   />
        {marker.desc  && <p className="vc-text">{marker.desc}</p>}
        {marker.notes && <p className="vc-text vc-notes">{marker.notes}</p>}
        {!marker.chest && !marker.enemies?.length && !marker.plants?.length && !marker.nodes?.length && !marker.desc && !marker.notes && (
          <span className="vc-empty">No details recorded</span>
        )}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const canvasRef = useRef(null);
  const mapImgRef = useRef(null);
  const imgDims   = useRef({ w: 0, h: 0 });
  const imgCache  = useRef({});
  const dragRef   = useRef({ active:false, startX:0, startY:0, startOffsetX:0, startOffsetY:0, moved:false });

  const cH = () => window.innerHeight - TOOLBAR_H;

  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: cH() });
  const [scale,  setScale]  = useState(1);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [markers, setMarkers] = useState([]);
  const [sync, setSync] = useState('connecting'); // 'connecting'|'live'|'error'

  const [appMode,    setAppMode]    = useState('view');   // 'view' | 'edit'
  const [tbPanel,    setTbPanel]    = useState(null);     // 'password'|'filter'|'settings'|null
  const [panel,      setPanel]      = useState(null);     // right-click placement panel
  const [editTarget, setEditTarget] = useState(null);
  const [viewCard,   setViewCard]   = useState(null);     // { id, sx, sy }

  const [filter, setFilter] = useState({ types:[], enemies:[], plants:[], ores:[], chest:false, match:'any' });
  const [settings, setSettings] = useState(() => {
    const def = { tint:'#1a0a00', tintOpacity:0, iconScale:{ Monument:1, Circle:1, Plant:1, Enemy:1, Ore:1, Chest:1 }, boundaryLock:true };
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (!s) return def;
      if (typeof s.iconScale === 'number') s.iconScale = { ...def.iconScale };
      return s;
    } catch { return def; }
  });

  // Persist settings locally (viewer prefs)
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  // Live server subscription
  useEffect(() => subscribeMarkers(setMarkers, setSync), []);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { setPanel(null); setEditTarget(null); setViewCard(null); setTbPanel(null); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Load map + resize
  useEffect(() => {
    const img = new Image();
    img.src = '/oldProjects/KeizaalWidget/images/map1.png';
    img.onload = () => {
      mapImgRef.current = img;
      imgDims.current   = { w: img.naturalWidth, h: img.naturalHeight };
      const { width, height } = canvasSize;
      const fit = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      setScale(fit);
      setOffset({ x:(width  - img.naturalWidth  * fit)/2, y:(height - img.naturalHeight * fit)/2 });
    };
    const onResize = () => setCanvasSize({ width: window.innerWidth, height: cH() });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [canvasSize.height, canvasSize.width]);

  const getImg = useCallback((src) => {
    if (!imgCache.current[src]) {
      const img = new Image();
      img.src = src;
      img.onload = () => setDrawTick(t => t + 1);
      imgCache.current[src] = img;
    }
    return imgCache.current[src];
  }, []);

  const [drawTick, setDrawTick] = useState(0);

  const doClamp = useCallback((ox, oy, sc) => {
    if (!settings.boundaryLock) return { x: ox, y: oy };
    const { w, h } = imgDims.current;
    return clampOffset(ox, oy, w, h, canvasSize.width, canvasSize.height, sc);
  }, [canvasSize, settings.boundaryLock]);

  const canvasToWorld = (px, py) => ({ x:(px - offset.x)/scale, y:(py - offset.y)/scale });

  // Filter computation
  const filteredIds = useMemo(() => {
    const active = filter.types.length || filter.enemies.length || filter.plants.length || filter.ores.length || filter.chest;
    if (!active) return null;
    const ids = new Set();
    markers.forEach(m => { if (matchesFilter(m, filter)) ids.add(m.id); });
    return ids;
  }, [markers, filter]);

  // ── Pointer ───────────────────────────────────────────────────
  const onPointerDown = e => {
    if (tbPanel) { setTbPanel(null); return; }
    if (panel)   { setPanel(null);   return; }
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = 'grabbing';
    dragRef.current = { active:true, startX:e.clientX, startY:e.clientY, startOffsetX:offset.x, startOffsetY:offset.y, moved:false };
  };

  const onPointerMove = e => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) d.moved = true;
    if (d.moved) setOffset(doClamp(d.startOffsetX + dx, d.startOffsetY + dy, scale));
  };

  const onPointerUp = e => {
    const d = dragRef.current;
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    if (d.active && !d.moved && e.button === 0) {
      const rect  = canvasRef.current.getBoundingClientRect();
      const world = canvasToWorld(e.clientX - rect.left, e.clientY - rect.top);
      const hit   = markers.find(m => Math.hypot(m.x - world.x, m.y - world.y) < 20 / scale);
      if (hit) {
        if (appMode === 'view') setViewCard({ id: hit.id, sx: e.clientX, sy: e.clientY });
        else setEditTarget({ ...hit });
      } else {
        setViewCard(null);
      }
    }
    dragRef.current.active = false;
  };

  const onContextMenu = e => {
    e.preventDefault();
    if (appMode !== 'edit' || dragRef.current.moved) return;
    const rect  = canvasRef.current.getBoundingClientRect();
    const world = canvasToWorld(e.clientX - rect.left, e.clientY - rect.top);
    setPanel({ mode:'menu', screenX:e.clientX, screenY:e.clientY, worldX:world.x, worldY:world.y });
  };

  const onWheel = e => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(prev => {
      const next = Math.min(3, Math.max(0.5, prev * f));
      setOffset(po => {
        const cx = canvasSize.width/2, cy = canvasSize.height/2;
        return doClamp(cx-((cx-po.x)/prev)*next, cy-((cy-po.y)/prev)*next, next);
      });
      return next;
    });
  };

  // ── Canvas draw ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = mapImgRef.current;
    if (img?.complete && img.naturalWidth) {
      ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
    } else {
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Tint overlay
    if (settings.tintOpacity > 0) {
      ctx.fillStyle   = settings.tint;
      ctx.globalAlpha = settings.tintOpacity;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    markers.forEach(m => {
      const r  = 14 * Math.sqrt(scale) * (settings.iconScale[m.type] ?? 1);
      const cx = m.x * scale + offset.x;
      const cy = m.y * scale + offset.y;
      ctx.globalAlpha = filteredIds && !filteredIds.has(m.id) ? 0.15 : 1;
      drawMarkerOnCanvas(ctx, m, cx, cy, r, getImg);
    });
    ctx.globalAlpha = 1;
  }, [canvasSize, markers, offset, scale, drawTick, getImg, filteredIds, settings]);

  // ── Helpers ───────────────────────────────────────────────────
  const lockToggle = () => {
    if (appMode === 'edit') {
      setAppMode('view'); setTbPanel(null); setPanel(null); setEditTarget(null);
    } else {
      setTbPanel(t => t === 'password' ? null : 'password');
    }
  };

  const menuStyle = panel?.mode === 'menu' ? (() => {
    const pw=162, ph=230;
    let px=panel.screenX+6, py=panel.screenY+6;
    if (px+pw > window.innerWidth -8) px=panel.screenX-pw-6;
    if (py+ph > window.innerHeight-8) py=window.innerHeight-ph-8;
    return { left:Math.max(8,px), top:Math.max(8,py) };
  })() : null;

  const viewMarker = viewCard ? markers.find(m => m.id === viewCard.id) : null;
  const filterIsOn = filteredIds !== null;

  return (
    <div className="app">
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="tb-left">
          <button className={`tb-btn${appMode==='edit'?' tb-edit':''}`} onClick={lockToggle}
            title={appMode==='edit' ? 'Lock (return to view)' : 'Unlock edit mode'}>
            <Ico n={appMode==='edit' ? 'unlock' : 'lock'} />
          </button>
        </div>
        <div className="tb-center">
          <span className="tb-title">Keizaal</span>
          <span className={`sync-dot sync-${sync}`} title={{ live:'Live sync', connecting:'Connecting…', error:'Sync error' }[sync]} />
        </div>
        <div className="tb-right">
          {appMode === 'view' && (
            <button className={`tb-btn${tbPanel==='filter'?' tb-open':''}${filterIsOn?' tb-on':''}`}
              onClick={() => setTbPanel(t => t==='filter' ? null : 'filter')} title="Filter">
              <Ico n="filter" />
            </button>
          )}
          <button className={`tb-btn${tbPanel==='settings'?' tb-open':''}`}
            onClick={() => setTbPanel(t => t==='settings' ? null : 'settings')} title="Settings">
            <Ico n="settings" />
          </button>
        </div>
      </div>

      {/* ── Toolbar panels ── */}
      {tbPanel === 'password' && (
        <div className="tb-drop tb-drop-left">
          <PasswordPanel onSuccess={() => { setAppMode('edit'); setTbPanel(null); }} />
        </div>
      )}
      {tbPanel === 'filter' && (
        <div className="tb-drop tb-drop-right">
          <FilterPanel filter={filter} onChange={setFilter} />
        </div>
      )}
      {tbPanel === 'settings' && (
        <div className="tb-drop tb-drop-right">
          <SettingsPanel settings={settings} onChange={setSettings} />
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="canvas-container">
        <canvas ref={canvasRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onContextMenu={onContextMenu} onWheel={onWheel} className="map-canvas" />
      </div>

      {/* ── Right-click placement menu ── */}
      {panel?.mode === 'menu' && (
        <div className="ctx-panel" style={menuStyle} onPointerDown={e => e.stopPropagation()}>
          {TYPES.map(type => (
            <button key={type} className="ctx-item" onClick={() => setPanel({...panel, mode:'form', type})}>
              <span className="ctx-dot" style={{ background: TYPE_COLORS[type] }} />{type}
            </button>
          ))}
        </div>
      )}

      {/* ── Creation form (modal) ── */}
      {panel?.mode === 'form' && (
        <div className="modal-overlay" onPointerDown={() => setPanel(null)}>
          <div className="modal-box" onPointerDown={e => e.stopPropagation()}>
            <MarkerForm type={panel.type} initial={{}}
              onSave={data => {
                apiAdd({ id:generateId(), x:panel.worldX, y:panel.worldY, type:panel.type, ...data });
                setPanel(null);
              }}
              onClose={() => setPanel(null)} />
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <div className="modal-overlay" onPointerDown={() => setEditTarget(null)}>
          <div className="modal-box" onPointerDown={e => e.stopPropagation()}>
            <MarkerForm type={editTarget.type} initial={editTarget}
              onSave={data => { apiUpdate({ ...editTarget, ...data }); setEditTarget(null); }}
              onDelete={() => { apiDelete(editTarget.id); setEditTarget(null); }}
              onClose={() => setEditTarget(null)} />
          </div>
        </div>
      )}

      {/* ── View card ── */}
      {viewMarker && (
        <ViewCard marker={viewMarker} sx={viewCard.sx} sy={viewCard.sy} onClose={() => setViewCard(null)} />
      )}
    </div>
  );
}

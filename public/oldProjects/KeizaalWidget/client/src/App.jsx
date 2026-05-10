import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeMarkers, apiAdd, apiUpdate, apiDelete, apiSuggest, apiGetPending, apiApprovePending, apiDenyPending } from './api';
import './App.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'keizaal-markers';
const SETTINGS_KEY = 'keizaal-settings';
const IMG_BASE      = '/oldProjects/KeizaalWidget/images/landmarks/';
const CITY_IMG_BASE = '/oldProjects/KeizaalWidget/images/majorcities/';
const TOOLBAR_H   = 44;
const PASSWORD_ADMIN     = 'lizard';
const PASSWORD_COMMENTER = 'bigwetnoodle';

const ENEMIES  = ['Bears','Chorus','Deer','Elementals','Frost Skeleton','Goats','Horkers','Ice Wolves','Skeleton','Spiders','Trolls','Wolves'];
const PLANTS   = [
  'Ash Creep Cluster','Ashen Grass Pod','Bleeding Crown','Blisterwort',
  'Blue Mountain Flower','Canis Root','Creep Cluster','Crimson Nirnroot',
  'Deathbell','Dragon\'s Tongue','Elves Ear','Emperor Parasol Moss',
  'Fly Amanita','Frost Mirriam','Garlic','Giant Lichen','Gleamblossom',
  'Glowing Mushroom','Grass Pod','Hanging Moss','Imp Stool','Jazbay Grapes',
  'Juniper Berries','Lavender','Mora Tapinella','Nightshade','Nirnroot',
  'Poison Bloom','Purple Mountain Flower','Red Mountain Flower','Scaly Pholiota',
  'Scathecraw','Snowberries','Swamp Fungal Pod','Thistle Branch','Trama Root',
  'Tundra Cotton','White Cap','Yellow Mountain Flower',
];
const ORES     = ['Coal','Copper','Corundum','Dwarven','Ebony','Gold','Iron','Malachite','Moonstone','Orichalcum','Quicksilver','Silver','Steel'];

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

const MAJORCITIES = [
  { file:'Dawnstar.svg',     label:'Dawnstar' },
  { file:'Falkreath.svg',    label:'Falkreath' },
  { file:'MarkarthSide.svg', label:'Markarth' },
  { file:'Morthal.svg',      label:'Morthal' },
  { file:'Riften.svg',       label:'Riften' },
  { file:'Solitude.svg',     label:'Solitude' },
  { file:'Whiterun.svg',     label:'Whiterun' },
  { file:'Windhelm.svg',     label:'Windhelm' },
  { file:'Winterhold.svg',   label:'Winterhold' },
];

const TYPES = ['Monument','Major City','Plant','Enemy','Ore','Chest','Dud'];

const TYPE_COLORS = {
  Monument:'#FFD700', 'Major City':'#4499FF', Plant:'#55BB55',
  Enemy:'#EE4444',    Ore:'#FF8C00',          Chest:'#FFD700',  Dud:'#FF4040',
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
  const me = (marker.enemies || []).map(e => e.name);
  const mp = (marker.plants  || []).map(p => p.name);
  const mo = (marker.nodes   || []).map(o => o.name);

  if (f.types.length > 0) {
    const direct = f.types.includes(marker.type);
    // Monuments and Major Cities can contain cross-type content — show them if they match
    const cross =
      (f.types.includes('Enemy') && me.length > 0) ||
      (f.types.includes('Plant') && mp.length > 0) ||
      (f.types.includes('Ore')   && mo.length > 0) ||
      (f.types.includes('Chest') && marker.chest);
    if (!direct && !cross) return false;
  }

  const checks = [];
  f.enemies.forEach(e => checks.push(me.includes(e)));
  f.plants.forEach(p  => checks.push(mp.includes(p)));
  f.ores.forEach(o    => checks.push(mo.includes(o)));
  if (f.chest) checks.push(!!marker.chest);
  if (!checks.length) return true;
  return f.match === 'all' ? checks.every(Boolean) : checks.some(Boolean);
}

function matchesSearch(marker, q) {
  const parts = [
    marker.type, marker.name, marker.desc, marker.notes,
    marker.chest ? 'chest' : '',
    ...(marker.enemies || []).map(e => e.name),
    ...(marker.plants  || []).map(p => p.name),
    ...(marker.nodes   || []).map(o => o.name),
  ];
  return parts.join(' ').toLowerCase().includes(q);
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
    case 'Major City': {
      if (marker.icon) {
        const img = getImg(CITY_IMG_BASE + marker.icon);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.clip();
        if (img.complete) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
        else { ctx.fillStyle = '#1a2838'; ctx.fill(); }
        ctx.restore(); ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(100,180,255,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
        ctx.strokeStyle = '#4499FF'; ctx.lineWidth = Math.max(3, r * 0.25); ctx.stroke();
      }
      break;
    }
    case 'Plant':  { const n = (marker.plants  || []).reduce((s,p) => s+p.count, 0); drawNumberCircle(ctx,cx,cy,r,'#55BB55',n); break; }
    case 'Enemy':  { const n = (marker.enemies || []).reduce((s,e) => s+e.count, 0); drawNumberCircle(ctx,cx,cy,r,'#EE4444',n); break; }
    case 'Ore':    { const n = (marker.nodes   || []).reduce((s,o) => s+o.count, 0); drawNumberCircle(ctx,cx,cy,r,'#FF8C00',n); break; }
    case 'Chest': { drawStar(ctx, cx, cy, r, '#FFD700'); break; }
    case 'Dud': {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,64,64,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = '#FF4040'; ctx.lineWidth = Math.max(2, r * 0.28); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - r*0.55, cy - r*0.55); ctx.lineTo(cx + r*0.55, cy + r*0.55); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r*0.55, cy - r*0.55); ctx.lineTo(cx - r*0.55, cy + r*0.55); ctx.stroke();
      break;
    }
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
    review:   'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
    eye:      'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    search:   'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
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

// ── IconPicker ────────────────────────────────────────────────────────────────
function IconPicker({ value, onChange, items, imgBase }) {
  return (
    <div className="lm-grid">
      {items.map(({ file, label }) => (
        <button key={file} type="button" title={label}
          className={`lm-btn${value === file ? ' sel' : ''}`}
          onClick={() => onChange(file)}>
          <img src={imgBase + file} alt={label} />
        </button>
      ))}
    </div>
  );
}
function LandmarkPicker({ value, onChange }) {
  return <IconPicker value={value} onChange={onChange} items={LANDMARKS} imgBase={IMG_BASE} />;
}
function CityPicker({ value, onChange }) {
  return <IconPicker value={value} onChange={onChange} items={MAJORCITIES} imgBase={CITY_IMG_BASE} />;
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
    case 'Monument':   return { icon:'', name:'', desc:'', plants:[], enemies:[], nodes:[], chest:false, notes:'' };
    case 'Major City': return { icon:'', name:'', desc:'', plants:[], enemies:[], nodes:[], chest:false, notes:'' };
    case 'Plant':    return { plants:[], notes:'' };
    case 'Enemy':    return { enemies:[], notes:'' };
    case 'Ore':      return { nodes:[], notes:'' };
    case 'Chest':    return { notes:'' };
    case 'Dud':      return { notes:'' };
    default:         return {};
  }
}

function MarkerForm({ type, initial, onSave, onDelete, onClose, suggest }) {
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
      {type === 'Major City' && <>
        <span className="field-label">City <span className="req">*required</span></span>
        <CityPicker value={d.icon} onChange={v => set('icon', v)} />
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <Field label="Description" value={d.desc} onChange={v => set('desc', v)} area />
        <MultiPicker label="Plants"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Enemies"   options={ENEMIES}  items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Ore Nodes" options={ORES}     items={d.nodes}    onChange={v => set('nodes', v)} />
        <label className="check-row"><input type="checkbox" checked={d.chest} onChange={e => set('chest', e.target.checked)} /> Contains Chest</label>
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Plant'  && <><MultiPicker label="Plants"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Enemy'  && <><MultiPicker label="Enemies"   options={ENEMIES}  items={d.enemies}  onChange={v => set('enemies', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Ore'    && <><MultiPicker label="Ore Nodes" options={ORES}     items={d.nodes}    onChange={v => set('nodes', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Chest'  && <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />}
      {type === 'Dud'    && <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />}
      <div className="form-actions">
        <button type="button" className="btn-save" disabled={(type === 'Monument' || type === 'Major City') && !d.icon} onClick={() => onSave(d)}>
          {suggest ? 'Submit for Review' : 'Save'}
        </button>
        {onDelete && <button type="button" className="btn-del" onClick={onDelete}>{suggest ? 'Suggest Removal' : 'Delete'}</button>}
      </div>
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────
function SearchBar({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const activate = () => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); };
  const clear = () => { onChange(''); setOpen(false); };
  return (
    <div className="tb-search">
      <button className={`tb-btn${open || value ? ' tb-open' : ''}`} onClick={activate} title="Search markers">
        <Ico n="search" />
      </button>
      {(open || value) && (
        <input ref={inputRef} className="tb-search-input" value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && clear()}
          onBlur={() => { if (!value) setOpen(false); }}
          placeholder="Search…" autoFocus />
      )}
      {value && <button className="tb-search-clear" onClick={clear}>×</button>}
    </div>
  );
}

// ── PasswordPanel ─────────────────────────────────────────────────────────────
function PasswordPanel({ onAdmin, onCommenter }) {
  const [pw, setPw]       = useState('');
  const [error, setError] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => {
    if (pw === PASSWORD_ADMIN)     { onAdmin(); }
    else if (pw === PASSWORD_COMMENTER) { onCommenter(); }
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
  const [open, setOpen] = useState(false);
  const [q,    setQ]    = useState('');
  const visible = q ? options.filter(o => o.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <div className="fc-section">
      <button className="fc-header" onClick={() => setOpen(v => !v)}>
        <span className="fc-label">{label}</span>
        {selected.length > 0 && <span className="fc-sel-count">{selected.length}</span>}
        <span className="fc-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {selected.length > 0 && (
        <div className="fc-tags">
          {selected.map(s => (
            <button key={s} className="fc-tag" onClick={() => onToggle(s)}>{s} ×</button>
          ))}
        </div>
      )}
      {open && (
        <div className="fc-drop">
          <input className="fc-search" value={q} onChange={e => setQ(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`} />
          <div className="fc-list">
            {visible.map(o => (
              <button key={o} className={`fc-item${selected.includes(o) ? ' on' : ''}`}
                onClick={() => onToggle(o)}>{o}</button>
            ))}
            {visible.length === 0 && <span className="fc-none">No results</span>}
          </div>
        </div>
      )}
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
  const [showHelp,  setShowHelp]  = useState(false);
  const [showGuide, setShowGuide] = useState(false);
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

      <div className="panel-section">
        <button className="guide-btn" onClick={() => setShowHelp(v => !v)}>
          {showHelp ? '▲' : '▼'} Help
        </button>
        {showHelp && (
          <div className="guide-card">
            <ul className="guide-list">
              <li><span className="guide-key">Left click + drag</span> Pan map</li>
              <li><span className="guide-key">Scroll</span> Zoom in / out</li>
              <li><span className="guide-key">Left click marker</span> View marker details</li>
            </ul>
            <div className="guide-divider" />
            <ul className="guide-list">
              <li><span className="guide-key">Filter</span> Show or hide markers by type and content</li>
              <li><span className="guide-key">Settings</span> Adjust tint, marker scale, and pan boundary</li>
            </ul>
            <div className="guide-divider" />
            <p className="guide-sub">Unlock to edit</p>
            <ul className="guide-list">
              <li><span className="guide-key">Right click</span> Place a new marker</li>
              <li><span className="guide-key">Left click marker</span> Edit or delete marker</li>
              <li>First time editing? Read the Placement Guide below.</li>
            </ul>
          </div>
        )}
      </div>

      <div className="panel-section" style={{marginBottom:0}}>
        <button className="guide-btn" onClick={() => setShowGuide(v => !v)}>
          {showGuide ? '▲' : '▼'} Placement Guide
        </button>
        {showGuide && (
          <div className="guide-card">
            <ul className="guide-list">
              <li>Enemies, Plants, and Ore nodes found at a Monument belong inside that Monument marker</li>
              <li>Use consistent names across all markers — capitalisation included</li>
              <li>Don't overlap markers — the one underneath becomes unreachable</li>
            </ul>
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

// ── PendingSidebar ────────────────────────────────────────────────────────────
function PiMarkerDetail({ marker }) {
  if (!marker) return null;
  const enemies = marker.enemies || [];
  const plants  = marker.plants  || [];
  const nodes   = marker.nodes   || [];
  const empty   = !marker.desc && !marker.notes && !marker.chest && !enemies.length && !plants.length && !nodes.length;
  return (
    <div className="pi-detail">
      {marker.desc    && <p className="pi-text">{marker.desc}</p>}
      {marker.chest   && <p className="pi-text"><span className="pi-field">Chest</span> Yes</p>}
      {enemies.length > 0 && <p className="pi-text"><span className="pi-field">Enemies</span> {enemies.map(e=>`${e.name}×${e.count}`).join(', ')}</p>}
      {plants.length  > 0 && <p className="pi-text"><span className="pi-field">Plants</span> {plants.map(p=>`${p.name}×${p.count}`).join(', ')}</p>}
      {nodes.length   > 0 && <p className="pi-text"><span className="pi-field">Ore</span> {nodes.map(o=>`${o.name}×${o.count}`).join(', ')}</p>}
      {marker.notes   && <p className="pi-text pi-muted">{marker.notes}</p>}
      {empty          && <p className="pi-text pi-muted">No details recorded</p>}
    </div>
  );
}

function PiDiff({ original, proposed }) {
  const fields = [];
  const str  = v => v || '—';
  const arrStr = (arr) => (arr||[]).map(i=>`${i.name}×${i.count}`).join(', ') || 'none';
  if (original.name  !== proposed.name)  fields.push({ label:'Name',        from: str(original.name),  to: str(proposed.name) });
  if (original.desc  !== proposed.desc)  fields.push({ label:'Description', from: str(original.desc),  to: str(proposed.desc) });
  if (original.icon  !== proposed.icon)  fields.push({ label:'Icon',        from: str(original.icon),  to: str(proposed.icon) });
  if (original.notes !== proposed.notes) fields.push({ label:'Notes',       from: str(original.notes), to: str(proposed.notes) });
  if (original.chest !== proposed.chest) fields.push({ label:'Chest',       from: original.chest?'Yes':'No', to: proposed.chest?'Yes':'No' });
  if (JSON.stringify(original.enemies||[]) !== JSON.stringify(proposed.enemies||[])) fields.push({ label:'Enemies',  to: arrStr(proposed.enemies) });
  if (JSON.stringify(original.plants ||[]) !== JSON.stringify(proposed.plants ||[])) fields.push({ label:'Plants',   to: arrStr(proposed.plants) });
  if (JSON.stringify(original.nodes  ||[]) !== JSON.stringify(proposed.nodes  ||[])) fields.push({ label:'Ore',      to: arrStr(proposed.nodes) });
  if (fields.length === 0) return <p className="pi-text pi-muted">No content changes — position may have moved</p>;
  return (
    <div className="pi-diff">
      {fields.map(f => (
        <div key={f.label} className="pi-diff-row">
          <span className="pi-field">{f.label}</span>
          {f.from !== undefined && <><span className="pi-from">{f.from}</span><span className="pi-arrow">→</span></>}
          <span className="pi-to">{f.to}</span>
        </div>
      ))}
    </div>
  );
}

function PendingItem({ item, onApprove, onDeny, onPreview, isPreviewing }) {
  const marker = item.action === 'delete' ? item.original : item.data;
  return (
    <div className={`pi-card${isPreviewing ? ' pi-previewing' : ''}`}>
      <div className="pi-head">
        <span className={`pi-badge pi-${item.action}`}>{item.action}</span>
        <span className="pi-type" style={{ color: TYPE_COLORS[marker?.type] }}>{marker?.type}</span>
        {marker?.name && <span className="pi-name">{marker.name}</span>}
        <button className={`pi-eye${isPreviewing ? ' on' : ''}`}
          onClick={() => onPreview(isPreviewing ? null : item)}
          title={isPreviewing ? 'Clear preview' : 'Preview on map'}>
          <Ico n="eye" size={14} />
        </button>
      </div>
      {item.action === 'edit' && item.original
        ? <PiDiff original={item.original} proposed={item.data} />
        : <PiMarkerDetail marker={marker} />}
      <div className="pi-actions">
        <button className="pi-approve" onClick={onApprove}>Approve</button>
        <button className="pi-deny"    onClick={onDeny}>Deny</button>
      </div>
    </div>
  );
}

function PendingSidebar({ items, onApprove, onDeny, onPreview, previewItemId }) {
  return (
    <div className="pending-sidebar">
      <div className="pending-sidebar-head">
        <span className="panel-label" style={{marginBottom:0}}>Pending Review</span>
        {items.length > 0 && <span className="pending-count-badge">{items.length}</span>}
      </div>
      {items.length === 0
        ? <p className="pending-empty">No pending suggestions</p>
        : items.map(item => (
            <PendingItem key={item.id} item={item}
              isPreviewing={previewItemId === item.id}
              onPreview={onPreview}
              onApprove={() => onApprove(item.id)}
              onDeny={() => onDeny(item.id)} />
          ))
      }
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

  const [appMode,      setAppMode]      = useState('view');  // 'view' | 'edit' | 'suggest'
  const [tbPanel,      setTbPanel]      = useState(null);    // 'password'|'filter'|'settings'|null
  const [pendingOpen,  setPendingOpen]  = useState(false);
  const [pending,      setPending]      = useState([]);
  const [pendingTick,  setPendingTick]  = useState(0);
  const [previewItem,  setPreviewItem]  = useState(null);
  const [panel,      setPanel]      = useState(null);     // right-click placement panel
  const [editTarget, setEditTarget] = useState(null);
  const [viewCard,   setViewCard]   = useState(null);     // { id, sx, sy }

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ types:[], enemies:[], plants:[], ores:[], chest:false, match:'any' });
  const [settings, setSettings] = useState(() => {
    const def = { tint:'#1a0a00', tintOpacity:0.5, iconScale:{ Monument:1, 'Major City':1.3, Plant:0.7, Enemy:0.7, Ore:0.7, Chest:1, Dud:0.7 }, boundaryLock:true };
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (!s) return def;
      if (typeof s.iconScale === 'number') s.iconScale = { ...def.iconScale };
      if (s.iconScale.Circle !== undefined && s.iconScale['Major City'] === undefined) {
        s.iconScale['Major City'] = s.iconScale.Circle;
        delete s.iconScale.Circle;
      }
      return s;
    } catch { return def; }
  });

  // Persist settings locally (viewer prefs)
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  // Live server subscription
  useEffect(() => subscribeMarkers(setMarkers, setSync, () => setPendingTick(t => t + 1)), []);

  // Clear search when leaving view mode
  useEffect(() => { if (appMode !== 'view') setSearchQuery(''); }, [appMode]);

  // Fetch pending whenever admin mode is active or a pending-update SSE fires
  useEffect(() => {
    if (appMode !== 'edit') { setPending([]); return; }
    apiGetPending().then(r => r.json()).then(d => { if (Array.isArray(d)) setPending(d); }).catch(() => {});
  }, [appMode, pendingTick]);

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

  const searchIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set();
    markers.forEach(m => { if (matchesSearch(m, q)) ids.add(m.id); });
    return ids;
  }, [markers, searchQuery]);

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
        else if (appMode === 'edit' || appMode === 'suggest') setEditTarget({ ...hit });
      } else {
        setViewCard(null);
      }
    }
    dragRef.current.active = false;
  };

  const onContextMenu = e => {
    e.preventDefault();
    if ((appMode !== 'edit' && appMode !== 'suggest') || dragRef.current.moved) return;
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

    // For edit/delete previews, skip the original marker — drawn specially below
    const skipId = (previewItem?.action === 'edit' || previewItem?.action === 'delete')
      ? previewItem.original?.id : null;

    markers.forEach(m => {
      if (skipId && m.id === skipId) return;
      const r  = 14 * Math.sqrt(scale) * (settings.iconScale[m.type] ?? 1);
      const cx = m.x * scale + offset.x;
      const cy = m.y * scale + offset.y;
      const visible = (!filteredIds || filteredIds.has(m.id)) && (!searchIds || searchIds.has(m.id));
      ctx.globalAlpha = visible ? 1 : 0.12;
      drawMarkerOnCanvas(ctx, m, cx, cy, r, getImg);
    });
    ctx.globalAlpha = 1;

    // ── Preview overlay ───────────────────────────────────────────
    if (previewItem) {
      const { action, data: proposed, original } = previewItem;

      if (action === 'add' && proposed) {
        const r  = 14 * Math.sqrt(scale) * (settings.iconScale[proposed.type] ?? 1);
        const cx = proposed.x * scale + offset.x;
        const cy = proposed.y * scale + offset.y;
        ctx.save();
        ctx.shadowColor = '#55ffaa'; ctx.shadowBlur = 22;
        drawMarkerOnCanvas(ctx, proposed, cx, cy, r, getImg);
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r + 7, 0, 2 * Math.PI);
        ctx.strokeStyle = '#55ffaa'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]); ctx.stroke();
        ctx.restore();

      } else if (action === 'edit' && original && proposed) {
        const or = 14 * Math.sqrt(scale) * (settings.iconScale[original.type] ?? 1);
        const ocx = original.x * scale + offset.x;
        const ocy = original.y * scale + offset.y;
        ctx.globalAlpha = 0.28;
        drawMarkerOnCanvas(ctx, original, ocx, ocy, or, getImg);
        ctx.globalAlpha = 1;

        const pr = 14 * Math.sqrt(scale) * (settings.iconScale[proposed.type] ?? 1);
        const pcx = proposed.x * scale + offset.x;
        const pcy = proposed.y * scale + offset.y;
        ctx.save();
        ctx.shadowColor = '#7ecdff'; ctx.shadowBlur = 22;
        drawMarkerOnCanvas(ctx, proposed, pcx, pcy, pr, getImg);
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(pcx, pcy, pr + 7, 0, 2 * Math.PI);
        ctx.strokeStyle = '#7ecdff'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]); ctx.stroke();
        ctx.restore();

      } else if (action === 'delete' && original) {
        const r  = 14 * Math.sqrt(scale) * (settings.iconScale[original.type] ?? 1);
        const cx = original.x * scale + offset.x;
        const cy = original.y * scale + offset.y;
        ctx.globalAlpha = 0.28;
        drawMarkerOnCanvas(ctx, original, cx, cy, r, getImg);
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, r + 7, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ff4040'; ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]); ctx.stroke();
        ctx.strokeStyle = '#ff4040'; ctx.lineWidth = Math.max(2.5, r * 0.25); ctx.lineCap = 'round';
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(cx - r*0.6, cy - r*0.6); ctx.lineTo(cx + r*0.6, cy + r*0.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + r*0.6, cy - r*0.6); ctx.lineTo(cx - r*0.6, cy + r*0.6); ctx.stroke();
        ctx.restore();
      }
    }
  }, [canvasSize, markers, offset, scale, drawTick, getImg, filteredIds, searchIds, settings, previewItem]);

  // ── Helpers ───────────────────────────────────────────────────
  const lockToggle = () => {
    if (appMode === 'edit' || appMode === 'suggest') {
      setAppMode('view'); setTbPanel(null); setPanel(null); setEditTarget(null); setPendingOpen(false); setPreviewItem(null);
    } else {
      setTbPanel(t => t === 'password' ? null : 'password');
    }
  };

  const refreshPending = () => apiGetPending().then(r => r.json()).then(d => { if (Array.isArray(d)) setPending(d); }).catch(() => {});

  const handleApprove = async (id) => { if (previewItem?.id === id) setPreviewItem(null); await apiApprovePending(id); refreshPending(); };
  const handleDeny    = async (id) => { if (previewItem?.id === id) setPreviewItem(null); await apiDenyPending(id);    refreshPending(); };

  const handlePreview = useCallback((item) => {
    setPreviewItem(item);
    if (!item) return;
    const m = item.action === 'delete' ? item.original : item.data;
    if (!m) return;
    setOffset(doClamp(
      canvasSize.width  / 2 - m.x * scale,
      canvasSize.height / 2 - m.y * scale,
      scale
    ));
  }, [canvasSize, scale, doClamp]);

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
          <button className={`tb-btn${appMode==='edit'?' tb-edit':appMode==='suggest'?' tb-suggest':''}`} onClick={lockToggle}
            title={appMode==='edit' ? 'Lock (return to view)' : appMode==='suggest' ? 'Exit suggest mode' : 'Unlock'}>
            <Ico n={appMode==='view' ? 'lock' : 'unlock'} />
          </button>
          {appMode === 'view' && <SearchBar value={searchQuery} onChange={setSearchQuery} />}
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
          {appMode === 'edit' && (
            <button className={`tb-btn${pendingOpen?' tb-open':''}${pending.length>0?' tb-on':''}`}
              onClick={() => setPendingOpen(v => !v)} title="Pending review">
              <Ico n="review" />
              {pending.length > 0 && <span className="pending-badge-dot">{pending.length}</span>}
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
          <PasswordPanel
            onAdmin={()     => { setAppMode('edit');    setTbPanel(null); }}
            onCommenter={()  => { setAppMode('suggest'); setTbPanel(null); }} />
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
            <MarkerForm type={panel.type} initial={{}} suggest={appMode==='suggest'}
              onSave={data => {
                const m = { id:generateId(), x:panel.worldX, y:panel.worldY, type:panel.type, ...data };
                if (appMode === 'suggest')
                  apiSuggest({ id:generateId(), action:'add', marker_id:m.id, data:m, original:null });
                else
                  apiAdd(m);
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
            <MarkerForm type={editTarget.type} initial={editTarget} suggest={appMode==='suggest'}
              onSave={data => {
                const updated = { ...editTarget, ...data };
                if (appMode === 'suggest')
                  apiSuggest({ id:generateId(), action:'edit', marker_id:updated.id, data:updated, original:editTarget });
                else
                  apiUpdate(updated);
                setEditTarget(null);
              }}
              onDelete={() => {
                if (appMode === 'suggest')
                  apiSuggest({ id:generateId(), action:'delete', marker_id:editTarget.id, data:null, original:editTarget });
                else
                  apiDelete(editTarget.id);
                setEditTarget(null);
              }}
              onClose={() => setEditTarget(null)} />
          </div>
        </div>
      )}

      {/* ── Pending sidebar ── */}
      {pendingOpen && appMode === 'edit' && (
        <PendingSidebar items={pending} onApprove={handleApprove} onDeny={handleDeny}
          onPreview={handlePreview} previewItemId={previewItem?.id} />
      )}

      {/* ── View card ── */}
      {viewMarker && (
        <ViewCard marker={viewMarker} sx={viewCard.sx} sy={viewCard.sy} onClose={() => setViewCard(null)} />
      )}
    </div>
  );
}

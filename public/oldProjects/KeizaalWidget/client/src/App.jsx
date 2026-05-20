import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { subscribeMarkers, apiAdd, apiUpdate, apiDelete, apiSuggest, apiGetPending, apiApprovePending, apiDenyPending, apiLogAuth, apiGetAuthLog, setSessionAuth } from './api';
import './App.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORAGE_KEY  = 'keizaal-markers';
const SETTINGS_KEY = 'keizaal-settings';
const EXTRAS_KEY   = 'keizaal-extras';
const FRIENDS_KEY  = 'keizaal-friends';
const BACKPACK_KEY = 'keizaal-backpack';
const SESSION_KEY  = 'kw_session';
const NAME_KEY     = 'kw_name';
const SESSION_TTL  = 12 * 60 * 60 * 1000;

function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (s && s.expires > Date.now()) return { name: s.name, level: s.level };
  } catch {}
  return null;
}
function saveSession(name, level) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, level, expires: Date.now() + SESSION_TTL }));
  localStorage.setItem(NAME_KEY, name);
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
function pwForLevel(level) {
  return level === 'admin' ? PASSWORD_ADMIN : PASSWORD_COMMENTER;
}

const BACKPACK_CATS = [
  'Weapons','Apparel','Potions','Ingredients','Food',
  'Scrolls','Books','Soul Gems','Keys','Misc',
];

const WORKSTATIONS = [
  'Alchemy Lab','Cooking Pot','Enchanting Table','Forge',
  'Grindstone','Smelter','Tanning Rack','Workbench',
];
const IMG_BASE      = '/oldProjects/KeizaalWidget/images/landmarks/';
const CITY_IMG_BASE = '/oldProjects/KeizaalWidget/images/majorcities/';
const TOOLBAR_H   = 44;
const PASSWORD_ADMIN     = 'lizard';
const PASSWORD_COMMENTER = 'bigwetnoodle';

const ENEMIES  = ['Bear','Bloodhound','Cave Bear','Chaurus','Deer','Elementals','Falmer','Falmer Wizard','Falmer Warlord','Frost Skeleton','Frost Troll','Frostbite Spider','Giant','Goats','Horkers','Ice Wolves','Mammoth','Mudcrabs','Sabre Cat','Skeleton','Slaughterfish','Spriggan','Spriggan Earth Mother','Trolls','Wolves'];
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
  'Apple','Charred Skeever','Chicken Egg','Clam','Egg Sac','Honey',
  'Jazbay','Juniper','Mammoth Cheese','Namira\'s Rot','Pine Thrush Egg','Torch',
];
const ORES     = ['Coal','Copper','Corundum','Dwarven','Ebony','Gold','Iron','Malachite','Moonstone','Orichalcum','Quicksilver','Silver','Steel'];

const PREMIUM  = new Set(['Torch','Dwarven','Ebony','Moonstone','Quicksilver']);

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

const TYPES = ['Monument','Major City','Rumor','Plant','Enemy','Ore','Workstation','Chest','Dud'];
const TYPE_LABELS = { Plant: 'Forage' }; // display name overrides; internal type stays 'Plant'

const TYPE_COLORS = {
  Monument:'#FFD700', 'Major City':'#4499FF', 'Rumor':'#BB88FF',
  Plant:'#55BB55', Enemy:'#EE4444', Ore:'#FF8C00', Workstation:'#CC7722', Chest:'#FFD700', Dud:'#FF4040',
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
  const me = (marker.enemies      || []).map(e => e.name);
  const mp = (marker.plants       || []).map(p => p.name);
  const mo = (marker.nodes        || []).map(o => o.name);
  const mw = (marker.workstations || []);

  if (f.types.length > 0) {
    const direct = f.types.includes(marker.type);
    const cross =
      (f.types.includes('Enemy')       && me.length > 0) ||
      (f.types.includes('Plant')        && mp.length > 0) ||
      (f.types.includes('Ore')          && mo.length > 0) ||
      (f.types.includes('Workstation')  && mw.length > 0) ||
      (f.types.includes('Chest')        && marker.chest);
    if (!direct && !cross) return false;
  }

  const checks = [];
  f.enemies.forEach(e     => checks.push(me.includes(e)));
  f.plants.forEach(p      => checks.push(mp.includes(p)));
  f.ores.forEach(o        => checks.push(mo.includes(o)));
  f.workstations.forEach(w => checks.push(mw.includes(w)));
  if (!checks.length) return true;
  return f.match === 'all' ? checks.every(Boolean) : checks.some(Boolean);
}

function matchesSearch(marker, q) {
  const parts = [
    marker.type, marker.name, marker.desc, marker.notes,
    marker.chest ? 'chest' : '',
    ...(marker.enemies      || []).map(e => e.name),
    ...(marker.plants       || []).map(p => p.name),
    ...(marker.nodes        || []).map(o => o.name),
    ...(marker.workstations || []),
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

function drawLetterCircle(ctx, cx, cy, r, color, letter) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(9, r * 0.9)}px Inter,sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(letter, cx, cy);
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
    case 'Rumor': {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(180,136,255,0.18)'; ctx.fill();
      ctx.strokeStyle = '#BB88FF'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#CC99FF';
      ctx.font = `bold ${Math.max(10, r * 1.15)}px Inter,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy + 1);
      break;
    }
    case 'Plant':       { const n = (marker.plants  || []).reduce((s,p) => s+p.count, 0); drawNumberCircle(ctx,cx,cy,r,'#55BB55',n); break; }
    case 'Enemy':       { const n = (marker.enemies || []).reduce((s,e) => s+e.count, 0); drawNumberCircle(ctx,cx,cy,r,'#EE4444',n); break; }
    case 'Ore':         { const n = (marker.nodes   || []).reduce((s,o) => s+o.count, 0); drawNumberCircle(ctx,cx,cy,r,'#FF8C00',n); break; }
    case 'Workstation': { drawLetterCircle(ctx, cx, cy, r, '#CC7722', 'W'); break; }
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
    extras:   'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z',
    chevron:  'M6 9l6 6 6-6',
    people:   'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
    bag:      'M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3h-6c0-1.66 1.34-3 3-3zm0 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
    log:      'M3 3h18v2H3zm0 4h18v2H3zm0 4h12v2H3zm0 4h12v2H3zm11 3l5-3-5-3v6z',
  }[n] || '';
  const stroke = n === 'chevron';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2.5 : 0}
      strokeLinecap={stroke ? 'round' : undefined}
      strokeLinejoin={stroke ? 'round' : undefined}>
      <path d={d}/>
    </svg>
  );
}

// ── MultiPicker ───────────────────────────────────────────────────────────────
function MultiPicker({ label, options, items, onChange }) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);
  const [qty,   setQty]   = useState(1);
  const wrapRef = useRef(null);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const pick = name => {
    const ex = items.find(i => i.name === name);
    onChange(ex
      ? items.map(i => i.name === name ? { ...i, count: i.count + qty } : i)
      : [...items, { name, count: qty }]);
    setQuery(''); setOpen(false); setQty(1);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  return (
    <div className="multi-picker">
      <span className="field-label">{label}</span>
      <div className="mp-row">
        <div className="mp-search-wrap" ref={wrapRef}>
          <input
            className="mp-search"
            value={query}
            placeholder="Search…"
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && filtered.length > 0 && (
            <div className="mp-drop">
              {filtered.map(o => (
                <button key={o} type="button" className="mp-option"
                  onPointerDown={e => { e.preventDefault(); pick(o); }}>
                  {o}
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="number" min="1" max="99" value={qty}
          onChange={e => setQty(Math.max(1, +e.target.value || 1))} className="qty-inp" />
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

// ── WorkstationPicker ─────────────────────────────────────────────────────────
function WorkstationPicker({ value = [], onChange }) {
  const toggle = w => onChange(value.includes(w) ? value.filter(x => x !== w) : [...value, w]);
  return (
    <div className="ws-grid">
      {WORKSTATIONS.map(w => (
        <button key={w} type="button" className={`ws-btn${value.includes(w) ? ' on' : ''}`}
          onClick={() => toggle(w)}>{w}</button>
      ))}
    </div>
  );
}

// ── MarkerForm ────────────────────────────────────────────────────────────────
function getInitial(type) {
  switch (type) {
    case 'Monument':    return { icon:'', name:'', plants:[], enemies:[], nodes:[], workstations:[], chest:false, notes:'' };
    case 'Major City':  return { icon:'', name:'', plants:[], enemies:[], nodes:[], workstations:[], chest:false, notes:'' };
    case 'Rumor':       return { name:'', enemies:[], plants:[], nodes:[], workstations:[], notes:'' };
    case 'Plant':       return { plants:[], notes:'' };
    case 'Enemy':       return { enemies:[], notes:'' };
    case 'Ore':         return { nodes:[], notes:'' };
    case 'Workstation': return { workstations:[], notes:'' };
    case 'Chest':       return { notes:'' };
    case 'Dud':         return { notes:'' };
    default:            return {};
  }
}

function MarkerForm({ type, initial, onSave, onDelete, onClose, suggest }) {
  const [d, setD] = useState(() => ({ ...getInitial(type), ...initial }));
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  return (
    <div className="marker-form">
      <div className="form-head">
        <span className="form-title">{TYPE_LABELS[type] || type}</span>
        <button type="button" className="form-x" onClick={onClose}>×</button>
      </div>
      {type === 'Monument' && <>
        <span className="field-label">Icon <span className="req">*required</span></span>
        <LandmarkPicker value={d.icon} onChange={v => set('icon', v)} />
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <MultiPicker label="Enemies"    options={ENEMIES} items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Forage"     options={PLANTS}  items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Ore Nodes"  options={ORES}    items={d.nodes}    onChange={v => set('nodes', v)} />
        <span className="field-label" style={{marginTop:4}}>Workstations</span>
        <WorkstationPicker value={d.workstations} onChange={v => set('workstations', v)} />
        <label className="check-row"><input type="checkbox" checked={d.chest} onChange={e => set('chest', e.target.checked)} /> Contains Chest</label>
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Major City' && <>
        <span className="field-label">City <span className="req">*required</span></span>
        <CityPicker value={d.icon} onChange={v => set('icon', v)} />
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <MultiPicker label="Enemies"    options={ENEMIES} items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Forage"     options={PLANTS}  items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Ore Nodes"  options={ORES}    items={d.nodes}    onChange={v => set('nodes', v)} />
        <span className="field-label" style={{marginTop:4}}>Workstations</span>
        <WorkstationPicker value={d.workstations} onChange={v => set('workstations', v)} />
        <label className="check-row"><input type="checkbox" checked={d.chest} onChange={e => set('chest', e.target.checked)} /> Contains Chest</label>
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Rumor' && <>
        <Field label="Name" value={d.name} onChange={v => set('name', v)} />
        <MultiPicker label="Enemies"    options={ENEMIES} items={d.enemies}  onChange={v => set('enemies', v)} />
        <MultiPicker label="Forage"     options={PLANTS}  items={d.plants}   onChange={v => set('plants', v)} />
        <MultiPicker label="Ore Nodes"  options={ORES}    items={d.nodes}    onChange={v => set('nodes', v)} />
        <span className="field-label" style={{marginTop:4}}>Workstations</span>
        <WorkstationPicker value={d.workstations} onChange={v => set('workstations', v)} />
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
      {type === 'Plant'  && <><MultiPicker label="Forage"    options={PLANTS}   items={d.plants}   onChange={v => set('plants', v)} /><Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area /></>}
      {type === 'Workstation' && <>
        <span className="field-label">Workstations</span>
        <WorkstationPicker value={d.workstations} onChange={v => set('workstations', v)} />
        <Field label="Notes" value={d.notes} onChange={v => set('notes', v)} area />
      </>}
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
      <button className={`fc-header${open ? ' open' : ''}`} onClick={() => setOpen(v => !v)}>
        <span className="fc-label">{label}</span>
        {selected.length > 0 && <span className="fc-sel-count">{selected.length}</span>}
        <span className="fc-arrow"><Ico n="chevron" size={12} /></span>
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
function FilterPanel({ filter, onChange, total = 0, visible = 0, adminUnlocked = false }) {
  const tog = (field, val) => {
    const arr = filter[field];
    onChange({ ...filter, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };
  const clear = () => onChange({ types:[], enemies:[], plants:[], ores:[], workstations:[], match:'any' });
  const hasAny = filter.types.length || filter.enemies.length || filter.plants.length || filter.ores.length || filter.workstations.length;
  const isFiltered = hasAny > 0;
  return (
    <div className="tb-panel filter-panel" onPointerDown={e => e.stopPropagation()}>
      <div className="fp-count">
        <span className="fp-count-num" style={isFiltered ? { color: '#7ecdff' } : {}}>
          {visible}
        </span>
        <span className="fp-count-of">
          {isFiltered ? ` / ${total} points showing` : ` points on map`}
        </span>
      </div>
      <div className="panel-section">
        <span className="panel-label">Point Type</span>
        <div className="chip-wrap">
          {TYPES.map(t => (
            <button key={t} className={`chip${filter.types.includes(t) ? ' on' : ''}`}
              style={filter.types.includes(t) ? { borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] } : {}}
              onClick={() => tog('types', t)}>{TYPE_LABELS[t] || t}</button>
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
      <FilterChips label="Enemies"      options={ENEMIES}      selected={filter.enemies}      onToggle={v => tog('enemies', v)} />
      <FilterChips label="Forage"       options={adminUnlocked ? PLANTS : PLANTS.filter(p => !PREMIUM.has(p))} selected={filter.plants}       onToggle={v => tog('plants', v)} />
      <FilterChips label="Ores"         options={adminUnlocked ? ORES   : ORES.filter(o => !PREMIUM.has(o))}   selected={filter.ores}         onToggle={v => tog('ores', v)} />
      <FilterChips label="Workstations" options={WORKSTATIONS} selected={filter.workstations} onToggle={v => tog('workstations', v)} />
      {hasAny > 0 && <button className="clear-btn" onClick={clear}>Clear All</button>}
    </div>
  );
}

// ── SettingsPanel ─────────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, extras, onExtrasChange }) {
  const [showScale,  setShowScale]  = useState(false);
  const [showHelp,   setShowHelp]   = useState(false);
  const [showGuide,  setShowGuide]  = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  return (
    <div className="tb-panel settings-panel" onPointerDown={e => e.stopPropagation()}>

      {/* ── Map tint ── */}
      <div className="sp-row">
        <span className="sp-label">Tint</span>
        <input type="color" className="sp-color" value={settings.tint}
          onChange={e => onChange({...settings, tint: e.target.value})} />
        <input type="range" className="sp-range" min="0" max="0.75" step="0.05"
          value={settings.tintOpacity}
          onChange={e => onChange({...settings, tintOpacity: +e.target.value})} />
        <span className="sp-val">{Math.round(settings.tintOpacity * 100)}%</span>
      </div>

      {/* ── Boundary lock ── */}
      <label className="sp-check">
        <input type="checkbox" checked={settings.boundaryLock}
          onChange={e => onChange({...settings, boundaryLock: e.target.checked})} />
        Lock pan to boundary
      </label>

      <div className="sp-divider" />

      {/* ── Marker scale (collapsible) ── */}
      <button className={`sp-collapse${showScale ? ' open' : ''}`} onClick={() => setShowScale(v => !v)}>
        <span>Marker Scale</span><Ico n="chevron" size={13} />
      </button>
      {showScale && (
        <div className="sp-scale-list">
          {TYPES.map(t => (
            <div key={t} className="sp-scale-row">
              <span className="sp-scale-type" style={{ color: TYPE_COLORS[t] }}>{TYPE_LABELS[t] || t}</span>
              <input type="range" min="0.4" max="2.5" step="0.1"
                value={settings.iconScale[t] ?? 1}
                onChange={e => onChange({ ...settings, iconScale: { ...settings.iconScale, [t]: +e.target.value } })} />
              <span className="sp-val">{(settings.iconScale[t] ?? 1).toFixed(1)}×</span>
            </div>
          ))}
        </div>
      )}

      <div className="sp-divider" />

      {/* ── Help ── */}
      <button className={`sp-collapse${showHelp ? ' open' : ''}`} onClick={() => setShowHelp(v => !v)}>
        <span>Help</span><Ico n="chevron" size={13} />
      </button>
      {showHelp && (
        <div className="sp-card">
          <p className="guide-sub">Desktop</p>
          <ul className="guide-list">
            <li><span className="guide-key">Click + drag</span> Pan map</li>
            <li><span className="guide-key">Scroll wheel</span> Zoom in / out</li>
            <li><span className="guide-key">Click marker</span> View details</li>
          </ul>
          <div className="guide-divider" />
          <p className="guide-sub">Mobile</p>
          <ul className="guide-list">
            <li><span className="guide-key">Touch + drag</span> Pan map</li>
            <li><span className="guide-key">Pinch</span> Zoom in / out</li>
            <li><span className="guide-key">Tap marker</span> View details</li>
          </ul>
          <div className="guide-divider" />
          <ul className="guide-list">
            <li><span className="guide-key">Filter</span> Show or hide markers by type</li>
            <li><span className="guide-key">Settings</span> Adjust tint, scale, and pan</li>
          </ul>
          <div className="guide-divider" />
          <p className="guide-sub">Unlock to edit</p>
          <ul className="guide-list">
            <li><span className="guide-key">Right click / Long press</span> Place a marker</li>
            <li><span className="guide-key">Click / Tap marker</span> Edit or delete</li>
          </ul>
        </div>
      )}

      {/* ── Placement guide ── */}
      <button className={`sp-collapse${showGuide ? ' open' : ''}`} onClick={() => setShowGuide(v => !v)}>
        <span>Placement Guide</span><Ico n="chevron" size={13} />
      </button>
      {showGuide && (
        <div className="sp-card">
          <ul className="guide-list">
            <li>Enemies, Forage, and Ore nodes found at a location belong inside that Monument marker</li>
            <li>Use consistent names across all markers — capitalisation included</li>
            <li>Don't overlap markers — the one underneath becomes unreachable</li>
          </ul>
        </div>
      )}

      <div className="sp-divider" />

      {/* ── Extras ── */}
      <button className={`extras-btn${showExtras ? ' open' : ''}`} onClick={() => setShowExtras(v => !v)}>
        <Ico n="extras" size={14} />
        <span style={{flex:1, textAlign:'left'}}>Extras</span>
        <Ico n="chevron" size={13} />
      </button>
      {showExtras && (
        <div className="extras-card">
          <p className="extras-notice">
            Saved in your browser only — not synced across devices.
          </p>
          <label className="sp-check" style={{marginBottom:4}}>
            <input type="checkbox" checked={extras.friends}
              onChange={e => onExtrasChange({...extras, friends: e.target.checked})} />
            Friends List
          </label>
          <label className="sp-check">
            <input type="checkbox" checked={extras.backpack}
              onChange={e => onExtrasChange({...extras, backpack: e.target.checked})} />
            Backpack Tracker
          </label>
        </div>
      )}
    </div>
  );
}

// ── ViewCard ──────────────────────────────────────────────────────────────────
function VCSection({ label, color, items, noCount }) {
  if (!items?.length) return null;
  return (
    <div className="vc-section" style={{ '--vc-sec': color }}>
      <span className="vc-sec-label">{label}</span>
      {items.map(item => (
        <div key={item.name ?? item} className="vc-sec-row">
          <span className="vc-sec-name">{item.name ?? item}</span>
          {!noCount && <span className="vc-sec-count">×{item.count}</span>}
        </div>
      ))}
    </div>
  );
}

function ViewCard({ marker, sx, sy, onClose }) {
  const W = 260;
  let cx = sx + 20, cy = sy - 50;
  if (cx + W > window.innerWidth  - 8) cx = sx - W - 20;
  if (cy < TOOLBAR_H + 8)              cy = TOOLBAR_H + 8;
  if (cy + 340 > window.innerHeight - 8) cy = window.innerHeight - 348;
  return (
    <div className="view-card" style={{ left: Math.max(8, cx), top: cy }}
      onPointerDown={e => e.stopPropagation()}>
      <div className="vc-head">
        <span className="vc-type" style={{ color: TYPE_COLORS[marker.type] }}>{TYPE_LABELS[marker.type] || marker.type}</span>
        {marker.name && <span className="vc-name">{marker.name}</span>}
        <button className="vc-x" onClick={onClose}>×</button>
      </div>
      <div className="vc-body">
        {marker.chest && <div className="vc-chest">⭐ Contains Chest</div>}
        <VCSection label="Enemies"      color="#EE4444" items={marker.enemies} />
        <VCSection label="Forage"       color="#55BB55" items={marker.plants}  />
        <VCSection label="Ore Nodes"    color="#FF8C00" items={marker.nodes}   />
        <VCSection label="Workstations" color="#CC7722" items={marker.workstations} noCount />
        {marker.notes && <p className="vc-notes">{marker.notes}</p>}
        {!marker.chest && !marker.enemies?.length && !marker.plants?.length && !marker.nodes?.length && !marker.workstations?.length && !marker.notes && (
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
  const empty   = !marker.notes && !marker.chest && !enemies.length && !plants.length && !nodes.length && !marker.workstations?.length;
  return (
    <div className="pi-detail">
      {marker.chest   && <p className="pi-text"><span className="pi-field">Chest</span> Yes</p>}
      {enemies.length > 0 && <p className="pi-text"><span className="pi-field">Enemies</span> {enemies.map(e=>`${e.name}×${e.count}`).join(', ')}</p>}
      {plants.length  > 0 && <p className="pi-text"><span className="pi-field">Forage</span> {plants.map(p=>`${p.name}×${p.count}`).join(', ')}</p>}
      {nodes.length   > 0 && <p className="pi-text"><span className="pi-field">Ore</span> {nodes.map(o=>`${o.name}×${o.count}`).join(', ')}</p>}
      {marker.workstations?.length > 0 && <p className="pi-text"><span className="pi-field">Stations</span> {marker.workstations.join(', ')}</p>}
      {marker.notes   && <p className="pi-text pi-muted">{marker.notes}</p>}
      {empty          && <p className="pi-text pi-muted">No details recorded</p>}
    </div>
  );
}

function PiDiff({ original, proposed }) {
  const fields = [];
  const str  = v => v || '—';
  const arrStr = (arr) => (arr||[]).map(i=>`${i.name}×${i.count}`).join(', ') || 'none';
  if (original.name  !== proposed.name)  fields.push({ label:'Name', from: str(original.name), to: str(proposed.name) });
  if (original.icon  !== proposed.icon)  fields.push({ label:'Icon', from: str(original.icon), to: str(proposed.icon) });
  if (original.notes !== proposed.notes) fields.push({ label:'Notes',       from: str(original.notes), to: str(proposed.notes) });
  if (original.chest !== proposed.chest) fields.push({ label:'Chest',       from: original.chest?'Yes':'No', to: proposed.chest?'Yes':'No' });
  if (JSON.stringify(original.enemies||[]) !== JSON.stringify(proposed.enemies||[])) fields.push({ label:'Enemies', to: arrStr(proposed.enemies) });
  if (JSON.stringify(original.plants ||[]) !== JSON.stringify(proposed.plants ||[])) fields.push({ label:'Forage',  to: arrStr(proposed.plants) });
  if (JSON.stringify(original.nodes        ||[]) !== JSON.stringify(proposed.nodes        ||[])) fields.push({ label:'Ore',      to: arrStr(proposed.nodes) });
  if (JSON.stringify(original.workstations||[]) !== JSON.stringify(proposed.workstations||[])) fields.push({ label:'Stations', to: (proposed.workstations||[]).join(', ')||'none' });
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
        <span className="pi-type" style={{ color: TYPE_COLORS[marker?.type] }}>{TYPE_LABELS[marker?.type] || marker?.type}</span>
        {marker?.name && <span className="pi-name">{marker.name}</span>}
        {item.submitted_by && <span className="pi-submitter">{item.submitted_by}</span>}
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

// ── FriendsSidebar ────────────────────────────────────────────────────────────
function FriendsSidebar({ onClose }) {
  const [friends, setFriends] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch { return []; }
  });
  const [name,  setName]  = useState('');
  const [notes, setNotes] = useState('');

  const save = list => { setFriends(list); localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)); };
  const add  = () => {
    if (!name.trim()) return;
    save([...friends, { id: generateId(), name: name.trim(), notes: notes.trim() }]);
    setName(''); setNotes('');
  };

  return (
    <div className="extra-sidebar">
      <div className="extra-sidebar-head">
        <span className="panel-label" style={{marginBottom:0}}>Friends</span>
        <button className="extra-close" onClick={onClose}>×</button>
      </div>
      <div className="extra-add-form">
        <input className="extra-input" placeholder="Name" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <textarea className="extra-textarea" placeholder="Notes (optional)" value={notes}
          onChange={e => setNotes(e.target.value)} rows={2} />
        <button className="extra-add-btn" onClick={add} disabled={!name.trim()}>Add Friend</button>
      </div>
      {friends.length === 0
        ? <p className="extra-empty">No friends added yet</p>
        : friends.map(f => (
          <div key={f.id} className="extra-card">
            <div className="extra-card-head">
              <span className="extra-card-name">{f.name}</span>
              <button className="extra-card-del" onClick={() => save(friends.filter(x => x.id !== f.id))}>×</button>
            </div>
            {f.notes && <p className="extra-card-notes">{f.notes}</p>}
          </div>
        ))
      }
    </div>
  );
}

// ── BackpackSidebar ───────────────────────────────────────────────────────────
function BackpackSidebar({ onClose }) {
  const [items,    setItems]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(BACKPACK_KEY) || '[]'); } catch { return []; }
  });
  const [name,     setName]     = useState('');
  const [category, setCategory] = useState('Misc');
  const [price,    setPrice]    = useState('');
  const [catFilter, setCatFilter] = useState('All');

  const save = list => { setItems(list); localStorage.setItem(BACKPACK_KEY, JSON.stringify(list)); };
  const add  = () => {
    if (!name.trim()) return;
    save([...items, { id: generateId(), name: name.trim(), category, price: parseFloat(price) || 0 }]);
    setName(''); setPrice('');
  };

  const total   = items.reduce((s, i) => s + i.price, 0);
  const visible = (catFilter === 'All' ? items : items.filter(i => i.category === catFilter))
    .slice().sort((a, b) => a.name.localeCompare(b.name));
  const usedCats = new Set(items.map(i => i.category));

  return (
    <div className="extra-sidebar">
      <div className="extra-sidebar-head">
        <span className="panel-label" style={{marginBottom:0}}>Backpack</span>
        {items.length > 0 && <span className="extra-gold">{total.toLocaleString()} septims</span>}
        <button className="extra-close" onClick={onClose}>×</button>
      </div>

      {/* Category filter */}
      <div className="bp-cat-wrap">
        {['All', ...BACKPACK_CATS].filter(c => c === 'All' || usedCats.has(c)).map(c => (
          <button key={c} className={`bp-cat${catFilter === c ? ' on' : ''}`}
            onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Add form */}
      <div className="extra-add-form">
        <input className="extra-input" placeholder="Item name" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <div className="bp-add-row">
          <select className="bp-cat-sel" value={category} onChange={e => setCategory(e.target.value)}>
            {BACKPACK_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="bp-price-inp" type="number" min="0" step="1" placeholder="Price"
            value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <button className="extra-add-btn" onClick={add} disabled={!name.trim()}>Add Item</button>
      </div>

      {visible.length === 0
        ? <p className="extra-empty">{catFilter === 'All' ? 'Backpack is empty' : `No ${catFilter} items`}</p>
        : visible.map(item => (
          <div key={item.id} className="extra-card">
            <div className="extra-card-head">
              <span className="bp-item-cat">{item.category}</span>
              <span className="extra-card-name">{item.name}</span>
              {item.price > 0 && <span className="bp-item-price">{item.price.toLocaleString()} g</span>}
              <button className="extra-card-del" onClick={() => save(items.filter(x => x.id !== item.id))}>×</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── LoginScreen ───────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const savedName = localStorage.getItem(NAME_KEY) || '';
  const [name,  setName]  = useState(savedName);
  const [pw,    setPw]    = useState('');
  const [error, setError] = useState('');
  const pwRef   = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    (savedName ? pwRef : nameRef).current?.focus();
  }, [savedName]);

  const submit = () => {
    const resolvedName = savedName || name.trim();
    if (!resolvedName) { setError('In-Game Name is required'); return; }
    let level = null;
    if (pw === PASSWORD_ADMIN)     level = 'admin';
    else if (pw === PASSWORD_COMMENTER) level = 'commenter';
    if (!level) {
      setError('Incorrect password');
      setPw('');
      setTimeout(() => pwRef.current?.focus(), 0);
      return;
    }
    saveSession(resolvedName, level);
    setSessionAuth(pw);
    apiLogAuth({ name: resolvedName, accessLevel: level }).catch(() => {});
    onLogin({ name: resolvedName, level });
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1 className="login-title">Children of the Hist</h1>
        {savedName
          ? <p className="login-greeting">Welcome back, <strong>{savedName}</strong></p>
          : (
            <div className="login-field">
              <label className="login-label">In-Game Name</label>
              <input ref={nameRef} type="text" className="login-input" value={name}
                placeholder="Your character's name"
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && pwRef.current?.focus()} />
            </div>
          )
        }
        <div className="login-field">
          <label className="login-label">Password</label>
          <input ref={pwRef} type="password" className={`login-input${error ? ' login-input-err' : ''}`}
            value={pw} placeholder="••••••"
            onChange={e => { setPw(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button className="login-btn" onClick={submit}>Enter</button>
      </div>
    </div>
  );
}

// ── LogsPanel ─────────────────────────────────────────────────────────────────
function LogsPanel() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAuthLog()
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLogs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  };

  return (
    <div className="tb-panel logs-panel" onPointerDown={e => e.stopPropagation()}>
      <span className="panel-label">Access Log</span>
      {loading
        ? <p className="logs-empty">Loading…</p>
        : logs.length === 0
          ? <p className="logs-empty">No entries yet</p>
          : logs.map(l => (
              <div key={l.id} className="log-row">
                <span className="log-name">{l.name}</span>
                <span className={`log-level log-level-${l.access_level}`}>{l.access_level}</span>
                <span className="log-time">{fmt(l.logged_at)}</span>
              </div>
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
  const dragRef      = useRef({ active:false, startX:0, startY:0, startOffsetX:0, startOffsetY:0, moved:false });
  const ptrCache     = useRef(new Map());
  const pinchRef     = useRef(null);
  const longPressRef = useRef(null);

  const cH = () => window.innerHeight - TOOLBAR_H;

  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: cH() });
  const [scale,  setScale]  = useState(1);
  const [offset, setOffset] = useState({ x:0, y:0 });
  const [markers, setMarkers] = useState([]);
  const [sync, setSync] = useState('connecting'); // 'connecting'|'live'|'error'
  const [authSession, setAuthSession] = useState(() => {
    const s = loadSession();
    if (s) setSessionAuth(pwForLevel(s.level));
    return s;
  });
  const adminUnlocked = authSession?.level === 'admin';

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
  const [filter, setFilter] = useState({ types:[], enemies:[], plants:[], ores:[], workstations:[], match:'any' });
  const [extras, setExtras] = useState(() => {
    try { return { friends:false, backpack:false, ...JSON.parse(localStorage.getItem(EXTRAS_KEY) || '{}') }; }
    catch { return { friends:false, backpack:false }; }
  });
  const [extraOpen, setExtraOpen] = useState(null); // null | 'friends' | 'backpack'
  const [showSettingsHint, setShowSettingsHint] = useState(() => !localStorage.getItem('keizaal-seen-settings'));
  const [settings, setSettings] = useState(() => {
    const def = { tint:'#1a0a00', tintOpacity:0.5, iconScale:{ Monument:1, 'Major City':1.3, Rumor:0.9, Plant:0.7, Enemy:0.7, Ore:0.7, Workstation:1, Chest:1, Dud:0.7 }, boundaryLock:true };
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
  useEffect(() => { localStorage.setItem(EXTRAS_KEY,   JSON.stringify(extras));   }, [extras]);
  useEffect(() => {
    if (extraOpen === 'friends'  && !extras.friends)  setExtraOpen(null);
    if (extraOpen === 'backpack' && !extras.backpack) setExtraOpen(null);
  }, [extras, extraOpen]);

  // Live server subscription — only starts once authenticated
  const isAuthed = !!authSession;
  useEffect(() => {
    if (!isAuthed) return;
    return subscribeMarkers(setMarkers, setSync, () => setPendingTick(t => t + 1));
  }, [isAuthed]);

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

  // Strip premium items from display when not admin-unlocked
  const displayMarkers = useMemo(() => {
    if (adminUnlocked) return markers;
    return markers.map(m => {
      const plants = (m.plants || []).filter(p => !PREMIUM.has(p.name));
      const nodes  = (m.nodes  || []).filter(o => !PREMIUM.has(o.name));
      const _hadPremium = plants.length < (m.plants?.length || 0) || nodes.length < (m.nodes?.length || 0);
      return { ...m, plants, nodes, _hadPremium };
    });
  }, [markers, adminUnlocked]);

  // Filter computation
  const filteredIds = useMemo(() => {
    const active = filter.types.length || filter.enemies.length || filter.plants.length || filter.ores.length || filter.workstations.length;
    if (!active) return null;
    const ids = new Set();
    markers.forEach(m => { if (matchesFilter(m, filter)) ids.add(m.id); });
    return ids;
  }, [markers, filter]);

  const searchIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set();
    displayMarkers.forEach(m => { if (matchesSearch(m, q)) ids.add(m.id); });
    return ids;
  }, [displayMarkers, searchQuery]);

  const visibleCount = useMemo(() => {
    if (!filteredIds && !searchIds) return markers.length;
    return markers.filter(m =>
      (!filteredIds || filteredIds.has(m.id)) &&
      (!searchIds   || searchIds.has(m.id))
    ).length;
  }, [markers, filteredIds, searchIds]);

  // ── Pointer ───────────────────────────────────────────────────
  const clearLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };

  const onPointerDown = e => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    ptrCache.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ptrCache.current.size >= 2) {
      // Second finger — enter pinch mode, cancel any ongoing drag/long-press
      clearLongPress();
      dragRef.current.active = false;
      pinchRef.current = null;
      return;
    }

    // Mouse: only left button; touch: always proceed
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    if (tbPanel) { setTbPanel(null); return; }
    if (panel)   { setPanel(null);   return; }

    if (e.pointerType !== 'touch') e.currentTarget.style.cursor = 'grabbing';
    dragRef.current = { active:true, startX:e.clientX, startY:e.clientY, startOffsetX:offset.x, startOffsetY:offset.y, moved:false };

    // Long-press → placement menu (replaces right-click on touch)
    if (e.pointerType === 'touch' && (appMode === 'edit' || appMode === 'suggest')) {
      const ex = e.clientX, ey = e.clientY;
      longPressRef.current = setTimeout(() => {
        if (dragRef.current.active && !dragRef.current.moved) {
          dragRef.current.active = false;
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const world = canvasToWorld(ex - rect.left, ey - rect.top);
          setPanel({ mode:'menu', screenX:ex, screenY:ey, worldX:world.x, worldY:world.y });
        }
      }, 550);
    }
  };

  const onPointerMove = e => {
    ptrCache.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const count = ptrCache.current.size;

    if (count >= 2) {
      // Pinch-to-zoom
      const pts  = [...ptrCache.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      if (pinchRef.current !== null) {
        const ratio = dist / pinchRef.current;
        setScale(prev => {
          const next = Math.min(3, Math.max(0.5, prev * ratio));
          setOffset(po => doClamp(
            midX - ((midX - po.x) / prev) * next,
            midY - ((midY - po.y) / prev) * next,
            next
          ));
          return next;
        });
      }
      pinchRef.current = dist;
      return;
    }

    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX, dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 6) { d.moved = true; clearLongPress(); }
    if (d.moved) setOffset(doClamp(d.startOffsetX + dx, d.startOffsetY + dy, scale));
  };

  const onPointerUp = e => {
    ptrCache.current.delete(e.pointerId);
    clearLongPress();
    if (ptrCache.current.size < 2) pinchRef.current = null;

    const d = dragRef.current;
    if (e.pointerType !== 'touch' && canvasRef.current) canvasRef.current.style.cursor = 'grab';

    if (d.active && !d.moved) {
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

  const onPointerCancel = e => {
    ptrCache.current.delete(e.pointerId);
    clearLongPress();
    if (ptrCache.current.size < 2) pinchRef.current = null;
    dragRef.current.active = false;
  };

  const onContextMenu = e => {
    e.preventDefault();
    // Touch long-press is handled above; this fires for desktop right-click only
    if (e.pointerType === 'touch') return;
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

    displayMarkers.forEach(m => {
      if (skipId && m.id === skipId) return;
      if (m._hadPremium) {
        if (m.type === 'Plant'      && !(m.plants?.length))  return;
        if (m.type === 'Enemy'      && !(m.enemies?.length)) return;
        if (m.type === 'Ore'        && !(m.nodes?.length))   return;
        if (m.type === 'Rumor'      && !(m.enemies?.length) && !(m.plants?.length) && !(m.nodes?.length)) return;
        if (m.type === 'Monument'   && !(m.enemies?.length) && !(m.plants?.length) && !(m.nodes?.length) && !(m.workstations?.length)) return;
        if (m.type === 'Major City' && !(m.enemies?.length) && !(m.plants?.length) && !(m.nodes?.length) && !(m.workstations?.length)) return;
      }
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
  }, [canvasSize, displayMarkers, offset, scale, drawTick, getImg, filteredIds, searchIds, settings, previewItem]);

  // ── Helpers ───────────────────────────────────────────────────
  const editToggle = () => {
    if (appMode !== 'view') {
      setAppMode('view'); setTbPanel(null); setPanel(null); setEditTarget(null); setPendingOpen(false); setPreviewItem(null);
    } else {
      setAppMode(authSession?.level === 'admin' ? 'edit' : 'suggest');
    }
  };

  const logout = () => {
    clearSession();
    setSessionAuth('');
    setAuthSession(null);
    setAppMode('view');
    setMarkers([]);
    setSync('connecting');
    setTbPanel(null);
    setPanel(null);
    setEditTarget(null);
    setPendingOpen(false);
    setPreviewItem(null);
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
    const cols = 2, rows = Math.ceil(TYPES.length / cols);
    const pw = 256, ph = rows * 44 + 16;
    let px = panel.screenX + 6, py = panel.screenY + 6;
    if (px + pw > window.innerWidth  - 8) px = panel.screenX - pw - 6;
    if (py + ph > window.innerHeight - 8) py = window.innerHeight - ph - 8;
    return { left: Math.max(8, px), top: Math.max(TOOLBAR_H + 8, py) };
  })() : null;

  const viewMarker = viewCard ? displayMarkers.find(m => m.id === viewCard.id) : null;
  const filterIsOn = filteredIds !== null;

  if (!authSession) {
    return <LoginScreen onLogin={session => {
      setAuthSession(session);
      setSessionAuth(pwForLevel(session.level));
    }} />;
  }

  return (
    <div className="app">
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="tb-left">
          <button className={`tb-btn${appMode==='edit'?' tb-edit':appMode==='suggest'?' tb-suggest':''}`} onClick={editToggle}
            title={appMode !== 'view' ? 'Return to view' : authSession.level === 'admin' ? 'Enter edit mode' : 'Enter suggest mode'}>
            <Ico n={appMode !== 'view' ? 'unlock' : 'lock'} />
          </button>
          {appMode === 'view' && <SearchBar value={searchQuery} onChange={setSearchQuery} />}
          <span className="tb-user">{authSession.name}</span>
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
          {adminUnlocked && (
            <button className={`tb-btn${tbPanel==='logs'?' tb-open':''}`}
              onClick={() => setTbPanel(t => t==='logs' ? null : 'logs')} title="Access log">
              <Ico n="log" />
            </button>
          )}
          {extras.friends && (
            <button className={`tb-btn${extraOpen==='friends' ? ' tb-open tb-extras' : ' tb-extras'}`}
              onClick={() => setExtraOpen(v => v === 'friends' ? null : 'friends')} title="Friends">
              <Ico n="people" />
            </button>
          )}
          {extras.backpack && (
            <button className={`tb-btn${extraOpen==='backpack' ? ' tb-open tb-extras' : ' tb-extras'}`}
              onClick={() => setExtraOpen(v => v === 'backpack' ? null : 'backpack')} title="Backpack">
              <Ico n="bag" />
            </button>
          )}
          <div className="tb-settings-wrap">
            <button className={`tb-btn${tbPanel==='settings'?' tb-open':''}`}
              onClick={() => {
                setTbPanel(t => t==='settings' ? null : 'settings');
                if (showSettingsHint) { setShowSettingsHint(false); localStorage.setItem('keizaal-seen-settings','1'); }
              }} title="Settings">
              <Ico n="settings" />
            </button>
            {showSettingsHint && (
              <div className="settings-hint">
                Help &amp; controls inside
                <span className="settings-hint-arrow" />
              </div>
            )}
          </div>
          <button className="tb-btn tb-logout" onClick={logout} title="Sign out">
            <Ico n="lock" size={14} />
          </button>
        </div>
      </div>

      {/* ── Toolbar panels ── */}
      {tbPanel === 'filter' && (
        <div className="tb-drop tb-drop-right">
          <FilterPanel filter={filter} onChange={setFilter} total={markers.length} visible={visibleCount} adminUnlocked={adminUnlocked} />
        </div>
      )}
      {tbPanel === 'settings' && (
        <div className="tb-drop tb-drop-right">
          <SettingsPanel settings={settings} onChange={setSettings} extras={extras} onExtrasChange={setExtras} />
        </div>
      )}
      {tbPanel === 'logs' && adminUnlocked && (
        <div className="tb-drop tb-drop-right">
          <LogsPanel />
        </div>
      )}

      {/* ── Canvas ── */}
      <div className="canvas-container">
        <canvas ref={canvasRef}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove}
          onPointerUp={onPointerUp} onPointerCancel={onPointerCancel}
          onContextMenu={onContextMenu} onWheel={onWheel} className="map-canvas" />
      </div>

      {/* ── Right-click placement menu ── */}
      {panel?.mode === 'menu' && (
        <div className="ctx-panel" style={menuStyle} onPointerDown={e => e.stopPropagation()}>
          <div className="ctx-grid">
            {TYPES.map(type => (
              <button key={type} className="ctx-item" onClick={() => setPanel({...panel, mode:'form', type})}>
                <span className="ctx-dot" style={{ background: TYPE_COLORS[type] }} />{TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
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
                  apiSuggest({ id:generateId(), action:'add', marker_id:m.id, data:m, original:null, submitted_by: authSession?.name });
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
                  apiSuggest({ id:generateId(), action:'edit', marker_id:updated.id, data:updated, original:editTarget, submitted_by: authSession?.name });
                else
                  apiUpdate(updated);
                setEditTarget(null);
              }}
              onDelete={() => {
                if (appMode === 'suggest')
                  apiSuggest({ id:generateId(), action:'delete', marker_id:editTarget.id, data:null, original:editTarget, submitted_by: authSession?.name });
                else
                  apiDelete(editTarget.id);
                setEditTarget(null);
              }}
              onClose={() => setEditTarget(null)} />
          </div>
        </div>
      )}

      {/* ── Extra sidebars ── */}
      {extraOpen === 'friends'  && extras.friends  && <FriendsSidebar  onClose={() => setExtraOpen(null)} />}
      {extraOpen === 'backpack' && extras.backpack && <BackpackSidebar onClose={() => setExtraOpen(null)} />}

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

const BASE = 'https://thetraderspot.com';

// Set by App after successful login; api calls use whatever is current
let _pw = '';
export function setSessionAuth(pw) { _pw = pw; }

const json = () => ({ 'Content-Type': 'application/json' });
const auth = () => ({ 'Content-Type': 'application/json', 'X-KW-Auth': _pw });
const hdr  = () => ({ 'X-KW-Auth': _pw });

export function subscribeMarkers(onData, onStatus, onPendingUpdate) {
  let current = [];
  onStatus('connecting');

  fetch(`${BASE}/keizaal/markers`)
    .then(r => r.json())
    .then(markers => { current = markers; onData([...current]); onStatus('live'); })
    .catch(() => onStatus('error'));

  const es = new EventSource(`${BASE}/keizaal/stream`);

  es.addEventListener('add', e => {
    const m = JSON.parse(e.data);
    current = [...current.filter(x => x.id !== m.id), m];
    onData([...current]);
  });
  es.addEventListener('update', e => {
    const m = JSON.parse(e.data);
    current = current.map(x => x.id === m.id ? m : x);
    onData([...current]);
  });
  es.addEventListener('delete', e => {
    const { id } = JSON.parse(e.data);
    current = current.filter(x => x.id !== id);
    onData([...current]);
  });
  es.addEventListener('pending-update', () => {
    if (onPendingUpdate) onPendingUpdate();
  });

  es.onerror = () => onStatus('error');

  return () => es.close();
}

// Admin marker mutations
export const apiAdd    = (m)  => fetch(`${BASE}/keizaal/markers`,         { method:'POST',   headers: auth(), body: JSON.stringify(m) });
export const apiUpdate = (m)  => fetch(`${BASE}/keizaal/markers/${m.id}`, { method:'PUT',    headers: auth(), body: JSON.stringify(m) });
export const apiDelete = (id) => fetch(`${BASE}/keizaal/markers/${id}`,   { method:'DELETE', headers: auth() });

// Suggestions
export const apiSuggest = (p) => fetch(`${BASE}/keizaal/pending`, { method:'POST', headers: auth(), body: JSON.stringify(p) });

// Admin pending management
export const apiGetPending     = ()   => fetch(`${BASE}/keizaal/pending`,               { headers: hdr() });
export const apiApprovePending = (id) => fetch(`${BASE}/keizaal/pending/${id}/approve`, { method:'POST', headers: hdr() });
export const apiDenyPending    = (id) => fetch(`${BASE}/keizaal/pending/${id}/deny`,    { method:'POST', headers: hdr() });

// Auth log
export const apiLogAuth    = (body) => fetch(`${BASE}/keizaal/auth-log`, { method:'POST', headers: json(), body: JSON.stringify(body) });
export const apiGetAuthLog = ()     => fetch(`${BASE}/keizaal/auth-log`, { headers: hdr() });

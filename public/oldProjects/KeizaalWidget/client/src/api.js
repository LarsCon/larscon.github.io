const BASE           = 'https://thetraderspot.com';
const AUTH           = 'lizard';
const COMMENTER_AUTH = 'bigwetnoodle';

const headers          = { 'Content-Type': 'application/json', 'X-KW-Auth': AUTH };
const commenterHeaders = { 'Content-Type': 'application/json', 'X-KW-Auth': COMMENTER_AUTH };

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
export const apiAdd    = (m)  => fetch(`${BASE}/keizaal/markers`,         { method:'POST',   headers, body: JSON.stringify(m) });
export const apiUpdate = (m)  => fetch(`${BASE}/keizaal/markers/${m.id}`, { method:'PUT',    headers, body: JSON.stringify(m) });
export const apiDelete = (id) => fetch(`${BASE}/keizaal/markers/${id}`,   { method:'DELETE', headers });

// Commenter suggestions
export const apiSuggest = (p) => fetch(`${BASE}/keizaal/pending`, { method:'POST', headers: commenterHeaders, body: JSON.stringify(p) });

// Admin pending management
export const apiGetPending     = ()   => fetch(`${BASE}/keizaal/pending`,             { headers: { 'X-KW-Auth': AUTH } });
export const apiApprovePending = (id) => fetch(`${BASE}/keizaal/pending/${id}/approve`, { method:'POST', headers: { 'X-KW-Auth': AUTH } });
export const apiDenyPending    = (id) => fetch(`${BASE}/keizaal/pending/${id}/deny`,    { method:'POST', headers: { 'X-KW-Auth': AUTH } });

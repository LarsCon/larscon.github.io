const BASE = 'https://thetraderspot.com';
const AUTH = 'lizard';

const headers = { 'Content-Type': 'application/json', 'X-KW-Auth': AUTH };

export function subscribeMarkers(onData, onStatus) {
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

  es.onerror = () => onStatus('error');

  return () => es.close();
}

export const apiAdd    = (m)  => fetch(`${BASE}/keizaal/markers`,          { method:'POST',   headers, body: JSON.stringify(m) });
export const apiUpdate = (m)  => fetch(`${BASE}/keizaal/markers/${m.id}`,  { method:'PUT',    headers, body: JSON.stringify(m) });
export const apiDelete = (id) => fetch(`${BASE}/keizaal/markers/${id}`,    { method:'DELETE', headers });

// Chùa Bạch Quả EZ: serves the page and relays each player's presence to everyone else.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 80;
// the page may sit in public/ or next to this file
const pagePath = [path.join(__dirname, 'public', 'index.html'), path.join(__dirname, 'index.html')].find((p) => fs.existsSync(p));
const page = fs.readFileSync(pagePath);

// optional music files: drop nhac-chua.mp3 / nhac-thien.mp3 next to this file (or in public/)
const MUSIC = ['nhac-chua.mp3', 'nhac-thien.mp3'];
function findFile(name) {
  return [path.join(__dirname, name), path.join(__dirname, 'public', name)].find((p) => fs.existsSync(p));
}
function sendAudio(req, res, file) {
  const size = fs.statSync(file).size;
  const head = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=3600' };
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) {
    const start = m[1] ? parseInt(m[1], 10) : 0;
    const end = m[2] ? Math.min(parseInt(m[2], 10), size - 1) : size - 1;
    if (start >= size || start > end) { res.writeHead(416, { 'Content-Range': 'bytes */' + size }); return res.end(); }
    res.writeHead(206, Object.assign(head, { 'Content-Length': end - start + 1, 'Content-Range': 'bytes ' + start + '-' + end + '/' + size }));
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, Object.assign(head, { 'Content-Length': size }));
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : page);
  } else if (url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  } else if (MUSIC.includes(url.slice(1)) && findFile(url.slice(1))) {
    sendAudio(req, res, findFile(url.slice(1)));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Không tìm thấy trang');
  }
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 8192 });
const clients = new Map();
let seq = 0;

function broadcast(obj, except) {
  const text = JSON.stringify(obj);
  for (const ws of clients.keys()) {
    if (ws !== except && ws.readyState === 1) ws.send(text);
  }
}

wss.on('connection', (ws) => {
  if (clients.size >= MAX_PLAYERS) { ws.close(1013, 'full'); return; }
  const me = {
    id: 'p' + (++seq).toString(36) + Math.random().toString(36).slice(2, 6),
    presence: {}, tokens: 40, last: Date.now(), alive: true,
  };
  clients.set(ws, me);
  const peers = [...clients.values()]
    .filter((c) => c !== me && Object.keys(c.presence).length)
    .map((c) => ({ peer: c.id, presence: c.presence }));
  ws.send(JSON.stringify({ t: 'hello', you: me.id, peers }));

  ws.on('pong', () => { me.alive = true; });
  ws.on('message', (buf) => {
    // simple rate limit: about 20 messages a second, bursts up to 40
    const now = Date.now();
    me.tokens = Math.min(40, me.tokens + ((now - me.last) / 1000) * 20);
    me.last = now;
    if (me.tokens < 1) return;
    me.tokens -= 1;
    let msg;
    try { msg = JSON.parse(buf); } catch (e) { return; }
    if (!msg || msg.t !== 'p' || !msg.patch || typeof msg.patch !== 'object' || Array.isArray(msg.patch)) return;
    const next = Object.assign({}, me.presence);
    for (const [k, v] of Object.entries(msg.patch)) {
      if (!/^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(k)) continue;
      if (v === null) delete next[k];
      else if (typeof v === 'number' && Number.isFinite(v)) next[k] = v;
      else if (typeof v === 'string') next[k] = v.slice(0, 200);
      else if (typeof v === 'boolean') next[k] = v;
    }
    if (JSON.stringify(next).length > 4096) return;
    me.presence = next;
    broadcast({ t: 'p', peer: me.id, presence: next }, ws);
  });
  ws.on('close', () => {
    clients.delete(ws);
    broadcast({ t: 'leave', peer: me.id });
  });
});

// drop connections that stopped answering
setInterval(() => {
  for (const [ws, c] of clients) {
    if (!c.alive) { ws.terminate(); continue; }
    c.alive = false;
    try { ws.ping(); } catch (e) { /* ignore */ }
  }
}, 25000);

server.listen(PORT, () => console.log('Chùa Bạch Quả EZ đang chạy ở cổng ' + PORT));

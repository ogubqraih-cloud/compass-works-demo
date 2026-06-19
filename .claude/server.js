const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.ico':'image/x-icon' };
// ローカル開発用：/api/chat を Vercel関数と同じロジックで処理（本番は api/chat.js）
let chatCore = null;
try { chatCore = require('../api/_chat-core'); } catch (e) { /* SDK未インストール時はチャット無効 */ }

http.createServer((req, res) => {
  // --- チャットAPI（ローカル検証用） ---
  if (req.url.split('?')[0] === '/api/chat') {
    if (req.method !== 'POST') { res.writeHead(405); res.end('Method Not Allowed'); return; }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 100000) req.destroy(); });
    req.on('end', async () => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      try {
        if (!chatCore) throw Object.assign(new Error('sdk missing'), { code: 'NO_KEY' });
        const json = JSON.parse(body || '{}');
        const reply = await chatCore.chat(json.messages);
        res.writeHead(200); res.end(JSON.stringify({ reply }));
      } catch (e) {
        const status = e && e.code === 'BAD_INPUT' ? 400 : 500;
        res.writeHead(status);
        res.end(JSON.stringify({ error: status === 400 ? '入力が不正です' : 'サーバーエラー（ローカルは ANTHROPIC_API_KEY を export してください）' }));
      }
    });
    return;
  }

  let p = decodeURIComponent(req.url.split('?')[0]);
  // ディレクトリURL（/ や /about/ や拡張子なし）は index.html を返す
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  const file = path.join(root, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' }); res.end('404 Not Found'); return; }
    const type = types[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type + (type.startsWith('text/')||type.includes('javascript') ? '; charset=utf-8' : '') });
    res.end(data);
  });
}).listen(4321, () => console.log('listening on 4321'));

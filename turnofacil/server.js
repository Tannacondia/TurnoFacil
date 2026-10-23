// Servidor local mínimo para la demo; solo escucha en la computadora local.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Solicitud inválida'); return; }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end('Acceso denegado'); return; }
  fs.readFile(filePath, (error, body) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('No se pudo abrir el archivo'); return; }
    response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}).listen(8000, '127.0.0.1', () => {
  console.log('TurnoFácil: http://127.0.0.1:8000');
});

/**
 * Tiny static file server — no dependencies, works anywhere Node runs.
 *
 *   npm start            serve on http://localhost:8777
 *   PORT=3000 npm start  serve on a port you choose
 *
 * The site uses ES modules, which browsers refuse to load over file://,
 * so it has to be served over HTTP. That is all this does.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const FIRST_PORT = Number(process.env.PORT) || 8777;
const MAX_PORT_TRIES = 12;

/** Correct types matter: a .js file served as text/plain will not load as a module. */
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map':  'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8'
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';

    // Resolve inside ROOT only — never serve anything above the project folder.
    const filePath = resolve(join(ROOT, pathname));
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('403 Forbidden');
    }

    const info = await stat(filePath);
    const target = info.isDirectory() ? join(filePath, 'index.html') : filePath;
    const body = await readFile(target);

    res.writeHead(200, {
      'content-type': TYPES[extname(target).toLowerCase()] || 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-cache'
    });
    res.end(body);
  } catch (err) {
    const missing = err.code === 'ENOENT' || err.code === 'ENOTDIR';
    res.writeHead(missing ? 404 : 500, { 'content-type': 'text/html; charset=utf-8' });
    res.end(missing
      ? `<h1>404</h1><p>No file at <code>${req.url}</code></p><p><a href="/">Back to YourUni</a></p>`
      : `<h1>500</h1><pre>${err.message}</pre>`);
  }
});

/** If the port is busy, step up rather than dying with an opaque EADDRINUSE. */
function listen(port, triesLeft) {
  server.once('error', err => {
    if (err.code === 'EADDRINUSE' && triesLeft > 0) {
      console.log(`  port ${port} is busy, trying ${port + 1}…`);
      return listen(port + 1, triesLeft - 1);
    }
    console.error(`\n  Could not start the server: ${err.message}\n`);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(`\n  YourUni is running\n`);
    console.log(`  →  http://localhost:${port}\n`);
    console.log(`  Serving ${ROOT}`);
    console.log(`  Press Ctrl+C to stop.\n`);
  });
}

listen(FIRST_PORT, MAX_PORT_TRIES);
